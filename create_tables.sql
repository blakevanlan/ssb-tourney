DROP TABLE IF EXISTS `match`;
DROP TABLE IF EXISTS `outcome`;
DROP TABLE IF EXISTS `participant`;
DROP TABLE IF EXISTS `player`;
DROP TABLE IF EXISTS `tournament`;
DROP TABLE IF EXISTS `character`;

CREATE TABLE  IF NOT EXISTS `player` (
`pid` INT NOT NULL AUTO_INCREMENT ,
`name` VARCHAR( 100 ) NOT NULL ,
PRIMARY KEY ( `pid` )
) ENGINE = InnoDB;

CREATE TABLE  IF NOT EXISTS `tournament` (
`tid` INT NOT NULL AUTO_INCREMENT ,
`name` VARCHAR( 100 ) NOT NULL ,
`date` DATE NOT NULL ,
PRIMARY KEY ( `tid` )
) ENGINE = InnoDB;

CREATE TABLE  IF NOT EXISTS `participant` (
`tid` INT NOT NULL ,
`pid` INT NOT NULL ,
PRIMARY KEY ( `tid`, `pid` ) ,
FOREIGN KEY(`tid`) REFERENCES tournament(`tid`) ON DELETE CASCADE ,
FOREIGN KEY(`pid`) REFERENCES player(`pid`) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE  IF NOT EXISTS `character` (
`cid` INT NOT NULL AUTO_INCREMENT ,
`name` VARCHAR( 100 ) NOT NULL ,
PRIMARY KEY ( `cid` )
) ENGINE = InnoDB;

CREATE TABLE  IF NOT EXISTS `match` (
`mid` INT NOT NULL AUTO_INCREMENT ,
`pid1` INT NOT NULL ,
`pid2` INT NOT NULL ,
`cid1` INT NOT NULL ,
`cid2` INT NOT NULL ,
`seed` INT NOT NULL ,
`tid` INT NOT NULL ,
PRIMARY KEY ( `mid` ) ,
FOREIGN KEY(`tid`) REFERENCES tournament(`tid`) ON DELETE CASCADE ,
FOREIGN KEY(`pid1`) REFERENCES player(`pid`) ON DELETE CASCADE ,
FOREIGN KEY(`pid2`) REFERENCES player(`pid`) ON DELETE CASCADE ,
FOREIGN KEY(`cid1`) REFERENCES character(`cid`) ON DELETE CASCADE ,
FOREIGN KEY(`cid2`) REFERENCES character(`cid`) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE  IF NOT EXISTS `outcome` (
`oid` INT NOT NULL AUTO_INCREMENT ,
`mid` INT NOT NULL ,
`winner` INT NOT NULL ,
`loser` INT NOT NULL ,
`score` INT NOT NULL ,
`time` INT NOT NULL ,
PRIMARY KEY ( `oid` ) ,
FOREIGN KEY(`mid`) REFERENCES match(`mid`) ON DELETE CASCADE ,
FOREIGN KEY(`winner`) REFERENCES player(`pid`) ON DELETE CASCADE ,
FOREIGN KEY(`loser`) REFERENCES player(`pid`) ON DELETE CASCADE
) ENGINE = InnoDB;

INSERT INTO "player" VALUES (1, "None");

INSERT INTO `character` VALUES (1, "Captain Falcon");
INSERT INTO `character` VALUES (2, "DK");
INSERT INTO `character` VALUES (3, "Fox");
INSERT INTO `character` VALUES (4, "Jigglypuff");
INSERT INTO `character` VALUES (5, "Kirby");
INSERT INTO `character` VALUES (6, "Link");
INSERT INTO `character` VALUES (7, "Mario");
INSERT INTO `character` VALUES (8, "Luigi");
INSERT INTO `character` VALUES (9, "Ness");
INSERT INTO `character` VALUES (10, "Pikachu");
INSERT INTO `character` VALUES (11, "Samus");
INSERT INTO `character` VALUES (12, "Yoshi");
