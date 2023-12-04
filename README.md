## An API of helper functions for consuming webmentions

__This is a 9-year-old historical project - It is left up as an archive.__



[Webmentions](http://indiewebcamp.com/webmention) are an interesting method of notify another site that a comment/post on your own site is written in response to a post on their site. The site receiving the webmention notification can then verify the request and gather the message adding into a conversation flow in their post. You can read more about webmention on the  [indiewebcamp](http://indiewebcamp.com/) site.

This node module provides a number of functions that will help you add the ability to consumes webmentions to your site


## Install
Add once its mature enough to put on NPM.

or

    git clone http://github.com/glennjones/webmentions.git

    
## Run

1. Move into the project directory `$ cd webmentions`
2. Run `$ npm install`
3. Run `$ node bin/webmentions.js`
4. Connect to the server using `http://localhost:3008`


## discoverEndpoint
Makes a request to the URL provided and trys to discover the webmentions API endpoint, the module will parse both the HTML or HTTP header in its search for the endpoint url. 

    var webmentions = require('webmentions'),
        options = {'url': 'http://example.com/'};

    webmentions.discoverEndpoint( options, function( err, data ){
      if(!err && data.endpoint){
        // do something with data.endpoint
      }
    })
    
If the request is completed without error the response is returned in the following format:

    {
      "endpoint": "http://example.com/webmention/"
    }



## proxyMention
Allow you enter both the source and target URLs for webmention request. The method discovers the correct webmention request API endpoint and fires the webmention request on your behave. 

    var webmentions = require('webmentions'),
        options = {
          'source': 'http://example.com/comment',
          'target': 'http://example.com/post',
        };

    webmentions.proxyMention( options, function( err, data ){
      if(!err){
        // do something
      }
    })

If the request is completed without error the response is returned in the following format:

    {
      "statusCode": 200,
      "message": "forwarded successfully to: http://example.com/webmention/"
    }



## validateMention
Makes a request to the source and target URLs validates the webmention by checking the pages are linked. The JSON also returns the first h-entry found on the source page. This method should give you everything you need to consume webmention request. 

    var webmentions = require('webmentions'),
        options = {
          'source': 'http://example.com/comment',
          'target': 'http://example.com/post',
        };

    webmentions.validateMention( options, function( err, data ){
      if(!err && data){
        // do something with data
      }
    })


If the request is completed without error it should contain four top level properties:

  1. `isValid` - weather pages are interlinked correctly
  2. `matchedWith` - how the URLs where matched
  3. `target`
    1. `url` - the `target` URL passed in the options object
    2. `endpoint` - a webmention API endpoint if found
  4. `source` 
    1. `url` - the `source` URL passed in the options object
    2. `links` - all the links fron within the source page
    3. `entry` - the first [h-entry](http://microformats.org/wiki/h-entry) found in the source page


The response is returned in the following format:

    {
      "isValid": true,
      "matchedWith": "in-reply-to string",
      "target": {
        "url": "http://example.com/notes/2014-02-02-1",
        "endpoint": "http://example.com/webmention"
      },
      "source": {
        "url": "http://example.com/notes/2014-02-03-1",
        "links": [
          "http://example.com/articles",
          "http://example.com/notes",
          "http://example.com/events",
          "http://example.com/about",
          "http://example.com/projects",
          "http://example.com/tools",
          "http://example.com/",
          "http://example.com/notes/2014-02-03-1",
          "http://example.com/notes/2014-02-02-1",
          "https://twitter.com/example/status/430360177393799168",
          "https://twitter.com/intent/favorite?tweet_id=430360177393799168",
          "https://twitter.com/intent/retweet?tweet_id=430360177393799168",
          "https://twitter.com/intent/tweet?in_reply_to=430360177393799168",
          "https://twitter.com/example",
          "https://github.com/example",
          "http://delicious.com/example/",
          "http://lanyrd.com/people/example/",
          "https://plus.google.com/u/0/example/about",
          "http://www.linkedin.com/in/example",
          "http://www.slideshare.net/example/presentations",
          "http://creativecommons.org/licenses/by-nc/3.0/deed.en_US"
        ],
        "entry": {
          "type": [
            "h-entry",
            "h-as-note"
          ],
          "properties": {
            "name": [
              "test the input stream"
            ],
            "content": [
              {
                "value": "test posting a webmention",
                "html": "test posting a <strong>webmention</strong>"
              }
            ],
            "url": [
              "http://example.com/notes/2014-02-03-1"
            ],
            "in-reply-to": [
              "http://example.com/notes/2014-02-02-1"
            ],
            "published": [
              "2014-02-03T15:20:32.120Z"
            ],
            "syndication": [
              "https://twitter.com/example/status/430360177393799168"
            ],
            "author": [
              {
                "value": "Glenn Jones Exploring semantic mark-up and data portability. twitter (glennjones) github (glennjones) delicious (glennjonesnet) lanyrd (glennjones) google+ (105161464208920272734) linkedin (glennjones) slideshare (glennjones) © 2013 Glenn Jones. The text and photo's in this blog are licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License. The code examples are licensed under a MIT License.",
                "type": [
                  "h-card"
                ],
                "properties": {
                  "photo": [
                    "http://example.com/images/photo-small.png"
                  ],
                  "url": [
                    "https://twitter.com/example",
                    "https://github.com/example",
                    "http://delicious.com/example/",
                    "http://lanyrd.com/people/example/",
                    "https://plus.google.com/u/0/example/about",
                    "http://www.linkedin.com/in/example",
                    "http://www.slideshare.net/example/presentations"
                  ],
                  "name": [
                    "Glenn Jones"
                  ],
                  "summary": [
                    "Exploring semantic mark-up and data portability."
                  ]
                }
              }
            ]
          }
        }
      }
    }


## Errors

The error format can have any combination of 4 properties; code, error, message and validation. The optional fourth property validation, is added to HTTP request if a input value is in the incorrect format. 
    
    {
      "statusCode": 400,
      "error": "Bad Request",
      "message": "the value of url must be a string",
      "validation": {
    		"source": "query",
    		"keys": [
      		"url"
    		]
  		}
    }



## Mocha integration test
The project has a number integration and unit tests. To run the test, `cd` to project directory type the following command

    $ mocha --reporter list




