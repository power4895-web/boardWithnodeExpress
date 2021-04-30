var express = require('express');
var router = express.Router();
var app = express();
app.use(express.json());


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



/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

router.get('/', function (req, res) {
  connection.query('SELECT * FROM users', function (err, rows) {
    if (err) throw err;
    res.send(rows);
  });
});



router.post('/signUp', function (req, res) {
  console.log('jdh')
  // let today = new Date();   

  // let year = today.getFullYear(); // 년도
  // let month = today.getMonth() + 1;  // 월
  // let date = today.getDate();  // 날짜
  // let day = today.getDay();  // 요일
  // let todayDate = year + '/' + month + '/' + date
  
  var moment = require('moment'); 
  var todayDate = `${ moment().format("YYYY-MM-DD HH:mm:ss") }`

  const user = {
    'userid': req.body.user.userid,
    'name': req.body.user.name,
    'password': req.body.user.password,
  };


  


  connection.query('SELECT userid FROM users WHERE userid = "' + user.userid + '"', function (err, row) {
    // user.create
    if (row[0] == undefined){ //  동일한 아이디가 없을경우,
      // const salt = bcrypt.genSaltSync();
      // const encryptedPassword = bcrypt.hashSync(user.password, salt);
      connection.query('INSERT INTO users (userid,name,password,create_date) VALUES ("' + user.userid + '","' + user.name + '","' + user.password + '","' + todayDate + '")', user, function (err, row2) {
        if (err) throw err;
      });
      res.json({
        success: true,
        message: 'Sing Up Success!'
      })
    }
    else {
      res.json({
        success: false,
        message: 'Sign Up Failed Please use anoter ID'
      })
    }
  });
  
});



router.post('/login', function (req, res) {
  const user = {
    'userid': req.body.user.userid,
    'password': req.body.user.password
  };
  console.log("userid" , user.userid)
  console.log("password" , user.password)
  // connection.query('SELECT userid, password FROM users WHERE userid = "' + user.userid + '"' , function (err, row) {
    connection.query('SELECT userid, password FROM users WHERE userid = "' + user.userid + '" and password= "' + user.password + '"' , function (err, row) {
    if (err) {
      res.json({ // 매칭되는 아이디 없을 경우
        success: false,
        message: 'Login failed please check your id or password!'
      })
    }
    if (row[0] !== undefined && row[0].userid === user.userid) {
        res.json({ // 로그인 성공 
          success: true,
          message: 'Login successful!'
        })
    }else{
        res.json({ // 매칭되는 아이디는 있으나, 비밀번호가 틀린 경우            success: false,
          message: 'Login failed please check your id or password!'
        })

    }
       
        
        
     

    // if (row[0] !== undefined && row[0].userid === user.userid) {
    //   bcrypt.compare(user.password, row[0].password, function (err, res2) {
    //     if (res2) {
    //       res.json({ // 로그인 성공 
    //         success: true,
    //         message: 'Login successful!'
    //       })
    //     }
    //     else {
    //       res.json({ // 매칭되는 아이디는 있으나, 비밀번호가 틀린 경우            success: false,
    //         message: 'Login failed please check your id or password!'
    //       })
    //     }
    //   })
    // }




  })
});







module.exports = router;
