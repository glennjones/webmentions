const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const Blipp = require('blipp');
const HapiSwagger = require('hapi-swagger');
const { swaggerOptions } = require('./swaggerOptions.js');
const { routes } = require('../lib/routes.js');
const utils = require('../lib/utilities.js');
config = require('../config.js');

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3051;
 
// refines configure using server context

config = utils.processConfig( config )
if( config.proxy.url ){
    console.log(['start'],'using proxy',config.proxy.url); 
}

const serverOptions = {
    host,
    port,
    debug: { request: ['error'] },
    routes: {
        response: {
            modify: true,
        },
    }
};



(async () => {
    // create server
    const server = new Hapi.Server(serverOptions);
    // add swagger UI plugin
    await server.register([
      Inert,
      Vision,
      Blipp,
      { plugin: HapiSwagger, options: swaggerOptions },
    ]);

    server.views({
        engines: {
            html: require('handlebars')
        },
        relativeTo: __dirname.replace('/bin', ''),
        path: 'templates',
        partialsPath: 'templates/withPartials',
        helpersPath: 'templates/helpers',
        isCached: false
    });

    // register routes
    server.route(routes);
    // add basic logger
    server.events.on(
      'response',
      ({ info, method, path }) => {
        console.info(`[${info.remoteAddress}] ${method.toUpperCase()}: ${path}`);
      }
    );

    server.ext('onPreResponse', (request, h) => {
        const response = request.response;
        console.log('request', request.info.host, request.path, request.payload, request.querystring);
        if (!response.isBoom) {
          return h.continue;
        } else {
          console.error('error', response);
          return h.continue;
        }
        /*
          // Replace error with friendly HTML
          const error = response;
          const ctx = {
            message: (error.output.statusCode === 404 ? 'page not found' : 'something went wrong')
          };
          return h.view('error', ctx);
        */
      });
    
    // start server
    await server.start();
    console.info('Server running at:', server.info.uri);
})();

 





