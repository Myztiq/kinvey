"use strict";

var express = require('express')
  , app = express.createServer()
  , less = require('less')
  , port = 80
;


// Configuration
app.configure(function(){
  function processObjForNums(obj){
    for(var key in obj) {
      if(typeof obj[key] == "object") {
        obj[key] = processObjForNums(obj[key]);
      }else if(/^\d+$/.test(obj[key])) {
        obj[key] = parseInt(obj[key],10);
      }
    }
    return obj;
  }
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());

  // LESS compiler
  app.use(less.middleware(
    {   'src':  __dirname + '/../client'
      , 'dest':  __dirname + '/../client'
      , 'compress': true
      , 'debug': true
      , 'force': true
    }
  ));
  app.use(express.static(__dirname + '/../client/'));
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));

  app.use(app.router);

});
app.set('view engine', 'jade');
app.set('view options', { layout: false });
app.set('views', __dirname + '/../client/views');

//Intiialize the app
require('./lib/')(app);

app.listen(port,'0.0.0.0');
console.log('Server started on port '+port+'.');
