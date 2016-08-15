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

controller.hears(['/quiz|.*play|game|Hi|Hello|Salut|Bonjour.*'], 'direct_message,direct_mention,mention', function(bot, message) {
  bot.api.reactions.add({
    timestamp: message.ts,
    channel: message.channel,
    name: 'robot_face',
  }, function(err, res) {
    if (err) {
      bot.botkit.log('Failed to add emoji reaction :(', err);
    }
  })

  controller.storage.users.get(message.user, function(err, user) {
    if (user && user.name) {
      bot.reply(message, 'Hey what\'s up ' + user.name + '!! Do you wanna play ?');
    } else {
      bot.reply(message, 'Hey what\'s up. Do you wanna play ?');
    }
    bot.startConversation(message, function(err, convo) {
      convo.ask({
        attachments:[
          {
            title: 'You\'ll have to find out the capital city of a random country motherfucker mouhahaha.',
            fallback: 'Oh what a loser you are !!',
            callback_id: '123',
            color: '#3AA3E3',
            attachment_type: 'default',
            actions: [
              {
                "name":"yes",
                "text": "YES",
                "style": "primary",
                "type": "button",
                "value": "yes"
              },
              {
                "name":"no",
                "text": "NO",
                "style": "default",
                "type": "button",
                "value": "no"
              }
            ]
          }
        ]
      },[
          {
            pattern:"yes",
            callback: function(reply, convo) {
              convo.say('It\'s good');
              convo.next();
            }
          },
          {
            pattern:"no",
            callback: function(reply) {
              convo.say('It\'s not good');
              convo.next();
            }
          },
          {
            default: true,
            callback: function(reply, convo) {

            }
          }
        ]
      )
    })
  })
})

controller.hears('.*', ['direct_message', 'direct_mention'], function (bot, message) {
  bot.reply(message, 'Sorry <@' + message.user + '>, I don\'t understand. \n')
})