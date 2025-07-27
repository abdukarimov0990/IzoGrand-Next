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

// Fayl yo‘lini aniqlash
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const welcomePhotoPath = path.join(__dirname, '../public/img/welcome.jpg')

// Botni yaratish
const bot = new Telegraf(process.env.BOT_TOKEN)
const adminIds = (process.env.ADMINS || '')
  .split(',')
  .map(id => id.trim())
  .filter(Boolean)

// Faqat adminlar uchun ruxsat
const isAdmin = (ctx) => ctx.from && adminIds.includes(String(ctx.from.id))

// Kiritilgan ma'lumotlarni tozalovchi funksiya
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

// Mahsulot yoki xizmat qo‘shish sahnasi
const addScene = new Scenes.WizardScene(
  'add-scene',
  async (ctx) => {
    if (!isAdmin(ctx)) return ctx.reply('❌ Sizda ruxsat yo‘q.')
    await ctx.reply('🔸 Nima qo‘shmoqchisiz?', {
      reply_markup: {
        keyboard: [['Mahsulot'], ['Xizmat'], ['❌ Bekor qilish']],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    })
    return ctx.wizard.next()
  },
  async (ctx) => {
    if (ctx.message?.text === '❌ Bekor qilish') return cancelWizard(ctx)
    const type = ctx.message?.text?.toLowerCase()
    if (!['mahsulot', 'xizmat'].includes(type)) return ctx.reply("❗ Faqat 'Mahsulot' yoki 'Xizmat' tanlang.")
    ctx.wizard.state.displayType = type
    ctx.wizard.state.type = type === 'mahsulot' ? 'product' : 'work'
    await ctx.reply(`📝 ${type.charAt(0).toUpperCase() + type.slice(1)} nomini yuboring:`)
    return ctx.wizard.next()
  },
  async (ctx) => {
    if (ctx.message?.text === '❌ Bekor qilish') return cancelWizard(ctx)
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
    if (ctx.message?.text === '❌ Bekor qilish') return cancelWizard(ctx)
    const price = parseFloat(ctx.message?.text)
    if (isNaN(price)) return ctx.reply('❗ Faqat son yuboring.')
    ctx.wizard.state.price = price
    ctx.wizard.state.imgPaths = []
    await ctx.reply('🖼 Rasm(lar)ni yuboring:')
    return ctx.wizard.next()
  },
  async (ctx) => {
    if (ctx.message?.text === '❌ Bekor qilish') return cancelWizard(ctx)
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
    if (ctx.message?.text === '❌ Bekor qilish') return cancelWizard(ctx)
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
      await ctx.reply(`✅ ${ctx.wizard.state.displayType.charAt(0).toUpperCase() + ctx.wizard.state.displayType.slice(1)} saqlandi.`, {
        reply_markup: { remove_keyboard: true },
      })
    } catch (err) {
      console.error('❌ Bazaga yozishda xatolik:', err)
      await ctx.reply('❌ Bazaga yozishda xatolik yuz berdi.')
    }
    return ctx.scene.leave()
  }
)

// Mahsulot yoki xizmatni o‘chirish sahnasi
const deleteScene = new Scenes.WizardScene(
  'delete-scene',
  async (ctx) => {
    if (!isAdmin(ctx)) return ctx.reply('❌ Sizda ruxsat yo‘q.')
    await ctx.reply('🔸 Nima o‘chirmoqchisiz?', {
      reply_markup: {
        keyboard: [['Mahsulot'], ['Xizmat'], ['❌ Bekor qilish']],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    })
    return ctx.wizard.next()
  },
  async (ctx) => {
    if (ctx.message?.text === '❌ Bekor qilish') return cancelWizard(ctx)
    const type = ctx.message?.text?.toLowerCase()
    if (!['mahsulot', 'xizmat'].includes(type)) return ctx.reply("❗ Faqat 'Mahsulot' yoki 'Xizmat' tanlang.")
    ctx.wizard.state.displayType = type
    ctx.wizard.state.type = type === 'mahsulot' ? 'product' : 'work'
    await ctx.reply("📝 O‘chirmoqchi bo‘lgan nomni yuboring:")
    return ctx.wizard.next()
  },
  async (ctx) => {
    if (ctx.message?.text === '❌ Bekor qilish') return cancelWizard(ctx)
    const name = ctx.message?.text?.trim()
    if (!name) return ctx.reply('❗ Iltimos, nom kiriting.')
    try {
      const colName = ctx.wizard.state.type === 'product' ? 'products' : 'works'
      const q = query(collection(db, colName), where('name', '==', name), limit(1))
      const snapshot = await getDocs(q)
      if (snapshot.empty) return ctx.reply("❌ Bunday nomli element topilmadi.")
      const docId = snapshot.docs[0].id
      await deleteDoc(doc(db, colName, docId))
      await ctx.reply(`✅ ${ctx.wizard.state.displayType.charAt(0).toUpperCase() + ctx.wizard.state.displayType.slice(1)} "${name}" muvaffaqiyatli o‘chirildi.`, {
        reply_markup: { remove_keyboard: true },
      })
    } catch (err) {
      console.error('❌ O‘chirishda xatolik:', err)
      await ctx.reply("❌ O‘chirishda xatolik yuz berdi.")
    }
    return ctx.scene.leave()
  }
)

// Bekor qilish funksiyasi
const cancelWizard = async (ctx) => {
  await ctx.reply('❌ Amaliyot bekor qilindi.', {
    reply_markup: { remove_keyboard: true },
  })
  return ctx.scene.leave()
}

// Bot sahnalari
const stage = new Scenes.Stage([addScene, deleteScene])
bot.use(session())
bot.use(stage.middleware())

// /start komandasi
bot.start(async (ctx) => {
  const name = ctx.from?.username ? `@${ctx.from.username}` : ctx.from?.first_name || 'Foydalanuvchi'
  try {
    await ctx.replyWithPhoto({ source: fs.createReadStream(welcomePhotoPath) })
  } catch {}
  await ctx.reply(
    `✨️ Assalomu alaykum, ${name}
✅️ Ushbu bot izogrand.uz saytining admin paneli hisoblanadi!
🚫 Botdan faqat adminlar foydalana oladi.

👨‍💻 Buyruqlar:
- /add — Mahsulot yoki xizmat qo‘shish
- /delete — Mahsulot yoki xizmatni o‘chirish
- /menu — Menyu
- /cancel — Bekor qilish`,
    {
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [['/add', '/delete'], ['/menu', '/cancel']],
        resize_keyboard: true,
      },
    }
  )
})

// Buyruqlar
bot.command('add', (ctx) => isAdmin(ctx) ? ctx.scene.enter('add-scene') : ctx.reply('❌ Sizda ruxsat yo‘q.'))
bot.command('delete', (ctx) => isAdmin(ctx) ? ctx.scene.enter('delete-scene') : ctx.reply('❌ Sizda ruxsat yo‘q.'))
bot.command('cancel', cancelWizard)

bot.command('menu', async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply('❌ Sizda ruxsat yo‘q.')
  await ctx.reply(
    `📋 <b>Asosiy Menyu</b>

🛒 <b>Qo‘shish:</b> /add
🗑 <b>O‘chirish:</b> /delete
ℹ️ <b>Yordam:</b> /help`,
    { parse_mode: 'HTML' }
  )
})

bot.command('help', (ctx) => {
  ctx.reply(
    `🆘 <b>Yordam</b>

1. <b>/add</b> — Mahsulot yoki xizmat qo‘shish.
2. <b>/delete</b> — Mahsulot yoki xizmatni o‘chirish.
3. <b>/menu</b> — Asosiy buyruqlar ro‘yxati.

⚠️ Faqat <b>adminlar</b> foydalanishi mumkin.`,
    { parse_mode: 'HTML' }
  )
})

// Express serverni ishga tushirish
const app = express()
const PORT = process.env.PORT || 3000
app.use(bot.webhookCallback('/bot'))
bot.telegram.setWebhook(`https://izogrand-next.onrender.com/bot`)
app.get('/', (req, res) => res.send('🤖 Telegram bot ishlamoqda.'))
app.listen(PORT, () => {
  console.log(`🌐 Web server tinglamoqda: http://localhost:${PORT}`)
})
