var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//i declare here user and admin also
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var app = express();

//this cconst should be  declare  
const { engine: hbs } = require("express-handlebars");
var fileUpload = require('express-fileupload');
//2nd step  when we start start app.js and wen we call the connect function you have to call this function so you have to take function first (3rd app.js)
var db = require('./config/connection')
// 36th step we are going to define the express-session here(36.1 we will use this library)
var session = require('express-session')


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
// im going to set engine
app.engine('hbs', hbs({ extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layout/', partialsDir: __dirname + '/views/partials/' }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//on the top var fileUpload=require('express-fileupload') this funcction i will use here 
//so im going to use the module fileupload 
app.use(fileUpload());
//36.1 we will use the library here(37th in user.js)
//app.use(session({secret:"Key"[this Key is just a key whatever you can define],cookie:{maxAge:60000[cookie means how many time you have to keep the data.so here maxAge attrribute define how long you have to keep the data 60000 meeans 60 seconds]}}))
app.use(session({ secret: "Key", cookie: { maxAge: 600000 } }))

//3rd step this db should be use before route so we have to delare before(4 th in helpers/product-helpers)
//then install mongodb ('npm i mongodb)
db.connect((err) => {
  if (err) console.log("Connection Error" + err);

  else console.log("Database Conncted to port 27017")
})

app.use('/', userRouter);
app.use('/admin', adminRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  //render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

