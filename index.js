require('dotenv').config();
const express = require('express');
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.find(ch => ch.name === '・𝑾𝒆𝒍𝒄𝒐𝒎𝒆');
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle(`𝑫𝒐𝒏𝒕𝒄𝒓𝒚 ‎${member.user.username}`)
    .setDescription(`𝑾𝒆𝒍𝒄𝒐𝒎𝒆 𝑻𝒐    𝑫  𝑴 & 𝒀 ‎\n\n✦ ${member}\n\n✦ 𝑹𝒆𝒂𝒅 𝒕𝒉𝒆 https://discord.com/channels/1315439290167197867/1315486259308793877\n\n ✦ 𝑬𝒏𝒋𝒐𝒚`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setImage('https://media.discordapp.net/attachments/1315486259308793880/1371263335915458570/D_M_Y_8.png')
    .setFooter({ text: '𝒈𝒈/𝒅𝒐𝒏𝒕𝒄𝒓𝒚    (𝑭𝒐𝒓 𝑭𝒖𝒏)' });

  channel.send({ embeds: [embed] });
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  // رد السلام
  if (content.includes('السلام عليكم') || content.includes('سلام عليكم')) {
    return message.reply('**وعليكم السلام ورحمة الله وبركاته 🤍**');
  }

  // رد على النقطة
  if (message.content.trim() === '.') {
    return message.reply('https://images-ext-1.discordapp.net/external/ytjgK1HIlP_soJz9w6j_T6puEE5KpBI56gzFL4MtRnA/https/media.tenor.com/UKU-t6X9kVoAAAPo/trollszn123-ronaldo.gif');
  }

  // روم ستريك
  if (message.channel.name === '・𝑺𝒕𝒓𝒆𝒂𝒌') {
    const gifURL = 'https://media.discordapp.net/attachments/1247445270858305617/1373225755688964197/Untitled_design.gif';

    try {
      await message.channel.send({ files: [gifURL] });
      await message.react('<:5_:1373231138574831708>');
    } catch (err) {
      console.error('❌ خطأ في إرسال الفاصل أو الرياكشن:', err);
    }
  }
});

// سيرفر Express لتشغيل البوت باستمرار
const server = express();
server.all('/', (req, res) => {
  res.send('Bot is alive!');
});
server.listen(process.env.PORT || 3000, () => {
  console.log('✅ Keep-alive server is running');
});

// تسجيل الدخول
client.login(process.env.TOKEN);
