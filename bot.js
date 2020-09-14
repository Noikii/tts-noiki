const tmi = require('tmi.js'),
  fs = require('fs'),
  util = require('util'),
  player = require('play-sound')(opts = {}),
  textToSpeech = require('@google-cloud/text-to-speech');

// Static Config
const client = new textToSpeech.TextToSpeechClient();
const config = {
  token: 'SECRET',
  channels: [ 'shayderbot', 'Penacho_' ],
  subOnly: true,
  prefix: '!',
  // https://github.com/googleapis/nodejs-text-to-speech
  voice: {
    // Select the language and SSML voice gender (optional)
    voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},

    // select the type of audio encoding
    audioConfig: {audioEncoding: 'MP3'},
  }
}

// Basic Example
// https://www.npmjs.com/package/twitch-bot

const bot = new tmi.Client({
	options: { debug: true },
	connection: {
		reconnect: true,
		secure: true
	},
	identity: {
		username: 'shayderbot',
		password: 'oauth:fhmzslgbhnrcnpuqk7qommux9e3o4o'
	},
	channels: config.channels
});
bot.connect();



bot.on('message', (channel, tags, message, self) => {
	if(self) return;

  // Subscriber Only Section

  // Text to Speech
  if(message.startsWith(config.prefix + 'tts')) {
    if (channel.toLowerCase().replace('#', '') == tags.username || tags.subscriber == config.subOnly) {
      var input = message.replace(config.prefix + 'tts', '');
      if (input.trim()) {

        // Add Text as input
        var ttsRequest = config.voice;
        ttsRequest.input = {text: input};

        // Callback based on Response
        client.synthesizeSpeech(ttsRequest, (response) => {
          const writeFile = util.promisify(fs.writeFile);
          writeFile('tmp.mp3', response.audioContent, 'binary', (err) => {
            player.play('tmp.mp3', function(err){
               if (err) throw err
            })
          });
        });
      } else {
        console.log(`@${tags.username} Empty Message`)
      }
    } else {
      // Sub Only Mode
      bot.say(channel, `@${tags.username} Running Sub-Only mode LUL`);
    }
  }
})
