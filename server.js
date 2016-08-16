var Botkit = require('botkit');
var controller = Botkit.slackbot();

var cities = {
	'France' : 'Paris',
	'Senegal' : 'Dakar',
	'Germany' : 'Berlin', 
	'Slovakia' : 'Bratislava',
	'USA' : 'Washington',
	'Jamaica' : 'Kingston', 
	'South Africa' : 'Pretoria',
	'Japan' : 'Tokyo',
	'Thailand' : 'Bangkok',
	'Australia' : 'Canberra'
};

controller.configureSlackApp({
	clientId: process.env.clientId,
	clientSecret: process.env.clientSecret,
	redirectUri: 'http://localhost:3002',
	scopes: ['incoming-webhook', 'team:read', 'users:read', 'channels:read', 'im:read', 'im:write', 'groups:read', 'emoji:read', 'chat:write:bot']
});

controller.setupWebserver(process.env.port, function(err, webserver) {
	// set up web endpoints for oauth, receiving webhooks, etc.
	controller
		.createHomepageEndpoint(controller.webserver)
		.createOauthEndpoints(controller.webserver, function(err, req, res) { ... })
		.createWebhookEndpoints(controller.webserver);
});