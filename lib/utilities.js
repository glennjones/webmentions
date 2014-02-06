
'use strict';
var marked          = require('marked'),
	fs              = require('fs');


module.exports = {


	// refines configure using server context
	processConfig: function( config ){
		// get the options for the right server setup
		var out = {},
		    serverMode = (process.env.NODE_ENV) ? process.env.NODE_ENV : 'development';

		// loop object properties and add them to root of out object
		for (var key in config.environments[serverMode]) {
		    if (config.environments[serverMode].hasOwnProperty(key)) {
		        out[key] = config.environments[serverMode][key];
		    }
		}

		if(process.env.HOST){
		    out.server.host = process.env.HOST;
		}
		if(process.env.PORT){
		    out.server.port = parseInt(process.env.PORT, 10);
		}
		if(process.env.PROXY_HOST){
		    out.proxy.host = process.env.PROXY_HOST;
		}
		if(process.env.PROXY_PORT){
		    out.proxy.port = parseInt(process.env.PROXY_PORT, 10);
		}
		if(process.env.PROXY_USERNAME){
		    out.proxy.username = process.env.PROXY_USERNAME;
		}
		if(process.env.PROXY_PASSWORD){
		    out.proxy.password = process.env.PROXY_PASSWORD;
		}

		// allows for custom port
		if(process.env.TO_MIRCOFORMATS_PORT){
		    out.server.port = parseInt(process.env.TO_MIRCOFORMATS_PORT, 10);
		}

		if(process.env.TO_MIRCOFORMATS_BASEPATH){
		    out.server.basepath = process.env.TO_MIRCOFORMATS_BASEPATH;
		}

		// add modulus information
		if (process.env.SERVO_ID && process.env.CLOUD_DIR) {
			this.host = this.host ? this.host : {};
			this.host.clouddir = process.env.CLOUD_DIR;
			this.host.servoid = process.env.SERVO_ID;
		}

		if(out.proxy.host && out.proxy.port && out.proxy.username && out.proxy.password){
			out.proxy.url = 'http://' 
				+ out.proxy.username + ':' 
				+ out.proxy.password + '@'
				+ out.proxy.host + ':'
				+ out.proxy.port + '/';
		}

		return out;
	},


	// read a file and converts the markdown to HTML
	getMarkDownHTML: function( path, callback ){
			fs.readFile(path, 'utf8', function (err,data) {
				if (!err) {
					marked.setOptions({
						gfm: true,
						tables: true,
						breaks: false,
						pedantic: false,
						sanitize: true,
						smartLists: true,
						smartypants: false,
						langPrefix: 'language-',
						highlight: function(code, lang) {
							return code;
						}
					});
					data = marked(data);           
				}
				callback( err, data );
			});
	},


	// return error object
	buildError: function( code, err, message ){
		code = (code || isNaN(code))? code : 500;
		err = (err)? err : '';
		message = (message)? message : '';

		return {
			'code': code,
			'error': err,
			'message': message
		}
	},


	generateID: function() {
			return ('0000' + (Math.random()*Math.pow(36,4) << 0).toString(36)).substr(-4);
	},

	// is the object a string
	isString: function( obj ) {
		return typeof( obj ) === 'string';
	},


	// does a string start with the test
	startWith: function( str, test ) {
		return(str.indexOf(test) === 0);
	},


	// remove spaces at front and back of string
	trim: function( str ) {
		if(this.isString(str)){
			return str.replace(/^\s+|\s+$/g, '');
		}else{
			return '';
		}
	},


	// is a string only contain white space chars
	isOnlyWhiteSpace: function( str ){
		return !(/[^\t\n\r ]/.test( str ));
	},


	// removes white space from a string
	removeWhiteSpace: function( str ){
		return str.replace(/[\t\n\r ]+/g, ' ');
	},


	// is the object a array
	isArray: function( obj ) {
		return obj && !( obj.propertyIsEnumerable( 'length' ) ) && typeof obj === 'object' && typeof obj.length === 'number';
	},


	// simple function to find out if a object has any properties. 
	hasProperties: function( obj ) {
		var key;
		for(key in obj) {
			if( obj.hasOwnProperty( key ) ) {
				return true;
			}
		}
		return false;
	},


	// http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
	merge: function() {
		var obj = {},
			i = 0,
			il = arguments.length,
			key;
		for (; i < il; i++) {
			for (key in arguments[i]) {
				if (arguments[i].hasOwnProperty(key)) {
					obj[key] = arguments[i][key];
				}
			}
		}
		return obj;
	},


	dateNumber: function (n) {
		return n < 10 ? '0' + n : n.toString();
	}


};