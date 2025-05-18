const mongoose = require('mongoose');
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

  if (content.includes('السلام عليكم') || content.includes('سلام عليكم')) {
    return message.reply('**وعليكم السلام ورحمة الله وبركاته 🤍**');
  }

  if (message.content.trim() === '.') {
    return message.reply('https://tenor.com/view/trollszn123-ronaldo-gif-18268194');
  }

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
    await message.reply('✨ تم إيقاف نظام أعياد الميلاد، شكرًا لتفهمك.');
  }
});

// سيرفر Express للحفاظ على تشغيل البوت
const server = express();

server.all('/', (req, res) => {
  res.send('Bot is alive!');
});

server.listen(process.env.PORT || 3000, () => {
  console.log('✅ Keep-alive server is running');
});

client.login(process.env.TOKEN);
