var express = require('express');
var app = express();
var mysql = require('mysql');
var connection = null
var async = require('async');

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
   var sql = 'SELECT  p.pid, p.name, (SELECT Count(*) FROM   `player` pp, `outcomes` o WHERE  pp.pid = p.pid AND    pp.pid = o.winner) AS wins, (SELECT count(*) FROM   `player` pp, `outcomes` o WHERE  pp.pid = p.pid AND    pp.pid = o.loser) AS losses, (SELECT   c.name FROM     `character` c, `participant` pt, `match` mm, `tournament` tt WHERE    p.pid = pt.pid AND pt.tid = tt.tid AND      mm.tid = tt.tid AND      ( ( p.pid = mm.pid1 AND      c.cid = mm.cid1 ) OR       ( p.pid = mm.pid2 AND      c.cid = mm.cid2 ) )GROUP BY c.name ORDER BY count(c.cid) DESC limit 1) AS charName FROM `player` p WHERE p.pid = ? ORDER BY p.name';
   async.parallel({
      player: function (done) {
         connection.query(sql, req.params.pid, function (err, rows) {
            return done(err, rows[0]);
         });
      },
      tournaments: function (done) {
         var tourneySql = 'SELECT t.tid, t.name FROM `tournament` t, `participant` p WHERE p.tid = t.tid AND p.pid = ?';
         connection.query(tourneySql, req.params.pid, function (err, rows) {
            return done(err, rows);
         });
      }
   }, function (err, results) {
      if (err) return next(err);
      if (!results.player) return res.redirect('/');
      results.player.tournaments = results.tournaments;
      console.log(results.player);
      res.render('player', results.player);
   });
});