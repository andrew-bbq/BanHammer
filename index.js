require('dotenv').config(); //initialize dotenv
const Discord = require('discord.js'); //import discord.js
const { joinVoiceChannel } = require('@discordjs/voice');

const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES", "GUILD_BANS"] })

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

let connection;
let online = false;
let currentChannel;

client.on('message', msg => {
  if (msg.content === '!come') {
    msg.reply('Coming!');
    const member = msg.member;
    const vc = member.voice.channel;
    connection = joinVoiceChannel({
      channelId: vc.id,
      guildId: vc.guild.id,
      adapterCreator: vc.guild.voiceAdapterCreator,
    });
    online = true;
    currentChannel = vc;

    connection.on('speaking', (user, speaking) => {
      console.log("WHAT UP BOYS");
    });
  }

  if (msg.content === '!uncome') {
    if(connection != null) {
      connection.destroy();
      online = false;
    }
  }
});

client.on("guildMemberSpeaking", (member, bool) => {
  console.log(member);
  console.log(bool);
});


//make sure this line is the last line
client.login(process.env.CLIENT_TOKEN); //login bot using token