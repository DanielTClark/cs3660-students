'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const router = express.Router();
const dao = require('./studentFSDao.js')(__dirname);

module.exports = router;

router.use(jsonParser);

// REST END POINTS
// Create
router.post('/students', jsonParser, (req, res) => {
    let student = req.body;

    dao.create(student, function (err, id) {
        if (err) {
            if (err) console.log(`Unable to create student. id: ${id}`.red);
            return res.sendStatus(500);
        }

        res.status(201).json(id);
    });
});

// Read
router.get('/students/:studentId.json', (req, res) => {
    let id = req.params.studentId;

    dao.read(id, (err, data) => {
        if (err) {
            console.log(`Unable to read student. id: ${id}`.red);
            return res.sendStatus(404);
        }

        res.send(data);
    });
});

// Update
router.put('/students/:studentId.json', jsonParser, (req, res) => {
    let student = req.body;
    student.id = undefined;
    let id = req.params.studentId;

    dao.update(id, student, (err) => {
        if (err) console.log(`Unable to update student. id: ${id}`.red);
        req.sendStatus(204); // No Content
    });
});

// Delete
router.delete('/students/:studentId.json', (req, res) => {
    let id = req.params.studentId;

    dao.delete(id, (err) => {
        if (err) console.log(`Unable to delete student. id: ${id}`.red);
        res.sendStatus(204); // No Content
    });
});

// List
router.get('/students.json', (req, res) => {
    dao.list((err, ids) => {
        if (err) {
            console.log('Unable to list students.'.red);
            return res.sendStatus(404)
        }

        res.send(ids);
    });
});