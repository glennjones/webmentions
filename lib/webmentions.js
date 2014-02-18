
'use strict';
var urlParser       = require('url'),
	request			= require('request'),
	cheerio			= require('cheerio'),
	entities		= require('entities'),
	microformats	= require('microformat-node'),
	urlExpander		= require('../lib/expand'),
	utils			= require('../lib/utilities.js');


var httpHeaders = {
	'Accept': '*/*',
	'Accept-Charset': 'utf-8',
	'Cache-Control': 'no-cache',
	'Connection': 'keep-alive',
	'Pragma': 'no-cache',
	'User-Agent': 'transmat-webmentions',
	'X-TransmatMaxAge' : 2000 
};	


module.exports = {

	// discovers a webmention API endpoint from a given URL
	discoverEndpoint: function ( options, callback ){
		console.log('webmentions discoverEndpoint')
		getURLContent( options, function( err , data ){
			if( err ){
				callback( err, null );
			}else{
				var body = data.body,
					response = data.response,
					webmention = null,
					dom,
					node;

				dom = cheerio.load(body);
				node = dom.root();
				parseEndpoint(options.url, response, body, dom, node, function( err, webmention ){
					if( err ){
						callback( err, null );	
					}else{
						callback( null, {'endpoint': webmention} );
					}
				});								
			}
		})
	},


	// validates the webmention request and returns the comment entry and author
	proxyMention: function( options, callback){
		console.log('webmentions proxyMention')
		var context = this;
		validateMentionOptions( options, function( err, valid){
			if( valid ){

				// get target - this is the original entry to be commented on
		    	getURLContent( {'url': options.target}, function( err , data ){
					if(!err){
						var body = data.body,
							response = data.response,
							dom,
							node;

						dom = cheerio.load(body);
						node = dom.root();
						// get webmention endpoint
						parseEndpoint(options.target, response, body, dom, node, function( err, webmention ){
							if( !err ){
								if(webmention){
									var requestOptions = {
										uri: webmention,
										method: 'POST',
										pool: {
												maxSockets: 10000
											},
										timeout: 10000,
										headers: httpHeaders,
										form: options
									}
									request(requestOptions, function(requestErrors, response, body) {
										if (!requestErrors && (response.statusCode >= 200 && response.statusCode < 300 ) ) {
											console.log('webmention successful:', options)
											callback( null, {'statusCode': response.statusCode, 'message': 'webmention forwarded successfully'} );
										} else {
											console.log('webmention failed:', options)
											if(response && response.statusCode && response.statusCode > 399){
												callback( utils.buildError( response.statusCode, null, null), null  );
											}else{
												callback( utils.buildError( 400, 'bad request', requestErrors), null  );
											}
										}
									}); 
								}else{
									callback( utils.buildError( 400, 'bad request', 'could not find a webmention API endpoint for - ' + options.target), null  );
								}
							}else{
								callback( err, null );
							}
						});	
					}else{
						callback( err, null );
					}		
		    	});
			}else{
				callback( err, null );
			}
		});
	},


	// validates the webmention request
	validateMention: function ( options, callback ){
		console.log('webmentions validateMention')
		var context = this;
		validateMentionOptions( options, function( err, valid){
			if( valid ){
				context.getMentionData( options, function( err, data ){
					if(!err && data){
						var match = matchUrls( options.target, data.source );
						if( match ){
							data.isValid = match.matched;
							data.matchedWith = match.matchedWith;
						}
					}

					callback( err, data );
				});
			}else{
				callback( err, null );
			}
		});
	},


	// gets webmention data from source and target urls
	getMentionData: function ( options, callback ){
		console.log('webmentions getMentionData')
		var out = { 
				'isValid': false, 
				'matchedWith': null, 
				'target': {}, 
				'source': {} 
			},
			count = 0;

		// outs for parallel processing of data
		function release(){
			if(count === 2){
				callback( null, out );
			}
		}

		// get target - is the original entry to be commented on
    	getURLContent( {'url': options.target}, function( err , data ){
			if(!err){
				var body = data.body,
					response = data.response,
					webmention = null,
					dom,
					node;

				dom = cheerio.load(body);
				node = dom.root();
				// get webmention endpoint
				parseEndpoint(options.target, response, body, dom, node, function( err, webmention ){
					if( !err ){
						out.target = {
					    	'url': [options.target],
					    	'endpoint': webmention
					    }
					    count++
					    release();
					}else{
						callback( err, null );
					}
				});	
			}else{
				callback( err, null );
			}		
    	});
			    
    	// get source - is the comment
    	getURLContent( {'url': options.source}, function( err , data ){
    		console.log('webmentions getURLContent')
			if(!err){
	    		var body = data.body,
					response = data.response,
					dom,
					node,
					links =[],
					urls = [];


				dom = cheerio.load(body);
				node = dom.root();

				// get all urls within the page
				console.log('webmentions find(a)')
				dom(node).find('a').each(function(i, elem) {
				  var url = dom(this).attr('href');
				  if( url && utils.isString(url) ){
				  	urls.push( absoluteUrl( options.source, url ) );
				  } 
				});

				// get microformats
				console.log('webmentions microformats.parseDom')
				microformats.parseDom(dom, node, {baseUrl: options.source}, function( err, data ){
					if(!err){
						var entries = microformatsOfType( data, 'h-entry' );
					    out.source = {
					    	'url': [options.source],
					    	'links': urls
					    }
					    if(entries && entries.length > -1){
					    	out.source.entry = entries[0];
					    }
					}else{
						console.log('microformats parser err ', err)
					}
				    count++
		    		release();
				});	
			}else{
				callback( err, null );
			}	
    	});
			   
	}
}



// discovers a webmention API endpoint from request/cheerio objects
function parseEndpoint(url, response, body, dom, node, callback){
	console.log('webmentions parseEndpoint')
	var webmention = null;

	// process microformats to get rel="*"
	console.log('webmentions microformats.parseDom')
	microformats.parseDom(dom, node, {}, function(err, data){
	    
	    // find in rels="*"
	    //	<link rel="webmention" href="http://glennjones.net/webmention" />
		//	<link rel="http://webmention.org/" href="http://glennjones.net/webmention" />
	    if( data && data.rels ){
		  	for (var prop in data.rels) {
		      	if(data.rels.hasOwnProperty(prop)){
		      		if(prop === 'webmention'){
						webmention = data.rels[prop][0];
						break;
					}
		      		if(prop === 'http://webmention.org/'){
						webmention = data.rels[prop][0];
						break;
					}
			      	}
				}
	    }


	    // find in header 
	    // "link: "<http://glennjones.net/webmention/>; rel="webmention""
	    if(!webmention){
	    	if( response && response.headers ){
			  	for (var prop in response.headers) {
			      	if(response.headers.hasOwnProperty(prop)){
			      		if(prop === 'link'){
							var str = response.headers[prop];
							if(str.indexOf('webmention') > -1 && str.indexOf(';') > -1){
								var items = str.split(';');
								if( utils.trim(items[1]) === 'rel="webmention"' ){
									webmention = items[0].replace('<','').replace('>','')
									break;
								}
							}
						}
			      	}
				}
	   		}
	    }

	    if(webmention){
	    	webmention = absoluteUrl( url, webmention ); 
	    }

	    callback( err, webmention );

	}); 
}


// request the url content
function getURLContent( options, callback ){
	console.log('webmentions getURLContent')
	if(options.url){

		if(options.url === undefined 
			|| utils.isString(options.url) === false
			|| urlParser.parse( options.url ) === null){
			callback( utils.buildError( 400, 'bad request', 'The url seems not to be in the correct formatted'), null  );
		}

		var requestOptions = {
			uri: options.url,
			pool: {
					maxSockets: 10000
				},
			timeout: 10000,
			headers: httpHeaders
		}
		if(options.proxy){
			requestOptions.proxy = options.proxy;
		}

		request(requestOptions, function(requestErrors, response, body) {
			if (!requestErrors && response.statusCode === 200) {
				console.log('webmentions pulled html:', options.url)
				callback( null, {'response': response, 'body': body} );
			} else {
				console.log('failed:', options.url)
				if(response && response.statusCode && response.statusCode > 399){
					callback( utils.buildError( response.statusCode, null, options.url), null  );
				}else{
					callback( utils.buildError( 400, 'bad request', requestErrors + ' - ' + options.url), null  );
				}
			}
		}); 

	}else{
		callback( utils.buildError( 400, 'bad request', 'no url was given'), null  );
	}		
}


function matchUrls( targetUrl, sourceData, callback ){
	console.log('webmentions matchUrls')
	var matched = false,
		matchedWith = null,
		entry = sourceData.entry,
		links = sourceData.links,
		i,
		x;

	targetUrl = removeProtocols( targetUrl );	

	// does microformats data have a h-entry
	// we do this for speed rather than try match all urls frist
	if(entry && entry.properties && entry.properties['in-reply-to']){
		var replyTo = entry.properties['in-reply-to'];
		// make sure its an array
		if( utils.isArray( replyTo ) ){
			// loop array
			i = replyTo.length;
			while (i--) {
				// is 'in-reply-to' a string
			    if( utils.isString( replyTo[i] ) ){
			    	if( removeProtocols(replyTo[i]) === targetUrl ){
			    		matched = true;
			    		matchedWith = 'in-reply-to string';
			    		break
			    	}
			    // is 'in-reply-to' a object
			    }else{
			    	if( replyTo && replyTo[i].properties && replyTo[i].properties.url ){
			    		x = replyTo[i].properties.url.length;
						while (x--) {
							if( removeProtocols(replyTo[i].properties.url[x]) === targetUrl ){
					    		matched = true;
					    		matchedWith = 'in-reply-to object property';
					    		break
					    	}
						}
			    	}
			    }
			}
		}
	}
	

	if(matched === false){
		i = links.length;
		while (i--) {
			if( removeProtocols(links[i]) === targetUrl ){
	    		matched = true;
	    		matchedWith = 'url';
	    		break
	    	}
		}
	}

	return {'matched': matched, 'matchedWith': matchedWith};

}


// get root level microformats of a given type
function microformatsOfType( json, name ){
	console.log('webmentions microformatsOfType')
	var out = [],
		x,
		i;

	if(json && json.items && name ){
		i = json.items.length;
		x = 0;
		while (x < i) {
			if( json.items[x].type && json.items[x].type.indexOf(name) > -1 ){
	    		out.push( json.items[x] );
	    	}
	    	x++;
		}
	}
	return out;
}


// checks that the option object is valid
function validateMentionOptions( options, callback ){
	console.log('webmentions validateMentionOptions')
	var err = null;

	if(testUrl( options.source, 'source' ) && testUrl( options.target, 'target' )){
		if(removeProtocols( options.source ) !== removeProtocols( options.target )){
			callback(null, true);
		}else{
			callback( utils.buildError( 400, 'bad request', 'the target and source url should not be the same'), null  );
		}
	}else{
		callback( err, null );
	}

	function testUrl( url, name ){
		if( url && utils.isString( url ) ){
			if(urlParser.parse( url ) ){
				return true;
			} else {
				err = utils.buildError( 400, 'bad request', name + ' url is not in the correct format - ' + url);
				return false;
			}
		}else{
			err = utils.buildError( 400, 'bad request', name + ' url is not in the correct format - ' + url);
			return false;
		}
	}
}


// removes protocols for matching urls
function removeProtocols ( url ){
	console.log('webmentions removeProtocols')
	return url.replace('http://','//').replace('https://','//');
}


// make sure that url is absolute
function absoluteUrl( url, urlFragment ){
	console.log('webmentions absoluteUrl')
	if(utils.startWith(urlFragment, 'http')){
		return urlFragment;
	}else{
		return urlParser.resolve(url, urlFragment)
	}
}

