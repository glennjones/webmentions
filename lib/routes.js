'use strict';
var hapi        = require('hapi'),
	joi 		= require('joi'),
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
		path: '/example',
		config: {
			handler: handlers.example
		}
	}, {
		method: 'GET',
		path: '/webmention/endpoint/',
		config: {
			handler: handlers.discoverEndpoint,
			description: 'Discovers URL for webmention API',
			notes: ['Discovers a webmention API from a given URL',
				'Error status codes',
				'400, bad request',
				'404, not found',
				'500, internal server error'
			],
			tags: ['api'],
			validate: { 
				query: {
					url: joi.string()
						.required()
						.description('the url on which the discovery is carried out on')
				}
			}
		}
	},{
		method: 'GET',
		path: '/webmention/mention/forward/',
		config: {
			handler: handlers.proxyMention,
			description: 'Post a webmention request',
			notes: ['Validates and then forwards on a webmention post request',
				'Error status codes',
				'400, bad request',
				'404, not found',
				'500, internal server error'
			],
			tags: ['api'],
			validate: { 
				query: {

					source: joi.string()
						.required()
						.description('the url of the comment'),

					target: joi.string()
						.required()
						.description('the url of the entry been commented on'),

					proxy: joi.string()
						.optional()
						.description('(Not part of the standard) a proxy url for the target where the webmention is pass on to another system')

				}
			}
		}
	},{
		method: 'GET',
		path: '/webmention/mention/validate/',
		config: {
			handler: handlers.validateMention,
			description: 'Validates webmention',
			notes: ['Requests webmention URLs and makes sure there is a valid link between them',
				'Error status codes',
				'400, bad request',
				'404, not found',
				'500, internal server error'
			],
			tags: ['api'],
			validate: { 
				query: {
					source: joi.string()
						.required()
						.description('the url of the comment'),

					target: joi.string()
						.required()
						.description('the url of the entry been commented on'),

					proxy: joi.string()
						.optional()
						.description('(Not part of the standard) a proxy url for the target where the webmention is pass on to another system')

				}
			}
		}
	}, {
		method: 'POST',
		path: '/webmention/capture/',
		config: {
			handler: handlers.capture,
			description: 'Captures incoming webmention',
			notes: ['Captures incoming webmention request for later displays',
				'Error status codes',
				'400, bad request',
				'404, not found',
				'500, internal server error'
			],
			tags: ['api'],
			validate: { 
				payload: {
					source: joi.string()
						.required()
						.description('the url of the comment'),

					target: joi.string()
						.required()
						.description('the url of the entry been commented on'),

					proxy: joi.string()
						.optional()
						.description('(Not part of the standard) a proxy url for the target where the webmention is pass on to another system')

				}
			}
		}
	}, {
		method: 'GET',
		path: '/webmention/capture/',
		config: {
			handler: handlers.displayCapture,
			description: 'Displays the captured webmention',
			notes: 'Displays the captured webmention request',
			tags: ['api'],
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