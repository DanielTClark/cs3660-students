'use strict';

const co = require('co');
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: process.env.IP,
    port: 3306,
    user: process.env['C9_USER'],
    password: '',
    database: 'students'
});

function call(callback) {
    return [callback.bind(null, null), callback.bind(null)];
}

module.exports = {
    create: function (stu, callback) {
        stu.startDate = new Date(stu.startDate);
        
        connection.query(
        `insert into students (id, fname, lname, startDate, street, city, state, zip, phone, year)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [stu.id, stu.fname, stu.lname, stu.startDate, stu.street, stu.city, stu.state, stu.zip, stu.phone, stu.year],
        function (err, results, fields) {
            if (err) return callback(err);
            callback(null, results.insertId);
        });
    },

    read: function (id, callback) {
        connection.query('select * from students where id = ?', [id], function (err, results) {
            if (err) return callback(err);
            if (results.length == 0) return callback('no results');
            callback(null, results[0]);
        });
    },

    update: function (id, stu, callback) {
        stu.startDate = new Date(stu.startDate);
        
        connection.query(
        `update students
        set fname = ?, lname = ?, startDate = ?, street = ?, city = ?, state = ?, zip = ?, phone = ?, year = ?
        where id = ?`,
        [stu.fname, stu.lname, stu.startDate, stu.street, stu.city, stu.state, stu.zip, stu.phone, stu.year, stu.id],
        function (err, results, fields) {
            if (err) return callback(err);
            callback(null);
        });
    },

    delete: function (id, callback) {
        connection.query(
            `delete from students
            where id = ?`,
            [id],
        function (err, results, fields) {
            if (err) return callback(err);
            callback(null);
        });
    },

    list: function (callback) {
        connection.query('select id from students', function (err, results) {
            if (err) return callback(err);
            callback(null, results.map(r => r.id));
        });
    }
}