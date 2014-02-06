
'use strict';
var webmentions		= require('../lib/webmentions.js');


// abstracts the individual modules into one interface
module.exports = {

	discoverEndpoint: function( options, callback ){
		webmentions.discoverEndpoint( options, callback );
	},

	validateMention: function( options, callback ){
		webmentions.validateMention( options, callback );
	}

}