// app.js
const express = require('express');
const bodyParser = require('body-parser');

require('dotenv').config();
const connection = require('./connection');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello World!'});
});

app.get('/bookmarks/:id', (req, res) => {
    const idBookmarks = req.params.id;
    connection.query('SELECT * from bookmark WHERE id = ?', [idBookmarks], (err, results) => {
      if (err) {
        res.status(500).send(`Error when retrieving a bookmark`);
      } 
      if (results.length === 0) {
        return res.status(404).json({ error: 'Bookmark not found'});
      } else {
        res.json(results[0]);
      }
    });
});

app.post('/bookmarks', (req, res) => {
    const { url, title } = req.body;
    if (!url || !title) {
      return res.status(422).json({ error: 'required field(s) missing' });
    }
    connection.query('INSERT INTO bookmark SET ?', req.body, (err, results) => {
        if (err) return res.status(500).json({ error: err.message, sql: err.sql });
        connection.query('SELECT * FROM bookmark WHERE id = ?', results.insertId, (err, results) => {
            if (err) return res.status(500).json({ error: err.message, sql: err.sql });
            return res.status(201).json(results[0]);
        });
    });
});

module.exports = app;
