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
const express     = require('express');
const morgan      = require('morgan');
const favicon     = require('serve-favicon');
const compression = require('compression');
const bodyParser  = require('body-parser');
const urlParser   = bodyParser.urlencoded({ extended:false });
const http        = require('http');
const fs          = require('fs');
const path        = require('path');

const WEBPATH = path.join(__dirname, '../web');
const SRVPATH = __dirname;

// INIT
const app = express();
const server = http.createServer(app);

console.log("Initializing server");

let maxId;
{
    let ids = fs.readdirSync(path.join(SRVPATH, 'students'))
                .map(f => parseInt(f.split('.')[0]));
                    
    maxId = Math.max.apply(this, ids);
}

console.log(`Max student ID is: ${maxId}`);

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
app.post('/api/v1/students', urlParser, (req, res) => {
    let student = req.body;
    console.log(student);
    res.status(201) // Created
       .json(zeroPad(++maxId));
});

// Read
app.get('/api/v1/students/:studentId.json', (req, res) => {
    let id = req.params.studentId;
    res.sendFile(path.join(SRVPATH, 'students', `${id}.json`));
});

// Update
app.put('/api/v1/students/:studentId.json', urlParser, (req, res) => {
    let id = req.params.studentId;
    res.sendStatus(204); // No Content
});

// Delete
app.delete('/api/v1/students/:studentId.json', (req, res) => {
    let id = req.params.studentId;
    res.sendStatus(204); // No Content
});

// List
app.get('/api/v1/students.json', (req, res) => {
    fs.readdir(path.join(SRVPATH, 'students'), (err, files) => {
        if (err) return res.sendStatus(404);
        res.send(files.map(f => f.split('.')[0]));
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

// HELPER FUNCTIONS
function zeroPad(num) {
    let str = '0000' + num;
    return str.substr(-4);
}