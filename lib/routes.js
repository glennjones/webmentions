'use strict';
var hapi        = require('hapi'),
	handlers    = require('../lib/handlers.js'),
	routes;


// adds the routes and validation for api
routes = [{
		method: 'GET',
		path: '/',
		config: {
			handler: handlers.index
		}
	}, {
		method: 'GET',
		path: '/webmention/endpoint/',
		config: {
			handler: handlers.discoverEndpoint,
			description: 'Endpoint',
			notes: 'Discovers a webmention API endpoint from a given URL',
			tags: ['api'],
			jsonp: 'callback',
			validate: { 
				query: {
					url: hapi.types.String()
						.required()
						.description('the url on which the discovery is carried out')
				}
			}
		}
	},{
		method: 'POST',
		path: '/webmention/mention/proxy/',
		config: {
			handler: handlers.proxyMention,
			description: 'Endpoint',
			notes: 'Validates and then forwards on a webmention request',
			tags: ['api'],
			jsonp: 'callback',
			validate: { 
				query: {

					source: hapi.types.String()
						.required()
						.description('the url of the comment'),

					target: hapi.types.String()
						.required()
						.description('the url of the entry been commented on')

				}
			}
		}
	},{
		method: 'GET',
		path: '/webmention/mention/validate/',
		config: {
			handler: handlers.validateMention,
			description: 'Endpoint',
			notes: 'Requests source and target urls and makes sure there is a valid link between them',
			tags: ['api'],
			jsonp: 'callback',
			validate: { 
				query: {
					source: hapi.types.String()
						.required()
						.description('the url of the comment'),

					target: hapi.types.String()
						.required()
						.description('the url of the entry been commented on')
				}
			}
		}
	},{
		method: 'GET',
		path: '/{path*}',
		handler: {
			directory: {
				path: __dirname.replace('/lib','') + '/public',
				listing: false,
				index: true
			}
		}
	}];


exports.routes = routes;