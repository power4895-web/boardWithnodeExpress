var createError = require('http-errors'); 
var express = require('express'); //node_modules에서 express라는 모듈을 활용한다는 뜻

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// get movie router
var moviesRouter = require('./routes/movies');
var usersRouter = require('./routes/users');
var boardRouter = require('./routes/board');

var app = express();  // app이라는 변수로 REST End Point들을 생성



var mysql = require('mysql');
const { Console } = require('console');
// Connection 객체 생성 
var connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',   
  password: '1234',
  database: 'test_crud'  
});  
// Connect
connection.connect(function (err) {   
  if (err) {     
    console.error('mysql connection error');     
    console.error(err);     
    throw err;   
  } 
});


// app.use(require('vue-moment'))



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// use middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// insert
app.post('/regist', function (req, res) {
    var user = {
        'userid': req.body.userid,
        'name': req.body.name,
        'address': req.body.address
    };
    var query = connection.query('insert into users set ?', user, function (err, result) {
      if (err) {
        console.error(err);
        throw err;
      }
      res.status(200).send('success');
    });
  });






// route
app.use('/api/movies', moviesRouter);
app.use('/api/users', usersRouter);
app.use('/api/board', boardRouter);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});



module.exports = app;
