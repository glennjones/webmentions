'use strict';
const Hapi = require('@hapi/hapi');
const Joi = require('joi');
const handlers = require('../lib/handlers.js');
let routes;


// adds the routes and validation for api
routes = [{
		method: 'GET',
		path: '/',
		handler: handlers.index,
		options: {}
	}, {
		method: 'GET',
		path: '/example',
		handler: handlers.example,
		options: {}
	}, {
		method: 'GET',
		path: '/webmention/endpoint/',
		handler: handlers.discoverEndpoint,
		options: {
			description: 'Discovers URL for webmention API',
			notes: ['Discovers a webmention API from a given URL',
				'Error status codes',
				'400, bad request',
				'404, not found',
				'500, internal server error'
			],
			tags: ['api'],
			validate: { 
				query: Joi.object({
					url: Joi.string()
						.required()
						.description('the url on which the discovery is carried out on')
				})
			}
		}
	},{
		method: 'GET',
		path: '/webmention/mention/forward/',
		handler: handlers.proxyMention,
		options: {
			description: 'Post a webmention request',
			notes: ['Validates and then forwards on a webmention post request',
				'Error status codes',
				'400, bad request',
				'404, not found',
				'500, internal server error'
			],
			tags: ['api'],
			validate: { 
				query: Joi.object({

					source: Joi.string()
						.required()
						.description('the url of the comment'),

					target: Joi.string()
						.required()
						.description('the url of the entry been commented on'),

					proxy: Joi.string()
						.optional()
						.description('(Not part of the standard) a proxy url for the target where the webmention is pass on to another system')

				})
			}
		}
	},{
		method: 'GET',
		path: '/webmention/mention/validate/',
		handler: handlers.validateMention,
		options: {
			description: 'Validates webmention',
			notes: ['Requests webmention URLs and makes sure there is a valid link between them',
				'Error status codes',
				'400, bad request',
				'404, not found',
				'500, internal server error'
			],
			tags: ['api'],
			validate: { 
				query: Joi.object({
					source: Joi.string()
						.required()
						.description('the url of the comment'),

					target: Joi.string()
						.required()
						.description('the url of the entry been commented on'),

					proxy: Joi.string()
						.optional()
						.description('(Not part of the standard) a proxy url for the target where the webmention is pass on to another system')

				})
			}
		}
	}, {
		method: 'POST',
		path: '/webmention/capture/',
		handler: handlers.capture,
		options: {
			description: 'Captures incoming webmention',
			notes: ['Captures incoming webmention request for later displays',
				'Error status codes',
				'400, bad request',
				'404, not found',
				'500, internal server error'
			],
			tags: ['api'],
			validate: { 
				payload: Joi.object({
					source: Joi.string()
						.required()
						.description('the url of the comment'),

					target: Joi.string()
						.required()
						.description('the url of the entry been commented on'),

					proxy: Joi.string()
						.optional()
						.description('(Not part of the standard) a proxy url for the target where the webmention is pass on to another system')

				})
			}
		}
	}, {
		method: 'GET',
		path: '/webmention/capture/',
		handler: handlers.displayCapture,
		options: {
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