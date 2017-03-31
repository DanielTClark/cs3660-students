'use strict';

const fs = require('fs');
const path = require('path');
const colors = require('colors');

module.exports = studentFSDao;

function studentFSDao(srvpath) {

    const SRVPATH = srvpath;

    let maxId;
    {
        let ids = fs.readdirSync(path.join(SRVPATH, 'students'))
            .map(f => parseInt(f.split('.')[0]));

        maxId = Math.max(...ids);

        console.log(`Max id: ${maxId}`);
    }

    return {
        create: function (student, callback) {
            let id = zeroPad(++maxId);
            fs.writeFile(path.join(SRVPATH, 'students', `${id}.json`), JSON.stringify(student), (err) => {
                callback(err, id);
            });
        },

        read: function (id, callback) {
            fs.readFile(path.join(SRVPATH, 'students', `${id}.json`), (err, data) => {
                callback(err, data);
            });
        },

        update: function (id, student, callback) {
            fs.writeFile(path.join(SRVPATH, 'students', `${id}.json`), JSON.stringify(student), callback);
        },

        delete: function (id, callback) {
            fs.unlink(path.join(SRVPATH, 'students', `${id}.json`), callback);
        },

        list: function (callback) {
            fs.readdir(path.join(SRVPATH, 'students'), (err, files) => {
                callback(err, files.map(f => f.split('.')[0]));
            });
        }
    };
}

// HELPER FUNCTIONS
function zeroPad(num) {
    let str = '0000' + num;
    return str.substr(-4);
}