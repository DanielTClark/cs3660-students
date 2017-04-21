/*
Author: Daniel Clark

Design Docs At:
https://drive.google.com/folderview?id=0B-IJ4PvYye6hel9pZF9DNDg4S00&usp=sharing

How to run this project on your own c9 box:

Make sure that your node install is updated to v6.3.1 or greater
Guide here: https://community.c9.io/t/how-to-update-node-js/1273/2

Go to the folder where you want it.
Type the following commmands.

git clone https://github.com/silvri/cs3660-students.git
cd cs3660-students
npm install
npm start

*/
'use strict';
const express     = require('express');
const morgan      = require('morgan');
const favicon     = require('serve-favicon');
const compression = require('compression');
const http        = require('http');
const fs          = require('fs');
const path        = require('path');
const nconf       = require('nconf');
const router      = require('./studentsRest.js');
const winston     = require('winston');
const expressWinston = require('express-winston-2');
const winstonConf = require('./conf/winstonconf.js');

nconf.argv().env().file({ file: './conf/serverconf.json' });

nconf.defaults({
    'webpath': path.resolve(__dirname, '../web'),
    'srvpath': __dirname,
    'port': 8080,
    'ip': '0.0.0.0'
});

const WEBPATH = path.resolve(nconf.get('webpath'));
const SRVPATH = path.resolve(nconf.get('srvpath'));

// Init
const app = express();
const server = http.createServer(app);

console.log("Initializing server...");

// Middleware
app.use(morgan('dev'));
app.use(expressWinston.logger(winstonConf));
app.use(compression());

app.use((req, res, next) => {
    res.set("X-Powered-By", "Sacrificing the chosen on the bloodstone");
    next();
});

app.use(favicon(path.resolve(WEBPATH, 'favicon.ico')));
app.use(express.static(WEBPATH));

// Router
app.use('/api/v1', router);

// 404
app.get('*', (req, res) => {
    res.status(404).sendFile(path.resolve(WEBPATH, '404.html'));
});

// Listen
let port = nconf.get('port');
server.listen(port, nconf.get('ip'), () => {
   console.log(`Server listening on PORT ${port}`);
});

// Signal handling
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function shutdown() {
    console.log('\nServer shutting down...');
    server.close(() => {
        console.log('\nServer terminated');
        process.exit();
    });
}