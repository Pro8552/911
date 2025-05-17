const fs = require('fs');
const path = require('path');
require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// أسماء الأشهر بالعربي
const monthNames = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

// أسماء القنوات الخاصة بالتسجيل والتهاني
const REG_CHANNEL_NAME = '・𝑩𝒊𝒓𝒕𝒉𝒅𝒂𝒚';
const HBD_CHANNEL_NAME = '・𝑩𝒊𝒓𝒕𝒉𝒅𝒂𝒚・𝑪𝒐𝒏𝒈𝒓𝒂𝒕𝒔';

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB Atlas');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// تعريف موديل أعياد الميلاد
const birthdaySchema = new mongoose.Schema({
  userId: String,
  month: String,
  day: String
});
const Birthday = mongoose.model('Birthday', birthdaySchema);

client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // ضمان وجود رسالة التسجيل في كل سيرفر
  client.guilds.cache.forEach(guild => {
    ensureRegistrationEmbed(guild).catch(console.error);
  });
});

// ترحيب بالأعضاء الجدد
client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.find(ch => ch.name === '・𝑾𝒆𝒍𝒄𝒐𝒎𝒆');
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle(`𝑫𝒐𝒏𝒕𝒄𝒓𝒚 ‎${member.user.username}`)
    .setDescription(`𝑾𝒆𝒍𝒄𝒐𝒎𝒆 𝑻𝒐    𝑫  𝑴 & 𝒀 ‎\n\n✦ ${member}\n\n✦ 𝑹𝒆𝒂𝒅 𝒕𝒉𝒆 https://discord.com/channels/1315439290167197867/1315486259308793877\n\n ✦ 𝑬𝒏𝒋𝒐𝒚`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setImage('https://media.discordapp.net/attachments/1315486259308793880/1371263335915458570/D_M_Y_8.png')
    .setFooter({ text: '𝒈𝒈/𝒅𝒐𝒏𝒕𝒄𝒓𝒚    (𝑭𝒐𝒓 𝑭𝒖𝒏)', });

  channel.send({ embeds: [embed] });
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  if (content.includes('السلام عليكم') || content.includes('سلام عليكم')) {
    return message.reply('**وعليكم السلام ورحمة الله وبركاته 🤍**');
  }

  if (message.content.trim() === '.') {
    return message.reply('https://tenor.com/view/trollszn123-ronaldo-gif-18268194');
  }

  // *** الجزء الجديد - فاصل الصورة والرياكن في روم Streak ***
  if (message.channel.name === '・𝑺𝒕𝒓𝒆𝒂𝒌') {
    const separatorImageURL = 'https://media.discordapp.net/attachments/1247445270858305617/1373225755688964197/Untitled_design.gif?ex=6829a3a5&is=68285225&hm=330bb6093bdae00f3310dab77869f684cd79cb8f01d04abfee0086d9aa600ed4&=&width=800&height=100';

    try {
      await message.channel.send({ files: [separatorImageURL] });
      await message.react('<:5_:1373231138574831708>');
    } catch (err) {
      console.error('❌ خطأ في إرسال الفاصل أو الرياكشن:', err);
    }
  }

  if (message.content === '!setbday') {
    await message.reply('✨ رجاء استخدم قائمة التسجيل الموجودة في روم #・𝑩𝒊𝒓𝒕𝒉𝒅𝒂𝒚');
  }
});

// إنشاء رسالة التسجيل مع قائمة اختيار الأشهر
async function ensureRegistrationEmbed(guild) {
  const regChannel = guild.channels.cache.find(ch => ch.name === REG_CHANNEL_NAME);
  if (!regChannel) return;

  const messages = await regChannel.messages.fetch({ limit: 20 });
  const exists = messages.find(m => m.author.id === client.user.id && m.embeds[0]?.title === 'Your BirthDay');
  if (exists) return;

  const monthMenu = new StringSelectMenuBuilder()
    .setCustomId('select_month')
    .setPlaceholder('اختر الشهر')
    .addOptions(monthNames.map((name, i) => ({
      label: name,
      value: String(i + 1).padStart(2, '0')
    })));

  const embed = new EmbedBuilder()
    .setTitle('Your BirthDay')
    .setDescription('***Choose Your Month***')
    .setColor('#FFD700');

  await regChannel.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(monthMenu)] });
}

// التعامل مع تفاعل المستخدم مع القوائم
client.on('interactionCreate', async interaction => {
  if (!interaction.isStringSelectMenu()) return;

  const userId = interaction.user.id;

  if (interaction.customId === 'select_month') {
    const month = interaction.values[0];
    const daysInMonth = new Date(2025, parseInt(month), 0).getDate();

    const firstHalfDays = Math.ceil(daysInMonth / 2);
    const secondHalfDays = daysInMonth - firstHalfDays;

    const dayMenu1 = new StringSelectMenuBuilder()
      .setCustomId(`select_day_${month}_1`)
      .setPlaceholder(`اختر اليوم (1 - ${firstHalfDays})`)
      .addOptions(
        Array.from({ length: firstHalfDays }, (_, i) => ({
          label: String(i + 1),
          value: String(i + 1).padStart(2, '0')
        }))
      );

    const dayMenu2 = new StringSelectMenuBuilder()
      .setCustomId(`select_day_${month}_2`)
      .setPlaceholder(`اختر اليوم (${firstHalfDays + 1} - ${daysInMonth})`)
      .addOptions(
        Array.from({ length: secondHalfDays }, (_, i) => ({
          label: String(i + 1 + firstHalfDays),
          value: String(i + 1 + firstHalfDays).padStart(2, '0')
        }))
      );

    const embed = new EmbedBuilder()
      .setTitle('Your Day')
      .setDescription(`***Choose Your Day*** **${monthNames[parseInt(month) - 1]}**`)
      .setColor('#00BFFF');

    await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(dayMenu1), new ActionRowBuilder().addComponents(dayMenu2)], flags: 64 });
  }

  if (interaction.customId.startsWith('select_day_')) {
    const parts = interaction.customId.split('_');
    const month = parts[2];
    const day = interaction.values[0];

    await Birthday.findOneAndUpdate(
      { userId },
      { month, day },
      { upsert: true }
    );

    const embed = new EmbedBuilder()
      .setTitle('✅ Done !')
      .setDescription(`🎉 Done Saving Your BirthDay: **${day}-${month}**`)
      .setColor('#32CD32');

    await interaction.reply({ embeds: [embed], flags: 64 });
  }
});

// التحقق من أعياد الميلاد كل دقيقة وإرسال التهاني
const checkBirthdays = async () => {
  const now = new Date();
  const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
  const todayDay = String(now.getDate()).padStart(2, '0');

  const birthdays = await Birthday.find({ month: todayMonth, day: todayDay });

  for (const birthday of birthdays) {
    client.guilds.cache.forEach(async guild => {
      const hbdChannel = guild.channels.cache.find(ch => ch.name === HBD_CHANNEL_NAME);
      if (!hbdChannel) return;

      const member = await guild.members.fetch(birthday.userId).catch(() => null);
      if (member) {
        hbdChannel.send(`***𝗛𝗕𝗗 🎂 \n${member} ***\n\n***@everyone @here***`);
      }
    });
  }
};

// سيرفر Express بسيط للحفاظ على البوت شغال في منصات مثل Render أو Replit
const express = require('express');
const server = express();

server.all('/', (req, res) => {
  res.send('Bot is alive!');
});

server.listen(process.env.PORT || 3000, () => {
  console.log('✅ Keep-alive server is running');
});

// فحص أعياد الميلاد كل دقيقة
setInterval(checkBirthdays, 1000 * 60);

client.login(process.env.TOKEN);
