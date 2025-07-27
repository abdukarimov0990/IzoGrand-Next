// ================= MODULLAR ===================
import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Telegraf, Scenes, session } from 'telegraf'
import axios from 'axios'
import { db } from '../lib/firebase.js'
import { uploadToImgBB } from '../lib/uploadToImgBB.js'
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  limit,
  doc,
  deleteDoc
} from 'firebase/firestore'

// ================= __dirname YARATISH ===================
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ================= PATH - WELCOME RASM ===================
const welcomePhotoPath = path.join(__dirname, '../public/img/welcome.jpg')

// ================= BOT O'RINATISH ===================
const bot = new Telegraf(process.env.BOT_TOKEN)
const adminIds = (process.env.ADMINS || '')
  .split(',')
  .map(id => id.trim())
  .filter(Boolean)

const sanitizeData = (obj) => {
  const cleaned = {}
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined || val === null || typeof val === 'function') continue
    if (typeof val === 'number' && isNaN(val)) continue

    if (Array.isArray(val)) {
      const filtered = val.filter(v => typeof v === 'string' && v.trim())
      if (filtered.length > 0) cleaned[key] = filtered
    } else {
      cleaned[key] = val
    }
  }
  return cleaned
}

// ================= ADD SCENE ===================
const addScene = new Scenes.WizardScene(
  'add-scene',
  async (ctx) => {
    if (!adminIds.includes(String(ctx.from.id))) {
      return ctx.reply('❌ Sizda ruxsat yo\'q.')
    }

    await ctx.reply('🔸 Nima qo\'shmoqchisiz?', {
      reply_markup: {
        keyboard: [['product'], ['work']],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    })
    return ctx.wizard.next()
  },

  async (ctx) => {
    const type = ctx.message?.text?.toLowerCase()
    if (!['product', 'work'].includes(type)) {
      return ctx.reply("❗ Faqat 'product' yoki 'work' tanlang.")
    }
    ctx.wizard.state.type = type
    await ctx.reply(`📝 ${type === 'product' ? 'Mahsulot' : 'Xizmat'} nomini yuboring:`)
    return ctx.wizard.next()
  },

  async (ctx) => {
    const name = ctx.message?.text?.trim()
    if (!name) return ctx.reply('❗ Iltimos, nom kiriting.')
    ctx.wizard.state.name = name

    if (ctx.wizard.state.type === 'product') {
      await ctx.reply('💵 Narxni yuboring (faqat son):')
      return ctx.wizard.next()
    } else {
      ctx.wizard.state.imgPaths = []
      await ctx.reply('🖼 Rasm(lar)ni yuboring:')
      ctx.wizard.selectStep(4)
    }
  },

  async (ctx) => {
    const price = parseFloat(ctx.message?.text)
    if (isNaN(price)) return ctx.reply('❗ Faqat son yuboring.')
    ctx.wizard.state.price = price
    ctx.wizard.state.imgPaths = []
    await ctx.reply('🖼 Rasm(lar)ni yuboring:')
    return ctx.wizard.next()
  },

  async (ctx) => {
    if (ctx.message?.photo) {
      const photo = ctx.message.photo.at(-1)
      const file = await ctx.telegram.getFile(photo.file_id)
      const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`

      try {
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' })
        const imgbbUrl = await uploadToImgBB(Buffer.from(response.data), `img_${Date.now()}`)

        if (imgbbUrl) {
          ctx.wizard.state.imgPaths.push(imgbbUrl)
          return ctx.reply('✅ Rasm yuklandi. Yana yuboring yoki davom etish uchun matn yuboring.')
        } else {
          return ctx.reply('❌ Rasm yuklashda xatolik. Qayta urinib ko\'ring.')
        }
      } catch (err) {
        console.error('❌ Rasm yuklashda xatolik:', err)
        return ctx.reply('❌ Rasmni yuklashda xatolik yuz berdi.')
      }
    }

    if (
      ctx.message?.text?.trim() &&
      Array.isArray(ctx.wizard.state.imgPaths) &&
      ctx.wizard.state.imgPaths.length > 0
    ) {
      await ctx.reply('📝 Tavsifni yuboring:')
      return ctx.wizard.next()
    }

    return ctx.reply('❗ Avval rasm yuboring yoki davom etish uchun matn yuboring.')
  },

  async (ctx) => {
    const desc = ctx.message?.text?.trim()
    if (!desc) return ctx.reply('❗ Tavsifni kiriting.')
    ctx.wizard.state.desc = desc

    try {
      const item = {
        name: ctx.wizard.state.name,
        desc: ctx.wizard.state.desc,
        img: ctx.wizard.state.imgPaths,
        ...(ctx.wizard.state.type === 'product' ? { price: ctx.wizard.state.price } : {}),
      }

      const cleanItem = sanitizeData(item)
      const colRef = collection(db, ctx.wizard.state.type === 'product' ? 'products' : 'works')

      await addDoc(colRef, cleanItem)
      await ctx.reply(`✅ ${ctx.wizard.state.type === 'product' ? 'Mahsulot' : 'Xizmat'} saqlandi.`)
    } catch (err) {
      console.error('❌ Firestore xatosi:', err)
      await ctx.reply('❌ Bazaga yozishda xatolik yuz berdi.')
    }

    return ctx.scene.leave()
  }
)

// ================= DELETE SCENE ===================
const deleteScene = new Scenes.WizardScene(
  'delete-scene',
  async (ctx) => {
    if (!adminIds.includes(String(ctx.from.id))) {
      return ctx.reply("❌ Sizda ruxsat yo'q.")
    }

    await ctx.reply("🔸 Nima o'chirmoqchisiz?", {
      reply_markup: {
        keyboard: [['product'], ['work']],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    })
    return ctx.wizard.next()
  },

  async (ctx) => {
    const type = ctx.message?.text?.toLowerCase()
    if (!['product', 'work'].includes(type)) {
      return ctx.reply("❗ Faqat 'product' yoki 'work' tanlang.")
    }
    ctx.wizard.state.type = type
    await ctx.reply("📝 O'chirmoqchi bo'lgan element nomini yozing:")
    return ctx.wizard.next()
  },

  async (ctx) => {
    const name = ctx.message?.text?.trim()
    if (!name) return ctx.reply('❗ Iltimos, nom kiriting.')

    try {
      const colName = ctx.wizard.state.type === 'product' ? 'products' : 'works'
      const colRef = collection(db, colName)

      const q = query(colRef, where('name', '==', name), limit(1))
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        return ctx.reply("❌ Bunday nomli element topilmadi.")
      }

      const docId = snapshot.docs[0].id
      await deleteDoc(doc(db, colName, docId))

      await ctx.reply(`✅ ${ctx.wizard.state.type} "${name}" muvaffaqiyatli o'chirildi.`)
    } catch (err) {
      console.error('❌ O‘chirishda xatolik:', err)
      await ctx.reply("❌ O'chirishda xatolik yuz berdi.")
    }

    return ctx.scene.leave()
  }
)

// ================= BOT SETTINGS ===================
const stage = new Scenes.Stage([addScene, deleteScene])
bot.use(session())
bot.use(stage.middleware())

bot.start(async (ctx) => {
  const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name

  try {
    await ctx.replyWithPhoto({ source: fs.createReadStream(welcomePhotoPath) })
  } catch (err) {
    console.warn('⚠️ Rasm topilmadi yoki o‘qib bo‘lmadi:', err.message)
  }

  await ctx.reply(
    `✨️ Assalomu alaykum, ${username}!\n` +
    `✅️ Ushbu bot izogrand.uz saytining admin paneli hisoblanadi.\n` +
    `🚫 Faqat adminlar foydalanishi mumkin.\n` +
    `👨‍💻 Adminmisiz? Unda /add yoki /delete buyrug'ini bering.`
  )
})

bot.command('add', (ctx) => {
  if (!adminIds.includes(String(ctx.from.id))) {
    return ctx.reply("❌ Sizda ruxsat yo'q.")
  }
  ctx.scene.enter('add-scene')
})

bot.command('delete', (ctx) => {
  if (!adminIds.includes(String(ctx.from.id))) {
    return ctx.reply("❌ Sizda ruxsat yo'q.")
  }
  ctx.scene.enter('delete-scene')
})

// ================= EXPRESS + WEBHOOK ===================
const app = express()
const PORT = process.env.PORT || 3000

app.use(bot.webhookCallback('/bot'))

// Webhook ulash (TOKEN orqali)
bot.telegram.setWebhook(`https://izogrand-next.onrender.com/bot`)

app.get('/', (req, res) => {
  res.send('🤖 Telegram bot ishlamoqda.')
})

app.listen(PORT, () => {
  console.log(`🌐 Web server tinglamoqda: http://localhost:${PORT}`)
})
