/*
Author: Daniel Clark

Design Docs At:
https://drive.google.com/folderview?id=0B-IJ4PvYye6hel9pZF9DNDg4S00&usp=sharing
*/
const express = require('express');
const morgan = require('morgan');
const favicon = require('serve-favicon');
const compression = require('compression');
const http = require('http');
const fs = require('fs');
const path = require('path');

const WEBPATH = path.join(__dirname, '../web');

// INIT
const app = express();
const server = http.createServer(app);

console.log("Fetching student data");
let students = JSON.parse(fs.readFileSync('students.json'));

// MIDDLEWARE
app.use(morgan('dev'));
app.use(compression());

app.use((req, res, next) => {
    res.set("X-Powered-By", "Sacrificing the chosen on the bloodstone");
    next();
});

app.use(favicon(path.join(WEBPATH, 'favicon.ico')));
app.use(express.static(WEBPATH));

// ROUTES
app.get('/api/v1/students', (req, res) => {
    res.json(students);
});

app.get('/api/v1/students/:studentId', (req, res) => {
    let studentId = parseInt(req.params.studentId);
    res.json(students.find(s => s.id === studentId));
});

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