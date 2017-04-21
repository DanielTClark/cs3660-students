'use strict';

const MongoClient = require('mongodb').MongoClient;
const co = require('co');
const url = `mongodb://${process.env.IP}/students`;

function call(callback) {
    return [callback.bind(null, null), callback.bind(null)];
}

let maxId;

let mongoDao = {
    create: function (student, callback) {
        student.id = ++maxId;
        
        co(function*() {
            let db = yield MongoClient.connect(url);
            yield db.collection('students').insertOne(student);
            
            return student.id.toString();
        }).then(...call(callback));
    },

    read: function (id, callback) {
        co(function*() {
            let db = yield MongoClient.connect(url);
            let result = yield db.collection('students').find({id: parseInt(id)}).toArray();
            
            return result[0];
        }).then(...call(callback));
    },

    update: function (id, student, callback) {
        delete student._id;
        
        co(function*() {
            let db = yield MongoClient.connect(url);
            let result = yield db.collection('students').update({id: parseInt(id)}, student);
            yield db.close();
            
            return result;
        }).then(...call(callback));
    },

    delete: function (id, callback) {
        co(function*() {
            let db = yield MongoClient.connect(url);
            let result = yield db.collection('students').remove({id: parseInt(id)}, true);
            yield db.close();
            
            return result;
        }).then(...call(callback));
    },

    list: function (callback) {
        co(function*() {
            let db = yield MongoClient.connect(url);
            let result = yield db.collection('students').find({}, {id: 1}).toArray();
            yield db.close();
            
            return result.map(student => student.id);
        }).then(...call(callback));
    }
}

module.exports = mongoDao;

mongoDao.list(function (err, result) {
    if (err) throw err;
    maxId = Math.max(...result);
    console.log(`Max ID: ${maxId}`);
});