// bot.js

import dotenv from 'dotenv'
dotenv.config()

import { Telegraf, Scenes, session } from 'telegraf'
import axios from 'axios'
import { db } from '../lib/firebase.js'
import { uploadToImgBB } from '../lib/uploadToImgBB.js'
import { collection, addDoc } from 'firebase/firestore'

const bot = new Telegraf(process.env.BOT_TOKEN)
let adminIds = process.env.ADMINS?.split(',').map(id => id.trim()) || []

const addScene = new Scenes.WizardScene(
  'add-scene',
  async (ctx) => {
    if (!adminIds.includes(String(ctx.from.id))) {
      return ctx.reply("❌ Sizda ruxsat yo'q.")
    }
    await ctx.reply("🔸 Nima qo'shmoqchisiz? (product/work)")
    return ctx.wizard.next()
  },
  async (ctx) => {
    const type = ctx.message?.text?.toLowerCase()
    if (!['product', 'work'].includes(type)) {
      return ctx.reply("❗ Iltimos, 'product' yoki 'work' deb yozing.")
    }
    ctx.wizard.state.type = type
    await ctx.reply(`🔸 ${type === 'product' ? 'Mahsulot' : 'Xizmat'} nomini yuboring:`)
    return ctx.wizard.next()
  },
  async (ctx) => {
    if (!ctx.message?.text) return ctx.reply("❗ Iltimos, matn yuboring.")
    ctx.wizard.state.name = ctx.message.text

    if (ctx.wizard.state.type === 'product') {
      await ctx.reply('💵 Narxini yuboring (faqat son):')
      return ctx.wizard.next()
    } else {
      await ctx.reply('🖼 Rasm(lar)ni yuboring:')
      ctx.wizard.state.imgPaths = []
      ctx.wizard.selectStep(4)
      return
    }
  },
  async (ctx) => {
    const price = parseFloat(ctx.message?.text)
    if (isNaN(price)) return ctx.reply("❗ Narxni son shaklida yuboring.")
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
        const fileName = `img_${Date.now()}`
        const imgbbUrl = await uploadToImgBB(Buffer.from(response.data), fileName)

        ctx.wizard.state.imgPaths.push(imgbbUrl)
        await ctx.reply(`✅ Rasm yuklandi: ${imgbbUrl}\nYana yuboring yoki davom etish uchun matn yuboring.`)
      } catch (err) {
        console.error('❌ Rasm yuklashda xatolik:', err)
        await ctx.reply("❌ Rasmni yuklashda xatolik yuz berdi.")
      }
      return
    }

    if (ctx.message?.text && ctx.wizard.state.imgPaths.length > 0) {
      await ctx.reply('📝 Tavsifni yuboring:')
      return ctx.wizard.next()
    }

    await ctx.reply("❗ Rasm yuboring yoki matn bilan davom eting.")
  },
  async (ctx) => {
    if (!ctx.message?.text) return ctx.reply("❗ Tavsif matnini yuboring.")
    ctx.wizard.state.desc = ctx.message.text

    try {
      const item = {
        name: ctx.wizard.state.name,
        img: ctx.wizard.state.imgPaths,
        desc: ctx.wizard.state.desc,
      }

      if (ctx.wizard.state.type === 'product') {
        item.price = ctx.wizard.state.price
      }

      const colRef = collection(db, ctx.wizard.state.type === 'product' ? 'products' : 'works')
      await addDoc(colRef, item)

      await ctx.reply(`✅ ${ctx.wizard.state.type === 'product' ? 'Mahsulot' : 'Xizmat'} muvaffaqiyatli saqlandi!`)
    } catch (err) {
      console.error('❌ Bazaga yozishda xato:', err)
      await ctx.reply("❌ Bazaga yozishda xatolik yuz berdi.")
    }

    return ctx.scene.leave()
  }
)

const stage = new Scenes.Stage([addScene])
bot.use(session())
bot.use(stage.middleware())

bot.start((ctx) => {
  ctx.reply(`👋 Assalomu alaykum!\n📌 Ma'lumot qo'shish uchun: /add\n📌 Yangi admin qo'shish: /addAdmin`)
})

bot.command('add', (ctx) => {
  if (!adminIds.includes(String(ctx.from.id))) {
    return ctx.reply("❌ Sizda bu amal uchun ruxsat yo'q.")
  }
  ctx.scene.enter('add-scene')
})

bot.launch().then(() => console.log('🤖 Bot ishga tushdi — rasmlar ImgBB.com orqali yuklanmoqda'))
