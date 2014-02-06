/*!
 * urlexpand - index.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

'use strict';
var buffer		= require('buffer-concat'),
	http		= require('http'),
	https		= require('https'),
	urlutil		= require('url'),
	charset		= require('charset'),
	iconv		= require('iconv-lite');



// Glenn Jones added this to speed up requests
// This can use a lot of memory and needs updating for each use case
// -------------------------------------------

	http.globalAgent.maxSockets = 10000;
	https.globalAgent.maxSockets = 10000;

// -------------------------------------------



function handleCallback(err, url, callback) {
	if (callback.__called) {
		return;
	}
	callback.__called = true;
	callback(err, {
		url: url,
		title: callback.__title,
		count: callback.__redirectCounter,
		tracks: callback.__tracks
	});
}

var TITLE_RE = /<title>([^<]+)</i;

function getTitle(data, cs) {
	cs = iconv.encodings[cs] ? cs : 'utf8';
	var text = iconv.decode(data, cs);
	var m = TITLE_RE.exec(text);
	return m ? m[1].trim() : null;
}

/**
 * Expand a shorten url, return the original url and the redirect histories.
 * 
 * @param {String} url, the url you want to expand.
 * @param {Object} [options]
 *  - {Number} [redirects], max redirect times, default is `5`.
 *  - {Boolean} [title], get title or not, default is `true`.
 *  - {Number} [timeout], request timeout, default is `10000` ms.
 * @param {Function(err, data)} callback
 *  - {Object} data {
 *    {String} url: the last status 200 url.
 *    {String} title: the last status 200 html page title, maybe empty.
 *    {Number} count: need redirect times.
 *    {Array} tracks: the handle tracks. `[{ url: $url, headers: $headers, statusCode: 301 }, ... ]`
 *  }
 */
function expand(url, options, callback) {
	if (typeof options === 'function') {
		callback = options;
		options = null;
	}
	options = options || {};
	options.redirects = options.redirects || 5;
	if (options.title === undefined) {
		options.title = true;
	}
	options.timeout = options.timeout || 10000;
	var info = urlutil.parse(url || '');
	if (!info.hostname) {
		return callback();
	}
	var reqOptions = {
		hostname: info.hostname,
		path: info.path,
		method: 'GET'
	};
	if (info.port) {
		reqOptions.port = info.port;
	}
	if (callback.__redirectCounter === undefined) {
		callback.__redirectCounter = 0;
		callback.__tracks = [];
	}
	var request = http.request;
	if (info.protocol === 'https:') {
		request = https.request;
	}
	var req = request(reqOptions);
	var timer = null;
	req.on('response', function (res) {
		callback.__tracks.push({
			url: url,
			headers: res.headers,
			statusCode: res.statusCode
		});
		if (res.statusCode === 302 || res.statusCode === 301) {
			clearTimeout(timer);
			callback.__redirectCounter++;
			var location = urlutil.resolve(url, res.headers.location);
			if (callback.__redirectCounter > options.redirects) {
				return handleCallback(null, location, callback);
			}
			return expand(location, options, callback);
		}

		if (!options.title) {
			clearTimeout(timer);
			res.destroy();
			return handleCallback(null, url, callback);
		}

		// get the title
		var buffers = [];
		var size = 0;
		res.on('data', function (chunk) {
			buffers.push(chunk);
			size += chunk.length;
		});
		res.on('end', function () {
			clearTimeout(timer);
			var data = Buffer.concat(buffers, size);
			var cs = charset(res.headers, data) || 'utf8';
			var title = getTitle(data, cs);
			callback.__title = title;
			handleCallback(null, url, callback);
		});
	});
	req.on('error', function (err) {
		callback.__tracks.push({
			url: url,
			error: req.isTimeout ? 'request timeout' : err.message
		});
		handleCallback(err, url, callback);
	});
	req.end();
	timer = setTimeout(function () {
		req.isTimeout = true;
		req.abort();
	}, options.timeout);
}

module.exports = expand;
