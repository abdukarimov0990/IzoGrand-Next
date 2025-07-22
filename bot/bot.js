// ✅ Yangi, to'liq ishlaydigan bot.js fayli
import dotenv from 'dotenv'
dotenv.config()

import { Telegraf, Scenes, session } from 'telegraf'
import axios from 'axios'
import { db } from '../lib/firebase.js'
import { uploadToImgBB } from '../lib/uploadToImgBB.js'
import { collection, addDoc } from 'firebase/firestore'

const bot = new Telegraf(process.env.BOT_TOKEN)
const adminIds = (process.env.ADMINS || '')
  .split(',')
  .map(id => id.trim())
  .filter(Boolean)

// 🔧 Ma'lumotni tozalovchi kuchliroq funksiya
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

const stage = new Scenes.Stage([addScene])
bot.use(session())
bot.use(stage.middleware())

bot.start((ctx) => {
  ctx.reply('👋 Assalomu alaykum!\n\n🛠 Ma\'lumot qo\'shish uchun /add buyrug\'idan foydalaning.')
})

bot.command('add', (ctx) => {
  if (!adminIds.includes(String(ctx.from.id))) {
    return ctx.reply("❌ Sizda ruxsat yo'q.")
  }
  ctx.scene.enter('add-scene')
})

bot.launch().then(() => {
  console.log('🤖 Bot ishga tushdi. Firestore + ImgBB bilan ulandi.')
})
