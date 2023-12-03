
'use strict';

if(require.main === module) { 
	// if they want the app
    var app = require('../bin/webmentions.js');
}else{ 
	// if they want a module interface
	var routes = require('../lib/routes'),
		webmentions	= require('../lib/webmentions.js');

	module.exports = {
		'routes': routes.routes,
		'discoverEndpoint': function( options, callback ){
			webmentions.discoverEndpoint( options, callback );
		},
		'validateMention': function( options, callback ){
			webmentions.validateMention( options, callback );
		},
		'proxyMention': function( options, callback ){
			webmentions.proxyMention( options, callback );
		}
	}
}