var express = require('express');
var app = express();
var connection = null

module.exports = function (conn) {
   connection = conn;
   return app;
};

app.get('/character/:cid', function (req, res, next) {
   res.render('character');
});