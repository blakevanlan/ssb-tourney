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
      if (err)
         console.log('Failed to add player: ', err);
      res.redirect('/');
   });
});

app.get('/player/:pid', function (req, res, next) {
   res.render('player');
});