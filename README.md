# EXPERIMENTAL BETA API 
(Could change at any time, do not use in production code)
---

# An API of helper function for providing and consuming webmentions

The API allows to to query pages on social media sites and return JSON base on the information markup within the HTML. The JSON is format using the [microformats 2](http://microformats.org/wiki/microformats2) standard and follows the conventions of the [indieweb wiki](http://indiewebcamp.com/). The aim of this API is to help people recover content they have posted onto these sites.


## Install
This project is currently __not__ open sourced, this may change in the future.
   
    
    
## Run

1. Move into the project directory `$ cd webmentions`
2. Run `$ npm install`
3. Run `$ node bin/webmentions.js`
4. Connect to the server using `http://localhost:3008`


## Webmentions - Endpoint
Makes a request to the URL provided and trys to discover the webmentions API endpoint, the API will parse both the HTML or HTTP header in its search for the endpoint url. 

    http://localhost:3008/webmentions/endpoint/?url={url}/
    
If the request is completed without error the response is in the following format:

    {
      "endpoint": "http://glennjones.net/webmention/"
    }

If the URL provided does not have a webmention endpoint in the HTML or HTTP header the response will be null.

    {
      "endpoint": null
    }

## Errors

The error format can have any combination of 4 properties; code, error, message and validation. The fourth property validation, is added if a input value is in the incorrect format. 
    
    {
      "statusCode": 400,
  		"error": "Bad Request",
  		"message": "the value of url must be a string",
  		"validation": {
    		"source": "path",
    		"keys": [
      		"url"
    		]
  		}
	}



## Mocha integration test
The project has a number integration and unit tests. To run the test, `cd` to project directory type the following command

    $ mocha --reporter list




