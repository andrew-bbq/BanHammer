// ------ IMPORTS --------
const fs = require('fs');
const speech = require('@google-cloud/speech');
require('dotenv').config(); //initialize dotenv
const Discord = require('discord.js'); //import discord.js
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, createAudioResource  } = require('@discordjs/voice');
const { channel } = require('diagnostics_channel');
const { strictEqual } = require('assert');

// ------ CLIENT DECLARATION -------
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES", "GUILD_BANS"] })
const speechClient = new speech.SpeechClient();

// ------ banned words --------
const bannedWords = [
  "melee",
  "power ranking",
  "strive",
  "smash",
  "guilty gear",
  "shine",
  "laser",
  "donkey",
  "kong",
  "ledge",
  "fox",
  "falco",
  "doctor mario",
  "falcon",
  "marth",
  "roy",
  "ice climber",
  "puff",
  "jigglypuff",
  "ludwig",
  "dolphin",
  "nintendo",
  "gamecube",
  "game cube",
  "shrive",
  "shein",
  "nare",
  "nair",
  "p.m.",
  "mead",
  "meed",
  "final fantasy",
  " pr ",
  "malay",
  "mei wei",
  "may way",
  "project m",
  "netplay",
  "net play",
  "chic",
  "sheik",
  "sheek",
  "combo",
  "valorant",
  "v word"
];

// ------ REAL SHIT???? --------
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

let leConnection;
let online = false;
let currentChannel;

client.on('message', msg => {
  if ((msg.content === '!come' || msg.content === "@jackbox") && !online) {
    
    currentChannel = msg.channel;
    const member = msg.member;
    const vc = member.voice.channel;
    if(vc != null) {
      msg.reply('Coming!');
      vc.join().then(connection => {
        leConnection = connection;
        connection.play("./hey.mp3");
  
        let speakingMap = connection.receiver?.speaking;
        speakingMap?.addListener("start", (userId) => {
          console.log(userId);
        });
      });
  
      online = true;
      currentChannel = vc;
    } else {
      msg.reply("I can't join if you're not in voice chat :(");
    }
  }

  if (msg.content === '!uncome') {
    if(leConnection != null) {
      currentChannel.leave();
      online = false;
    }
  }
});

client.on('guildMemberSpeaking', (member, speaking) => {
	if(speaking && leConnection != null) {
    const audio = leConnection.receiver.createStream(member.id, { mode: 'pcm' });
    const audioFileName = './recordings/' + member.id + '_' + Date.now() + '.pcm';
    audio.pipe(fs.createWriteStream(audioFileName));
    
    audio.on('end', async () => {
      fs.stat(audioFileName, async (err, stat) => { // For some reason, Discord.JS gives two audio files for one user speaking. Check if the file is empty before proceeding
        if (!err && stat.size) {
          const file = fs.readFileSync(audioFileName);
          const audioBytes = file.toString('base64');
          const audio = {
            content: audioBytes,
          };
          const config = {
            encoding: 'LINEAR16',
            sampleRateHertz: 48000,
            languageCode: 'en-US',
            audioChannelCount: 2,
          };
          const request = {
            audio: audio,
            config: config,
          };
          const [response] = await speechClient.recognize(request);
          const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
          let transcription2 = transcription.toLowerCase();
          if (bannedWords.some(function(v) {return transcription2.indexOf(v) >= 0})) {
            console.log(member.displayName + " moved.");
            console.log(transcription2);
            member.voice.setChannel("937948345987645452");
          }
          fs.unlink(audioFileName, (err) => {
            if (err) {
              console.error(err);
              return;
            }
          });
        }
      });
    });
	}
});


//make sure this line is the last line
client.login(process.env.CLIENT_TOKEN); //login bot using token