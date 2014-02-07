
'use strict';
var fs				= require('fs'),
	path            = require('path'),
	urlParser       = require('url'),
	hapi            = require('hapi'),
	config          = require('../config.js'),
	pack            = require('../package'),
	webmentions		= require('../lib/webmentions.js'),
	utils           = require('../lib/utilities.js');
	

// refines configure using server context
config = utils.processConfig( config )


function index(request, reply) {
	utils.getMarkDownHTML(__dirname.replace('/lib','') + '/README.md', function(err, data){
		reply.view('swagger.html', {
			title: pack.name,
			markdown: data
		});
	});
}


// used to discover webmention API endpoint
function discoverEndpoint(request, reply) { 
	var options = {
			url: request.query.url
		};

	// use node url parser to check format
	if( urlParser.parse( options.url ) ){
		webmentions.discoverEndpoint( options, function( error, result ){
			renderJSON( request, reply, error, result );
		}); 
	}else{
		renderJSON( request, reply, utils.buildError( 400, 'bad request', 'The url are not in the correct format'), {} );
	}
}



// used to validate and then proxy webmention request
function proxyMention(request, reply) { 
	var options = {
			target: request.query.target,
			source: request.query.source
		};

	webmentions.proxyMention( options, function( error, result ){
		renderJSON( request, reply, error, result );
	}); 
}



// used to validate a webmention request
function validateMention(request, reply) { 
	var options = {
			target: request.query.target,
			source: request.query.source
		};

	webmentions.validateMention( options, function( error, result ){
		renderJSON( request, reply, error, result );
	}); 
}




// render json out to http stream
function renderJSON( request, reply, err, result ){
	if(err){
		console.log(err)
		if(err.code === 404){
			reply(new hapi.error.notFound(err.message));
		}else{
			reply(new hapi.error.badRequest(err.message));
		}
		
		
	}else{
		reply(result).type('application/json; charset=utf-8');
	}
}




exports.index = index;
exports.discoverEndpoint = discoverEndpoint;
exports.proxyMention = proxyMention;
exports.validateMention = validateMention;







