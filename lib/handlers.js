const fs = require('fs');
const path = require('path');
const hapi = require('@hapi/hapi');
let config = require('../config.js');
const pack = require('../package');
const webmentions = require('../lib/webmentions.js');
const utils = require('../lib/utilities.js');

var captures = [];		
	
// refines configure using server context
config = utils.processConfig( config )	



async function index(request, h) {
	utils.getMarkDownHTML(__dirname.replace('/lib','') + '/README.md', function(err, data){
	  return h.view('swagger.html', {
		title: pack.name,
		markdown: data
	  });
	});
  }
  
  async function example(request, h) {
	return h.view('example.html', { url: 'http://' + request.info.host + '/webmention/capture/' });
  }
  
  async function capture(request, h) {
	var options = {
	  target: request.payload.target,
	  source: request.payload.source
	};
  
	if(request.payload.proxy){
	  options.proxy = request.payload.proxy;
	}	
  
	options.request =  request.info;
  
	// add capture here
	captures.unshift( options );
	if(captures.length > 5){
	  captures.pop()
	}
	renderJSON( request, h, null, options ); 
  }
  
  async function displayCapture(request, h) {
	renderJSON( request, h, null, captures );
  }
  
  // used to discover webmention API endpoint
  async function discoverEndpoint(request, h) { 
	var options = {
	  url: request.query.url
	};
  
	// use node url parser to check format
	if( urlParser.parse( options.url ) ){
	  webmentions.discoverEndpoint( options, function( error, result ){
		renderJSON( request, h, error, result );
	  }); 
	} else {
	  renderJSON( request, h, utils.buildError( 400, 'bad request', 'The url are not in the correct format'), {} );
	}
  }
  
  // used to validate and then proxy webmention request
  async function proxyMention(request, h) { 
	var options = {
	  target: request.query.target,
	  source: request.query.source
	};
  
	if(request.query.proxy){
	  options.proxy = request.query.proxy;
	}
  
	webmentions.proxyMention( options, function( error, result ){
	  renderJSON( request, h, error, result );
	}); 
  }
  
  // used to validate a webmention request
  async function validateMention(request, h) { 
	var options = {
	  target: request.query.target,
	  source: request.query.source
	};
  
	if(request.query.proxy){
	  options.proxy = request.query.proxy;
	}	
  
	webmentions.validateMention( options, function( error, result ){
	  renderJSON( request, h, error, result );
	}); 
  }
  
  // render json out to http stream
  async function renderJSON( request, h, err, result ){
	if(err){
	  console.log(err)
	  if(err.code === 404){
		return h.response(new hapi.error.notFound(err.message));
	  } else {
		return h.response(new hapi.error.badRequest(err.message));
	  }
	} else {
	  return h.response(result).type('application/json; charset=utf-8');
	}
  }




exports.index = index;
exports.example = example;
exports.discoverEndpoint = discoverEndpoint;
exports.proxyMention = proxyMention;
exports.validateMention = validateMention;
exports.capture = capture;
exports.displayCapture = displayCapture;







