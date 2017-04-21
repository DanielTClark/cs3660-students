const MongoClient = require('mongodb').MongoClient;
const url = `mongodb://${process.env.IP}/students`;
const colors = require('colors');

const students = require('./students.json');

MongoClient.connect(url, function(err, db) {
    if (err) return console.log('Unable to connect to db'.red);
    
    console.log('Connected to db');
    
    // db.collection('students').insertMany(students, function(err, result) {
    //     if (err) throw err;
    //     console.log(result);
    //     db.close();
    // });
    
    db.collection('students').find(null, function(err, result) {
        console.log(result.toArray().then(function(result) {
            console.log(result);
            db.close();
        }));
    });
});