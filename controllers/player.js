var express = require('express');
var app = express();
var mysql = require('mysql');
var connection = null

module.exports = function (conn) {
   connection = conn;
   return app;
};

app.get('/player/new', function (req, res, next) {
   res.render('playerNew');
});

app.post('/player/new', function (req, res, next) {
   var sql = mysql.format('INSERT INTO player SET?', req.body);
   connection.query(sql, function (err, result) {
      if (err) return next(err);
      res.redirect('/');
   });
});

app.get('/player/:pid', function (req, res, next) {
   connection.query('SELECT * FROM `player` WHERE pid = ?', req.params.pid,
         function (err, rows) {
      if (err) return next(err);
      if (!(rows && rows.length)) return res.redirect('/');
      res.render('player', rows[0]);
   });
});