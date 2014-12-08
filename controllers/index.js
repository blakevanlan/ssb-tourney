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
         var sql = 'SELECT  p.pid, p.name, (SELECT Count(*) FROM   `player` pp, `outcomes` o WHERE  pp.pid = p.pid AND    pp.pid = o.winner) AS wins, (SELECT count(*) FROM   `player` pp, `outcomes` o WHERE  pp.pid = p.pid AND    pp.pid = o.loser) AS losses, (SELECT   c.name FROM     `character` c, `participant` pt, `match` mm, `tournament` tt WHERE    p.pid = pt.pid AND pt.tid = tt.tid AND      mm.tid = tt.tid AND      ( ( p.pid = mm.pid1 AND      c.cid = mm.cid1 ) OR       ( p.pid = mm.pid2 AND      c.cid = mm.cid2 ) )GROUP BY c.name ORDER BY count(c.cid) DESC limit 1) AS charName FROM     `player` p ORDER BY p.name';
         connection.query(sql, function (err, rows) {
            done(err, rows);
         });
      }
   }, function (err, results) {
      if (err) return next(err);
      res.render('index', results);
   });
});