var Botkit = require('botkit')

var token = process.env.SLACK_TOKEN

var controller = Botkit.slackbot({
  // reconnect to Slack RTM when connection goes bad
  retry: Infinity,
  debug: false
})

// Assume single team mode if we have a SLACK_TOKEN
if (token) {
  console.log('Starting in single-team mode')
  controller.spawn({
    token: token
  }).startRTM(function (err, bot, payload) {
    if (err) {
      throw new Error(err)
    }

    console.log('Connected to Slack RTM')
  })
// Otherwise assume multi-team mode - setup beep boop resourcer connection
} else {
  console.log('Starting in Beep Boop multi-team mode')
  require('beepboop-botkit').start(controller, { debug: true })
}

controller.on('bot_channel_join', function (bot, message) {
  bot.reply(message, "I'm here!")
})

controller.hears(['hello', 'hi'], ['direct_mention'], function (bot, message) {
  bot.reply(message, 'Hello.')
})

controller.hears(['hello', 'hi'], ['direct_message'], function (bot, message) {
  bot.reply(message, 'Hello.')
  bot.reply(message, 'It\'s nice to talk to you directly.')
})

controller.hears('.*', ['mention'], function (bot, message) {
  bot.reply(message, 'You really do care about me. :heart:')
})

controller.hears('help', ['direct_message', 'direct_mention'], function (bot, message) {
  var help = 'I will respond to the following messages: \n' +
      '`bot hi` for a simple message.\n' +
      '`bot attachment` to see a Slack attachment message.\n' +
      '`@<your bot\'s name>` to demonstrate detecting a mention.\n' +
      '`bot help` to see this again.'
  bot.reply(message, help)
})

controller.hears(['attachment'], ['direct_message', 'direct_mention'], function (bot, message) {
  var text = 'Beep Beep Boop is a ridiculously simple hosting platform for your Slackbots.'
  var attachments = [{
    fallback: text,
    pretext: 'We bring bots to life. :sunglasses: :thumbsup:',
    title: 'Host, deploy and share your bot in seconds.',
    image_url: 'https://storage.googleapis.com/beepboophq/_assets/bot-1.22f6fb.png',
    title_link: 'https://beepboophq.com/',
    text: text,
    color: '#7CD197'
  }]

  bot.reply(message, {
    attachments: attachments
  }, function (err, resp) {
    console.log(err, resp)
  })
})

controller.hears('.*', ['direct_message', 'direct_mention'], function (bot, message) {
  bot.reply(message, 'Sorry <@' + message.user + '>, I don\'t understand. \n')
})

controller.hears(['.*play|game|Hi|Hello|Salut|Bonjour.*'], 'direct_message,direct_mention,mention', function(bot, message) {
 30         bot.api.reactions.add({
 31                 timestamp: message.ts,
 32                 channel: message.channel,
 33                 name: 'robot_face',
 34         }, function(err, res) {
 35                 if (err) {
 36                         bot.botkit.log('Failed to add emoji reaction :(', err);
 37                 }
 38         });
 39 
 40         controller.storage.users.get(message.user, function(err, user) {
 41                 if (user && user.name) {
 42                         bot.reply(message, 'Hey what\'s up ' + user.name + '!! Do you wanna play ?');
 43                 } else {
 44                         bot.reply(message, 'Hey what\'s up. Do you wanna play ?');
 45                 }
 46                 bot.reply(message, {
 47                         attachments:[
 48                                 {
 49                                         "text": "You'll have to find out the capital city of a random country motherfucker mouhahaha.",
 50                                         "fallback": "Oh what a loser you are !!",
 51                                         "callback_id": "cc_game",
 52                                         "color": "#3AA3E3",
 53                                         "attachment_type": "default",
 54                                         "actions": [
 55                                                 {
 56                                                         "name":"yes",
 57                                                         "text": "YES",
 58                                                         "style": "primary",
 59                                                         "type": "button",
 60                                                         "value": "yes"
 61                                                 },
 62                                                 {
 63                                                         "name":"no",
 64                                                         "text": "NO",
 65                                                         "style": "default",
 66                                                         "type": "button",
 67                                                         "value": "no"
 68                                                 }
 69                                         ]
 70                                 }
 71                         ]
 72                 });
 73         });
 74 });
