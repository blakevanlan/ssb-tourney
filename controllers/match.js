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
         'LEFT JOIN `outcomes` o ON o.mid = m.mid ' +
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
   var matchSql = 'SELECT * FROM `match` WHERE mid = ?';
   connection.query(matchSql, req.params.mid, function (err, rows) {
      if (err || !(rows && rows.length)) return res.redirect('/');
      var match = rows[0];
      var winner = req.body.winner;
      var loser = winner == match.pid1 ? match.pid2 : match.pid1
      tryCreateNextMatch(match, winner);
      // return res.redirect('/tournament/' + match.tid);
      connection.query('INSERT INTO `outcomes` SET ?', {
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

function tryCreateNextMatch (match, winnerPid) {
   if (match.seed == 1) return;
   var even = match.seed % 2 == 0;
   var otherSeed = even ? match.seed + 1 : match.seed - 1;
   var sql = 'SELECT * FROM `match` m ' +
         'LEFT JOIN `outcomes` o ON o.mid = m.mid ' +
         'WHERE m.tid = ? AND m.seed = ?';
   console.log('seed:', match.seed);
   console.log('other seed: ', otherSeed);
   connection.query(sql, [match.tid, otherSeed], function (err, row) {
      if (err) return console.log("Failed to get matches:", err);
      if (!(row[0] && row[0].winner)) return;
      var other = row[0];
      console.log('Creating the next match')
      var winnerCid = match.pid1 == winnerPid ? match.cid1 : match.cid2;
      var otherCid = other.pid1 == other.winner ? other.cid1 : other.cid2;
      connection.query('INSERT INTO `match` SET ?', {
         pid1: even ? winnerPid : other.winner,
         pid2: even ? other.winner : winnerPid,
         cid1: even ? winnerCid : otherCid,
         cid2: even ? otherCid : winnerCid,
         seed: even ? (match.seed / 2) : (otherSeed / 2),
         tid: match.tid
      }, function (err) {
         if (err) return console.log("Failed to create next match:", err);
      });
   })
}
