const { version } = require('../package.json');

module.exports = {
    swaggerOptions: {
        info: {
            title: 'Webmentions',
            version: version,
        },
    }
};