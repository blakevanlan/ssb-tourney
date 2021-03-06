var express = require('express');
var app = express();
var connection = null
var mysql = require('mysql');
var async = require('async');

module.exports = function (conn) {
   connection = conn;
   return app;
};

app.get('/tournament/new', function (req, res, next) {
   async.parallel({
      players: function (done) {
         connection.query('SELECT * FROM `player` WHERE pid > 1 ORDER BY name', 
               function (err, rows) {
            done(err, rows);
         });
      },
      characters: function (done) {
         connection.query('SELECT * FROM `character`', function (err, rows) {
            done(err, rows);
         });
      }
   }, function (err, results) {
      if (err) return next(err);
      res.render('tournamentNew', results);
   });
});

app.post('/tournament/new', function (req, res, next) {
   var data = { name: req.body.name, date: new Date() };
   var sql = mysql.format('INSERT INTO tournament SET ?', data);
   connection.query(sql, function (err, result) {
      if (err) {
         console.log('Failed to create tournament: ', err);
         return
      }
      var tid = result.insertId;

      // Insert into participants.
      var participantSql = 'INSERT INTO `participant` SET ?';
      var participants = [];
      for (var i = 1; i <= 16; i++) {
         var pid = req.body['player' + i];
         participants[i] = {pid: pid, cid: req.body['character' + i]};
         if (pid > 1) 
            connection.query(participantSql, {tid: tid, pid: pid});
      };

      // Insert into matches.
      var matchSql = 'INSERT INTO `match` SET ?';
      var seed = 8;
      for (var i = 1; i < participants.length; i += 2) {
         var p1 = participants[i];
         var p2 = participants[i + 1];
         connection.query(matchSql, {
            pid1: p1.pid,
            pid2: p2.pid,
            cid1: p1.cid,
            cid2: p2.cid,
            seed: seed++,
            tid: tid
         });
      };
      res.redirect('/');
   });
});

app.get('/tournament/:tid', function (req, res, next) {
   var tid = req.params.tid
   var sql = 'SELECT p1.pid AS pid1, p1.name AS playerName1, p2.pid AS pid2, p2.name AS playerName2, ' +
         'c1.cid AS cid1, c1.name AS charName1, c2.cid AS cid2, c2.name AS charName2, ' + 
         'm.seed AS seed, m.mid AS mid, o.winner AS winner, o.score AS score, o.time AS time ' +
         'FROM `match` m ' +
         'INNER JOIN `player` p1 ON p1.pid = m.pid1 ' +
         'INNER JOIN `player` p2 ON p2.pid = m.pid2 ' +
         'INNER JOIN `character` c1 ON c1.cid = m.cid1 ' +
         'INNER JOIN `character` c2 ON c2.cid = m.cid2 ' +
         'LEFT JOIN `outcomes` o ON o.mid = m.mid ' +
         'WHERE m.tid = ?';
   async.parallel({
      matches: function (done) {
         connection.query(sql, tid, function (err, rows) {
            done(err, rows);
         });
      },
      name: function (done) {
         connection.query('SELECT name FROM `tournament` WHERE tid = ?', tid,
               function (err, rows) {
            done(err, rows);
         });
      }
   }, function (err, results) {
      if (err) return next(err);
      if (!(results.name && results.name.length)) return res.redirect('/');

      // Separate by levels.
      var level1 = [];
      var level2 = [];
      var level3 = [];
      var level4 = [];
      for (var i = 0; i < results.matches.length; i++) {
         var row = results.matches[i];
         if (row.seed == 1) {
            extractPlayers(row, level4, 1);
         } else if (row.seed < 4) {
            extractPlayers(row, level3, 2);
         } else if (row.seed < 8) {
            extractPlayers(row, level2, 4);
         } else {
            extractPlayers(row, level1, 8);
         }
      };
      fillEmptyPlayer(level1, [], 16);
      fillEmptyPlayer(level2, level1, 8);
      fillEmptyPlayer(level3, level2, 4);
      fillEmptyPlayer(level4, level3, 2);

      // Set the winner.
      var winner = null;
      if (level4[0] && level4[0].hasPlayed) {
         winner = {
            pid: level4[0].pid,
            name: level4[0].name,
            cid: level4[0].cid,
            character: level4[0].character,
            hasPlayed: true,
            isWinner: true,
            score: level4[0].score,
            time: level4[0].time
         };
      }

      res.render('tournament', {
         level1: level1,
         level2: level2,
         level3: level3,
         level4: level4,
         winner: winner,
         name: results.name[0].name
      });
   });
});

function extractPlayers(row, list, offset) {
   var index = (row.seed - offset) * 2;
   list[index] = extractPlayer(row, 1);
   list[index + 1] = extractPlayer(row, 2);
}

function extractPlayer(row, num) {
   return {
      pid: row["pid" + num],
      name: row["playerName" + num],
      cid: row["cid" + num],
      character: row["charName" + num],
      mid: row.mid,
      hasPlayed: !!row.winner,
      isWinner: row.winner == row["pid" + num],
      score: row.score,
      time: row.time
   }
}

function fillEmptyPlayer(list, prev, length) {
   for (var i = 0; i < length; i++) {
      if (!list[i]) {
         var first = prev[i * 2];
         var second = prev[(i * 2) + 1];
         if (first && first.isWinner) {
            list[i] = {
               pid: first.pid,
               name: first.name,
               cid: first.cid,
               character: first.character,
               mid: first.mid,
               hasPlayed: false,
               isWinner: false,
               score: null,
               time: null
            };
         } else if (second && second.isWinner) {
            list[i] = {
               pid: second.pid,
               name: second.name,
               cid: second.cid,
               character: second.character,
               mid: second.mid,
               hasPlayed: false,
               isWinner: false,
               score: null,
               time: null
            };
         } else {
            list[i] = {
               pid: 0,
               name: "None"
            };   
         }
      }
   };
}
