var express = require('express');
var path = require('path');
var app = module.exports = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');

// Settings
app.set('view engine', 'jade');
app.set('view options', { layout: false });
app.set('views', path.join(__dirname, '../views'));

// Middleware
app.use(express.query());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('connect-assets')());
app.use(express.static(path.join(__dirname, '../public')));

// Create sql connection.
var connection = mysql.createConnection({
   host: 'mysql.cis.ksu.edu',
   user: 'vanlan',
   password: 'insecurepassword',
   database: 'vanlan'
});

console.log('Attempting to connect to mysql...');
connection.connect(function (err) {
   if (err) {
      console.error('Failed to connect: ' + err.stack);
      return;
   }
   console.log('Successfully connected.')

   // Controllers
   app.use(require('./index')(connection));
   app.use(require('./tournament')(connection));
   app.use(require('./player')(connection));
   app.use(require('./character')(connection));
   app.use(require('./match')(connection));
});
