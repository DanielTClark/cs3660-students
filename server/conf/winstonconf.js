const winston = require('winston');

module.exports = {
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({
            filename: './errors.log',
            level: 'error'
        })
    ],
    getLogLevel: function(statusCode) {
        if(statusCode >= 400) {
            return "error"
        }
        return "info";
    }
}