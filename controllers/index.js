var express = require('express');
var app = express();
var connection = null
var async = require('async');

module.exports = function (conn) {
   connection = conn;
   return app;
};

app.get('/', function (req, res, next) {

   async.parallel({
      tournaments: function (done) {
         connection.query('SELECT * FROM `tournament` ORDER BY date',
               function (err, rows) {
            done(err, rows);
         });
      },
      players: function (done) {
         connection.query('SELECT * FROM `player` ORDER BY name',
               function (err, rows) {
            done(err, rows);
         });
      }
   }, function (err, results) {
      if (err) return next(err);
      res.render('index', results);
   });
});