require('dotenv').config();
const { Telegraf, Scenes, session } = require('telegraf');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const db = require('../lib/firebase');
const { collection, addDoc } = require('firebase/firestore');

// Bot token
const bot = new Telegraf(process.env.BOT_TOKEN);

// Adminlar
let adminIds = process.env.ADMINS?.split(',').map(id => id.trim()) || [];

// 🔧 Kataloglar
const publicDir = path.join(__dirname, '..', 'public');
const imgDir = path.join(publicDir, 'img');

[publicDir, imgDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Add Scene
const addScene = new Scenes.WizardScene(
  'add-scene',
  async (ctx) => {
    if (!adminIds.includes(String(ctx.from.id))) {
      return ctx.reply("❌ Sizda ruxsat yo'q.");
    }
    await ctx.reply("🔸 Nima qo'shmoqchisiz? (product/work)");
    return ctx.wizard.next();
  },
  async (ctx) => {
    const type = ctx.message?.text?.toLowerCase();
    if (!['product', 'work'].includes(type)) {
      await ctx.reply("❗ Iltimos, 'product' yoki 'work' deb yozing.");
      return;
    }
    ctx.wizard.state.type = type;
    await ctx.reply(`🔸 ${type === 'product' ? 'Mahsulot' : 'Xizmat'} nomini yuboring:`);
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message?.text) return ctx.reply("❗ Iltimos, matn yuboring.");
    ctx.wizard.state.name = ctx.message.text;

    if (ctx.wizard.state.type === 'product') {
      await ctx.reply('💵 Narxini yuboring (faqat son):');
      return ctx.wizard.next();
    } else {
      await ctx.reply('🖼 Rasm(lar)ni yuboring (bir nechta rasm yuborishingiz mumkin):');
      ctx.wizard.state.imgPaths = [];
      ctx.wizard.selectStep(4);
      return;
    }
  },
  async (ctx) => {
    const price = parseFloat(ctx.message?.text);
    if (isNaN(price)) return ctx.reply("❗ Narxni son shaklida yuboring.");
    ctx.wizard.state.price = price;
    ctx.wizard.state.imgPaths = [];
    await ctx.reply('🖼 Rasm(lar)ni yuboring (bir nechta rasm yuborishingiz mumkin):');
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (ctx.message?.photo) {
      const photo = ctx.message.photo.at(-1);
      const file = await ctx.telegram.getFile(photo.file_id);
      const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
      const ext = path.extname(file.file_path) || '.jpg';
      const filename = `img_${Date.now()}${ext}`;
      const filePath = path.join(imgDir, filename);

      try {
        const response = await axios.get(fileUrl, { responseType: 'stream' });
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
        const relativePath = path.join('img', filename).replace(/\\/g, '/');
        ctx.wizard.state.imgPaths.push(relativePath);
        await ctx.reply(`✅ Rasm saqlandi (${ctx.wizard.state.imgPaths.length}-rasm). Yana yuboring yoki matn yuborib davom eting.`);
      } catch (err) {
        console.error('❌ Rasmni saqlashda xato:', err);
        await ctx.reply('❌ Rasmni saqlashda xatolik yuz berdi.');
      }
      return;
    }

    if (ctx.message?.text && ctx.wizard.state.imgPaths.length > 0) {
      await ctx.reply('📝 Tavsifni yuboring:');
      return ctx.wizard.next();
    }

    await ctx.reply("❗ Rasm yuboring yoki matn bilan davom eting.");
  },
  async (ctx) => {
    if (!ctx.message?.text) return ctx.reply("❗ Tavsif matnini yuboring.");
    ctx.wizard.state.desc = ctx.message.text;

    try {
      const item = {
        name: ctx.wizard.state.name,
        img: ctx.wizard.state.imgPaths,
        desc: ctx.wizard.state.desc,
      };

      if (ctx.wizard.state.type === 'product') {
        item.price = ctx.wizard.state.price;
      }

      const col = collection(db, ctx.wizard.state.type === 'product' ? 'products' : 'works');
      await addDoc(col, item);

      await ctx.reply(`✅ ${ctx.wizard.state.type === 'product' ? 'Mahsulot' : 'Xizmat'} muvaffaqiyatli Firestore bazasiga qo'shildi!`);
    } catch (err) {
      console.error('❌ Firestore yozishda xato:', err);
      await ctx.reply("❌ Bazaga yozishda xatolik yuz berdi.");
    }

    return ctx.scene.leave();
  }
);

const stage = new Scenes.Stage([addScene]);
bot.use(session());
bot.use(stage.middleware());

bot.start((ctx) => {
  ctx.reply(`👋 Assalomu alaykum!\n📌 Ma'lumot qo'shish uchun: /add\n📌 Yangi admin qo'shish uchun: /addAdmin`);
});

bot.command('add', (ctx) => {
  if (!adminIds.includes(String(ctx.from.id))) {
    return ctx.reply("❌ Sizda bu amal uchun ruxsat yo'q.");
  }
  ctx.scene.enter('add-scene');
});

bot.command('addAdmin', async (ctx) => {
  const senderId = String(ctx.from.id);
  if (!adminIds.includes(senderId)) {
    return ctx.reply("❌ Faqat mavjud adminlargina yangi admin qo'sha oladi.");
  }

  const newAdminId = ctx.message.text.split(' ')[1];
  if (!newAdminId || isNaN(Number(newAdminId))) {
    return ctx.reply("❗ Foydalanuvchi ID sini to‘g‘ri kiriting. Misol: /addAdmin 123456789");
  }

  if (adminIds.includes(newAdminId)) {
    return ctx.reply("ℹ️ Bu foydalanuvchi allaqachon admin.");
  }

  adminIds.push(newAdminId);

  const envPath = path.join(__dirname, '..', '.env');
  try {
    let envContent = fs.readFileSync(envPath, 'utf-8');
    envContent = envContent.replace(/ADMINS\s*=\s*(.*)/, `ADMINS=${adminIds.join(',')}`);
    fs.writeFileSync(envPath, envContent);
    ctx.reply(`✅ Admin qo'shildi! Yangi admin ID: ${newAdminId}`);
  } catch (err) {
    console.error('.env yangilashda xato:', err);
    ctx.reply("❌ .env faylga yozishda xato yuz berdi.");
  }
});

// 🔄 Firestore bo'lgani uchun, launch bevosita
bot.launch().then(() => console.log('🤖 Bot Firestore bilan ishga tushdi'));
