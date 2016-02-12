//express y socket.io
    var express = require('express');
    var app = express();
    var server = require('http').createServer(app);  
    var io = require('socket.io')(server);
    server.listen(/*puerto*/);
//base de datos
    var mongoose = require('mongoose');
    var db = mongoose.connect(/*'mongodb://username:password@host:port/database'*/);
//vistas
    app.set('views', './views');
    app.engine('html', require('ejs').renderFile);
//otros
    var bodyParser = require('body-parser');
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    var cookieParser = require('cookie-parser');
    app.use(cookieParser('MAGICString'));
    var session = require('express-session');
    app.use(session({
        secret: '<mysecret>', 
        saveUninitialized: true,
        resave: true}));
//requerir rutas
    require('./routes')(app);
//requerir rutas sockets
    require('./sockets')(io);