'use strict';

const co = require('co');
const mysql = require('mysql');
const students = require('../students.json');
const connection = mysql.createConnection({
    host: process.env.IP,
    port: 3306,
    user: process.env['C9_USER'],
    password: '',
    database: 'students'
});

connection.query('delete from students;', function(err, results, fields) {
    if (err) throw err;
});

for (let stu of students) {
    
    stu.startDate = new Date(stu.startDate);
    
    connection.query(
        'insert into students (id, fname, lname, startDate, street, city, state, zip, phone, year) ' +
        `values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [stu.id, stu.fname, stu.lname, stu.startDate, stu.street, stu.city, stu.state, stu.zip, stu.phone, stu.year],
        function (error, results, fields) {
            if (error) throw error;
        });
}

