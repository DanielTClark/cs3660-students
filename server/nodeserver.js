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
const express = require('express');
const morgan = require('morgan');
const favicon = require('serve-favicon');
const compression = require('compression');
const http = require('http');
const fs = require('fs');
const path = require('path');

const WEBPATH = path.join(__dirname, '../web');
const SRVPATH = __dirname;

// INIT
const app = express();
const server = http.createServer(app);

console.log("Fetching student data");
//let students = JSON.parse(fs.readFileSync(path.join(SRVPATH, 'students', 'students.json')));

// MIDDLEWARE
app.use(morgan('dev'));
app.use(compression());

app.use((req, res, next) => {
    res.set("X-Powered-By", "Sacrificing the chosen on the bloodstone");
    next();
});

app.use(favicon(path.join(WEBPATH, 'favicon.ico')));
app.use(express.static(WEBPATH));

// REST END POINTS
// Create
app.post('/api/v1/students', (req, res) => {
    
});

// Read
app.get('/api/v1/students/:studentId.json', (req, res) => {
    let id = req.params.studentId;
    res.sendFile(path.join(SRVPATH, 'students', `${id}.json`));
});

// Update
app.put('/api/v1/students/:studentId.json', (req, res) => {
    
});

// Delete
app.delete('/api/v1/students/:studentId.json', (req, res) => {
    
});

// List
app.get('/api/v1/students.json', (req, res) => {
    fs.readdir(path.join(SRVPATH, 'students'), (err, files) => {
        if (err) res.sendStatus(500);
        res.send(files);
    });
});

// 404
app.get('*', (req, res) => {
    res.status(404).sendFile(path.join(WEBPATH, '404.html'));
});

// LISTEN
server.listen(process.env.PORT, process.env.IP, () => {
   console.log(`Server listening on PORT ${process.env.PORT}`); 
});

// SIGNAL HANDLING
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function shutdown() {
    console.log('\nServer shutting down...');
    server.close(() => {
        console.log('\nServer terminated');
        process.exit();
    });
}