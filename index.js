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

// ===== إعدادات أعياد الميلاد =====
const BIRTHDAYS_FILE = path.join(__dirname, 'birthdays.json');
if (!fs.existsSync(BIRTHDAYS_FILE)) fs.writeFileSync(BIRTHDAYS_FILE, '{}');

function loadBirthdays() {
  return JSON.parse(fs.readFileSync(BIRTHDAYS_FILE));
}

function saveBirthdays(data) {
  fs.writeFileSync(BIRTHDAYS_FILE, JSON.stringify(data, null, 2));
}

const monthNames = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

// أسماء رومات البيرث دي الأصلية
const REG_CHANNEL_NAME = '・𝑩𝒊𝒓𝒕𝒉𝒅𝒂𝒚'; // روم تسجيل الميلاد
const HBD_CHANNEL_NAME = '・𝑩𝒊𝒓𝒕𝒉𝒅𝒂𝒚・𝑪𝒐𝒏𝒈𝒓𝒂𝒕𝒔'; // روم إعلان أعياد الميلاد

// ===== عند تشغيل البوت =====
client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  client.guilds.cache.forEach(guild => {
    ensureRegistrationEmbed(guild).catch(console.error);
  });
});

// ===== ترحيب بالأعضاء الجدد =====
client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.find(ch => ch.name === '・𝑾𝒆𝒍𝒄𝒐𝒎𝒆');
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle(`𝑫𝒐𝒏𝒕𝒄𝒓𝒚 ‎${member.user.username}`)
    .setDescription(`𝑾𝒆𝒍𝒄𝒐𝒎𝒆 𝑻𝒐    𝑫  𝑴 & 𝒀 ‎\n\n✦ ${member}\n\n✦ 𝑹𝒆𝒂𝒅 𝒕𝒉𝒆 https://discord.com/channels/1315439290167197867/1315486259308793877\n\n ✦ 𝑬𝒏𝒋𝒐𝒚`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setImage('https://media.discordapp.net/attachments/1315486259308793880/1371263335915458570/D_M_Y_8.png')
    .setFooter({ text: '𝒈𝒈/𝒅𝒐𝒏𝒕𝒄𝒓𝒚    (𝑭𝒐𝒓 𝑭𝒖𝒏)',  });

  channel.send({ embeds: [embed] });
});

// ===== رسائل الردود والتفاعلات =====
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  if (content.includes('السلام عليكم') || content.includes('سلام عليكم')) {
    return message.reply('**وعليكم السلام ورحمة الله وبركاته 🤍**');
  }

  if (message.content.trim() === '.') {
    return message.reply('https://tenor.com/view/trollszn123-ronaldo-gif-18268194');
}

  if (message.channel.name === '・𝑺𝒕𝒓𝒆𝒂𝒌') {
    const separatorImageURL = 'https://media.discordapp.net/attachments/1247445270858305617/1373225755688964197/Untitled_design.gif?ex=6829a3a5&is=68285225&hm=330bb6093bdae00f3310dab77869f684cd79cb8f01d04abfee0086d9aa600ed4&=&width=800&height=100';
    await message.channel.send({ files: [separatorImageURL] });

    try {
      await message.react('<:5_:1373231138574831708>');
    } catch (err) {
      console.error('فشل إضافة الرياكشن:', err);
    }
  }


  if (message.content === '!setbday') {
    await message.reply('✨ رجاء استخدم قائمة التسجيل الموجودة في روم #・𝑩𝒊𝒓𝒕𝒉𝒅𝒂𝒚');
  }
});

// ===== واجهة تسجيل تاريخ الميلاد =====
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

// ===== تفاعل المستخدم مع قائمة التسجيل =====
client.on('interactionCreate', async interaction => {
  if (!interaction.isStringSelectMenu()) return;

  const userId = interaction.user.id;
  const birthdays = loadBirthdays();

  if (interaction.customId === 'select_month') {
    const month = interaction.values[0];
    const daysInMonth = new Date(2025, parseInt(month), 0).getDate();

    // تقسيم الأيام إلى مجموعتين للعرض في قائمتين منفصلتين
    const firstHalfDays = Math.ceil(daysInMonth / 2);
    const secondHalfDays = daysInMonth - firstHalfDays;

    const dayMenu1 = new StringSelectMenuBuilder()
      .setCustomId(`select_day_${month}_1`)
      .setPlaceholder('اختر اليوم (1 - ' + firstHalfDays + ')')
      .addOptions(
        Array.from({ length: firstHalfDays }, (_, i) => ({
          label: String(i + 1),
          value: String(i + 1).padStart(2, '0')
        }))
      );

    const dayMenu2 = new StringSelectMenuBuilder()
      .setCustomId(`select_day_${month}_2`)
      .setPlaceholder('اختر اليوم (' + (firstHalfDays + 1) + ' - ' + daysInMonth + ')')
      .addOptions(
        Array.from({ length: secondHalfDays }, (_, i) => ({
          label: String(i + 1 + firstHalfDays),
          value: String(i + 1 + firstHalfDays).padStart(2, '0')
        }))
      );

    const embed = new EmbedBuilder()
      .setTitle(' Your Day')
      .setDescription(`***Choose Your Day*** **${monthNames[parseInt(month) - 1]}**`)
      .setColor('#00BFFF');

    await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(dayMenu1), new ActionRowBuilder().addComponents(dayMenu2)], flags: 64 });
  }

  if (interaction.customId.startsWith('select_day_')) {
    // التعامل مع اختيار اليوم من أي من القائمتين (1 أو 2)
    const parts = interaction.customId.split('_');
    const month = parts[2];
    const day = interaction.values[0];

    const birthdays = loadBirthdays();
    birthdays[userId] = { month, day };
    saveBirthdays(birthdays);

    const embed = new EmbedBuilder()
      .setTitle('✅ Done !')
      .setDescription(`🎉 Done Saving Your BirthDay: **${day}-${month}**`)
      .setColor('#32CD32');

    await interaction.reply({ embeds: [embed], flags: 64 });
  }
});

// ===== فحص يومي لأعياد الميلاد =====
const checkBirthdays = async () => {
  const now = new Date();
  const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
  const todayDay = String(now.getDate()).padStart(2, '0');

  const birthdays = loadBirthdays();

  for (const userId in birthdays) {
    const { month, day } = birthdays[userId];
    if (month === todayMonth && day === todayDay) {
      client.guilds.cache.forEach(async guild => {
        const hbdChannel = guild.channels.cache.find(ch => ch.name === HBD_CHANNEL_NAME);
        if (!hbdChannel) return;

        const member = await guild.members.fetch(userId).catch(() => null);
        if (member) {
          hbdChannel.send(`***𝗛𝗕𝗗 🎂 
          ${member} ***
          
          ***\@everyone\@here***`);
        }
      });
    }
  }
};

const express = require('express');
const server = express();
server.all('/', (req, res) => {
  res.send('Bot is alive!');
});
server.listen(3000, () => {
  console.log('✅ Keep-alive server is running');
});


// تشغيل الفحص كل 24 ساعة
setInterval(checkBirthdays, 1000 * 60 * 60 * 24);

// تسجيل الدخول
client.login(process.env.TOKEN);
