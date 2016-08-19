var Botkit = require('./lib/Botkit.js');

/*if (!process.env.clientId || !process.env.clientSecret || !process.env.port) {
  console.log('Error: Specify clientId clientSecret and port in environment');
  process.exit(1);
}*/


var controller = Botkit.slackbot({
  retry: Infinity,
  debug: false,
  json_file_store: './db_slackbutton_bot/',
}).configureSlackApp(
  {
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
    scopes: ['bot'],
  }
);

controller.setupWebserver(process.env.port,function(err,webserver) {
  controller.createWebhookEndpoints(controller.webserver);

  controller.createOauthEndpoints(controller.webserver,function(err,req,res) {
    if (err) {
      res.status(500).send('ERROR: ' + err);
    } else {
      res.send('Success!');
    }
  });
});


var _bots = {};
function trackBot(bot) {
  _bots[bot.config.token] = bot;
}

controller.on('create_bot',function(bot,config) {

  if (_bots[bot.config.token]) {
    // already online! do nothing.
  } else {
    bot.startRTM(function(err) {
	console.log('Starting in Beep Boop multi-team mode');
	require('beepboop-botkit').start(controller, {debug:true});
	if (!err) {
		trackBot(bot);
      }

      bot.startPrivateConversation({user: config.createdBy},function(err,convo) {
        if (err) {
          console.log(err);
        } else {
          convo.say('I am a 42bot that has just joined your team');
          convo.say('You must now /invite me to a channel so that I can be of use!');
        }
      });

    });
  }

});


// Handle events related to the websocket connection to Slack
controller.on('rtm_open',function(bot) {
  console.log('** The RTM api just connected!');
});

controller.on('rtm_close',function(bot) {
  console.log('** The RTM api just closed');
  // you may want to attempt to re-open
});

controller.on(['direct_message','mention','direct_mention'],function(bot,message) {
  bot.api.reactions.add({
    timestamp: message.ts,
    channel: message.channel,
    name: 'robot_face',
  },function(err) {
    if (err) { console.log(err) }
  });
});

controller.hears(['hello|hi|salut|bonjour.*'],'direct_message,direct_mention,mention',function(bot,message) {
  bot.reply(message,'Hello! I\'m 42bot. You can asks some question but I don\'t know everything');
});

controller.hears('^stop.*','direct_message,direct_mention,mention',function(bot,message) {
  bot.reply(message,'Goodbye');
  bot.rtm.close();
});

controller.hears('.*quiz.*', 'direct_message,direct_mention,mention', function(bot,message) {
	bot.reply(message, 'Let\'s play !!!');
	bot.startConversation(message, function(err, convo) {
		convo.ask({
			attachments:[
				{
					title: 'Do you really want to proceed ?',
					callback_id: '123',
					color: "#3AA3E3",
					attachment_type: 'default',
					actions: [
						{
							"name":"yes",
							"text":"Yes",
							"value":"yes",
							"style":"primary",
							"type":"button",
						},
						{
							"name":"no",
							"text":"No",
							"value":"no",
							"type":"button",
						}
					]
				}
			]
		},[
			{
				pattern: "yes",
				callback: function(reply, convo) {
					convo.say('FABULOUS!');
					convo.next();
					//ask for action URL to do something
				}
			},
			{
				pattern:"no",
				callback: function(reply, convo) {
					convo.say('Too bad');
					convo.next();
					//ask for action URL to do something
				}
			},
			{
				default: true,
				callback: function(reply, convo) {
					//do nothing
				}
			}
		]);
	});
});

controller.storage.teams.all(function(err,teams) {

  if (err) {
    throw new Error(err);
  }

  // connect all teams with bots up to slack!
  for (var t  in teams) {
    if (teams[t].bot) {
      controller.spawn(teams[t]).startRTM(function(err, bot) {
        if (err) {
          console.log('Error connecting bot to Slack:',err);
        } else {
          trackBot(bot);
        }
      });
    }
  }

});
