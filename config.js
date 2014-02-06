module.exports = {
    "site": {
        "name": "webmentions",
    },
    "environments": {
        "development": {
            "server": {
                "host": "localhost",
                "port": 3008,
            },            
            "proxy" : {
              "port": 3001,
              "username": "3UWeT658816j46nB",
              "password": "5mz232a15NW264ax"
            }
        },
        "production": {
            "server": {
                "host": "0.0.0.0",
                "port": 8000,
            },            
            "proxy" : {
              "port": 3001,
              "username": "3UWeT658816j46nB",
              "password": "5mz232a15NW264ax"
            }
        }
    }
}