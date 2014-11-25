var express = require('express');
var path = require('path');
var app = module.exports = express();
var mysql = require('mysql');

// Settings
app.set('view engine', 'jade');
app.set('view options', { layout: false });
app.set('views', path.join(__dirname, '../views'));

// Middleware
app.use(express.query());
// app.use(express.bodyParser());
app.use(require('connect-assets')());
app.use(express.static(path.join(__dirname, '../public')));

// Create sql connection.
var connection = mysql.createConnection({
   host: 'mysql.cis.ksu.edu',
   user: 'vanlan',
   password: 'insecurepassword',
   database: 'vanlan'
});

// console.log('Attempting to connect to mysql...');
// connection.connect(function (err) {
//    if (err) {
//       console.error('Failed to connect: ' + err.stack);
//       // return;
//    }
//    console.log('Successfully connected.')

//    // Controllers
//    app.use(require('./index')(connection));
//    app.use(require('./bracket')(connection));
//    app.use(require('./player')(connection));
//    app.use(require('./character')(connection));
// });

app.use(require('./index')(null));
app.use(require('./bracket')(null));
app.use(require('./player')(null));
app.use(require('./character')(null));
