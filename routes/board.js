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

//리스트
router.post('/boardList/:flag', function (req, res) {
  console.log('board.boardList=== flag' , req.params.flag)
  connection.query('SELECT * FROM tb_board where flag = "'+req.params.flag + '" ORDER BY fid DESC,stp ASC', function (err, rows) {
    if (err) throw err;
    res.send(rows);
  });
});

//등록할 때 필요한 get fid(그룹아이디)의 최신번호 가져오기
router.post('/selectBoardFid/:flag', function (req, res) {
  console.log('board.selectBoardFid ====flag' , req.params.flag)
  //ifnull한 이유는 게시판에 데이터가 하나도 없을 땐 등록할 때 fid데이터가 없어서 대체값으로 1로 넣어준다.
  connection.query('SELECT IFNULL(MAX(fid)+1,1) AS fid FROM tb_board where flag = "'+req.params.flag + '" ', function (err, rows) {
    if (err) throw err;
    res.send(rows);
  });
});

//등록
router.post('/write', function (req, res) {
  console.log('board.write')
  var moment = require('moment'); 
  var todayDate = `${ moment().format("YYYY-MM-DD HH:mm:ss") }`
  const board = {
    'fid': req.body.board.fid,
    'lev': req.body.board.lev,
    'stp': req.body.board.stp,
    'userId': "admin",
    'title': req.body.board.title,
    'content': req.body.board.content,
    'flag': req.body.board.flag,
  };
  connection.query('INSERT INTO tb_board (user_id,title,content,reg_date, read_cnt, fid, lev, stp, flag) VALUES ("' + board.userId + '","' + board.title + '" ,"' + board.content + '","' + todayDate + '" ,"' + 0 + '","' + board.fid + '","' + board.lev + '","' + board.stp + '","' + board.flag + '")', board, function (err, row2) {
    if (err) throw err;
    });
    res.json({
      success: true,
      message: 'wirte insert Success!'
    })
});


//상세
router.post('/boardView/:no', function (req, res) {
  console.log('board.view')
  var no = parseInt(req.params.no, 10)
  connection.query('SELECT * FROM tb_board where no =  "' + no + '"', function (err, rows) {
    if (err) throw err;
    console.log('rows', rows)
    res.send(rows);
  });
});

//수정
router.post('/boardUpdate/:no', function (req, res) {
  console.log('board.update')
  var no = parseInt(req.params.no, 10)
  const board = {
    'title': req.body.board.title,
    'content': req.body.board.content,
  };
  connection.query('UPDATE tb_board SET title =  "' + board.title + '", content =  "' + board.content + '" where no =  "' + no + '"', function (err, rows) {
    if (err) throw err;
    console.log('rows', rows)
    res.send(rows);
  });
});

//삭제
router.post('/boardDelete/:no', function (req, res) {
  console.log('board.boardDelete')
  var no = parseInt(req.params.no, 10)
  connection.query('DELETE FROM tb_board where no =  "' + no + '"', function (err, rows) {
    if (err) throw err;
    console.log('rows', rows)
    res.send(rows);
  });
});

//댓글처리할 때 get fid, lev+1, stp+1 하기 위함
router.post('/selectBoardReply/:no', function (req, res) {
  console.log('board.selectBoardReply')
  var no = parseInt(req.params.no, 10)
  console.log(no)
  connection.query('SELECT fid ,lev + '+1+' as lev , stp + '+1+' as stp FROM tb_board where no =  "' + no + '"', function (err, rows) {
    if (err) throw err;
    console.log('rows', rows)
    res.send(rows);
  });
});

//테스트글에서 답글1작성, 답글1-1작성, 답글2작성 순서대로 했을 때 답글2가 가장 맨위로 올라가게 하기 위함
router.post('/updateBoardReplyStp', function (req, res) {
  console.log('board.updateBoardReplyStp')
  const board = {
    'flag': req.body.board.flag,
    'fid': req.body.board.fid,
    'lev': req.body.board.lev,
    'stp': req.body.board.stp, 
  }
  connection.query('UPDATE tb_board SET stp = stp + '+1+'  where flag =  "' + board.flag + '" and fid =  "' + board.fid + '" and  stp >=  "' + board.stp + '"', function (err, rows) {
    if (err) throw err;
    console.log('rows', rows)
    res.send(rows);
  });
});

//조회수 증가
router.post('/updateBoardRead/:no', function (req, res) {
  console.log('board.updateBoardRead')
  var no = parseInt(req.params.no, 10)
  connection.query('UPDATE tb_board SET read_cnt =  read_cnt + '+1+'  where no =  "' + no + '"', function (err, rows) {
    if (err) throw err;
    console.log('rows', rows)
    res.send(rows);
  });
});


module.exports = router;
