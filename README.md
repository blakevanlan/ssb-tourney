ssb-tourney
===========


## Requirements
* Insert, delete, update
* 10 Queries (7 questions, 3 reports)
  * Reports
    * List users with wins and losses, favorite character
    * Wins and losses by characters
    * Match history (opponent, win/loss, character, match length, tourney name) sorted by date
  * Questions
    * Player named "..."
    * Tourney

### Queries

-- Gets the name, wins, and losses for each player.

SELECT p.name, 
       (SELECT Count(*)
        FROM player pp, outcome o
        WHERE pp.pid = p.pid
          AND pp.pid = o.winner) as Wins,
       (SELECT Count(*)
        FROM player pp, outcome o
        WHERE pp.pid = p.pid
          AND pp.pid = o.loser) as Losses
FROM player p
ORDER BY p.name;

-- Gets the wins and losses for each character.

SELECT c.name, 
       (SELECT Count(*)
        FROM `character` cc, outcome o, `match` m, player p
        WHERE cc.cid = c.cid
          AND m.mid = o.mid
          AND p.pid = o.winner
          AND ((p.pid = m.pid1 AND cc.cid = m.cid1) OR (p.pid = m.pid2 AND cc.cid = m.cid2))
          AND cc.cid = c.cid) as Wins
FROM `character` c
ORDER BY c.name;

-- Gets the number of wins and losses for a player with a specific character.
-- 1st parameter is a player name.
-- 2nd parameter is a character name.

SELECT (SELECT Count(*)
        FROM `character` cc, outcome o, `match` m, player pp
        WHERE pp.pid = p.pid
          AND cc.cid = c.cid
          AND m.mid = o.mid
          AND pp.pid = o.winner
          AND ((p.pid = m.pid1 AND cc.cid = m.cid1) OR (p.pid = m.pid2 AND cc.cid = m.cid2))) as Wins,
       (SELECT Count(*)
        FROM `character` cc, outcome o, `match` m, player pp
        WHERE pp.pid = p.pid
          AND cc.cid = c.cid
          AND m.mid = o.mid
          AND pp.pid = o.loser
          AND ((p.pid = m.pid1 AND cc.cid = m.cid1) OR (p.pid = m.pid2 AND cc.cid = m.cid2))) as Losses
FROM player p, `character` c
WHERE p.name like "Tamara"
  AND c.name like "Ness";
  
-- Gets the most-used character for a player.
-- 1st and only parameter is a player name.

SELECT c.name
FROM `character` c, `match` m, player p
WHERE ((p.pid = m.pid1 AND c.cid = m.cid1) OR (p.pid = m.pid2 AND c.cid = m.cid2))
  AND p.name like "Xander"
GROUP BY c.name
ORDER BY Count(c.cid) DESC
LIMIT 1;

-- Gets the most-used character for players in a specific tournament.
-- 1st and only parameter is a tournament name

SELECT p.name, (SELECT c.name 
                FROM `character` c, player pp, `match` mm, tournament tt
                WHERE pp.pid = p.pid
                  AND tt.tid = t.tid
                  AND mm.tid = tt.tid
                  AND ((pp.pid = mm.pid1 AND c.cid = mm.cid1) OR (pp.pid = mm.pid2 AND c.cid = mm.cid2))
                GROUP BY c.name
                ORDER BY Count(c.cid) DESC
                LIMIT 1)
FROM player p, `match` m, tournament t
WHERE (p.pid = m.pid1 OR p.pid = m.pid2)
  AND m.tid = t.tid
  AND t.name like "impropriety"
GROUP BY p.name;
  
-- Gets a report of matches in a given tournament (tournament name, player 1 name, character 1 name, player 2 name, character 2 name, seed number)

SELECT t.name, p1.name, c1.name, p2.name, c2.name, m.seed
FROM tournament t, `match` m, player p1, player p2, `character` c1, `character` c2
WHERE t.tid = m.tid
  AND p1.pid = m.pid1
  AND p2.pid = m.pid2
  AND c1.cid = m.cid1
  AND c2.cid = m.cid2
ORDER BY t.tid, m.seed;

-- Gets the name of the winner of a given tournament

SELECT t.name, p.name
FROM tournament t, `match` m, player p, outcome o
WHERE t.tid = m.tid
  AND m.mid = o.mid
  AND p.pid = o.winner
  AND m.seed = 1
ORDER BY t.tid;
