var express = require('express');
var app = express();
var connection = null

module.exports = function (conn) {
   connection = conn;
   return app;
};

app.get('/match/:mid', function (req, res, next) {
   var sql = 'SELECT p1.pid AS pid1, p1.name AS playerName1, p2.pid AS pid2, p2.name AS playerName2, ' +
         'c1.cid AS cid1, c1.name AS charName1, c2.cid AS cid2, c2.name AS charName2, ' + 
         'm.seed AS seed, m.mid AS mid, o.winner AS winner, o.score AS score, o.time AS time, m.tid ' +
         'FROM `match` m ' +
         'INNER JOIN `player` p1 ON p1.pid = m.pid1 ' +
         'INNER JOIN `player` p2 ON p2.pid = m.pid2 ' +
         'INNER JOIN `character` c1 ON c1.cid = m.cid1 ' +
         'INNER JOIN `character` c2 ON c2.cid = m.cid2 ' +
         'LEFT JOIN `outcome` o ON o.mid = m.mid ' +
         'WHERE m.mid = ?';
   connection.query(sql, req.params.mid, function (err, rows) {
      if (err) return next(err);
      if (!(rows && rows.length)) return res.redirect('/');
      var result = rows[0];
      result.mid = req.params.mid;
      if (result.winner) {
         if (result.winner == result.pid1) {
            result.winnerName = result.playerName1;
         } else {
            result.winnerName = result.playerName2;
         }
         res.render('match', result);
      } else {
         res.render('matchSet', result);
      }
   });
});

app.post('/match/:mid', function (req, res, next) {
   var matchSql = 'SELECT tid, pid1, pid2 FROM `match` WHERE mid = ?';
   connection.query(matchSql, req.params.mid, function (err, rows) {
      if (err || !(rows && rows.length)) return res.redirect('/');
      var match = rows[0];
      var winner = req.body.winner;
      var loser = winner == match.pid1 ? match.pid2 : match.pid1
      connection.query('INSERT INTO `outcome` SET ?', {
         winner: winner,
         loser: loser,
         mid: req.params.mid,
         score: req.body.score,
         time: req.body.time
      }, function (err) {
         if (err) return next(err);
         res.redirect('/tournament/' + match.tid);
      });
   });
});
