var express = require('express');
var router = express.Router();
var app = express();
app.use(express.json()); //json모듈을 사용하기 위함

var mysql = require('mysql');
const { Console, log } = require('console');
// Connection 객체 생성 
var connection = mysql.createConnection({
  host: '192.168.0.82',
  port: 3306,
  user: 'test_crud',
  password: 'testcrud!1',
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
//페이징
let ipp = 15;
let totalCount = 0;
let block = 10;
let total_page = 0;
let page = 1;
let start = 0;
let start_page = 1;
let end_page = block;
let start_row = "";

//카운트
router.post('/selectBoardCount/:flag', function (req, res) {
  const board = {
    'flag': req.body.board.flag,
    'searchValue': req.body.board.searchValue,
    'searchKey': req.body.board.searchKey,
    'page': req.body.board.page,
    'totalCount': req.body.board.totalCount,
  };

  if (board.searchKey == 'title' && board.searchValue != undefined) {
    connection.query('SELECT count(1) as cnt FROM tb_board where flag = "' + req.params.flag + '" and title LIKE CONCAT("%", "' + board.searchValue + '","%") ORDER BY fid DESC,stp ASC', function (err, rows) {
      if (err) throw err;
      res.send(rows);
    });
  } else if (board.searchKey == 'content' && board.searchValue != undefined) {
    connection.query('SELECT count(1) as cnt FROM tb_board where flag = "' + req.params.flag + '" and content LIKE CONCAT("%", "' + board.searchValue + '","%")  ORDER BY fid DESC,stp ASC', function (err, rows) {
      if (err) throw err;
      res.send(rows);
    });
  } else {
    connection.query('SELECT count(1) as cnt FROM tb_board where flag = "' + req.params.flag + '" ORDER BY fid DESC,stp ASC', function (err, rows) {
      if (err) throw err;
      res.send(rows);
    });
  }
});

//리스트
router.post('/boardList/:flag', function (req, res) {
  const board = {
    'flag': req.body.board.flag,
    'searchValue': req.body.board.searchValue,
    'searchKey': req.body.board.searchKey,
    'page': req.body.board.page,
    'totalCount': req.body.board.totalCount,
  };
  //토탈카운트로 페이징 계산하기
  totalCount = board.totalCount;  //16
  total_page = Math.ceil(totalCount / ipp);    //페이지 개수
  if (board.page) page = board.page;  //사용자가 선택한 페이지번호
  start = (page - 1) * 10;
  start_page = Math.ceil(page / block);
  end_page = start_page * block;
  if (total_page < end_page) end_page = total_page;
  start_row = (page - 1) * ipp
  //페이징 객체 만들어서 쿼리 실행후 화면으로 데이터 보내기
  let paging = {
    "totalCount": totalCount
    , "total_page": total_page
    , "page": page
    , "start_page": start_page
    , "end_page": end_page
    , "ipp": ipp
    , "start_row": start_row
  }
  if (board.searchKey == 'title' && board.searchValue != undefined) {
    connection.query('SELECT * FROM tb_board where flag = "' + req.params.flag + '" and title LIKE CONCAT("%", "' + board.searchValue + '","%") ORDER BY fid DESC,stp ASC limit ' + paging.start_row + ', ' + paging.ipp + ' ', function (err, rows) {
      if (err) throw err;
      res.send({ rows, paging });
    });
  } else if (board.searchKey == 'content' && board.searchValue != undefined) {
    connection.query('SELECT * FROM tb_board where flag = "' + req.params.flag + '" and content LIKE CONCAT("%", "' + board.searchValue + '","%")  ORDER BY fid DESC,stp ASC limit ' + paging.start_row + ', ' + paging.ipp + ' ', function (err, rows) {
      if (err) throw err;
      res.send({ rows, paging });
    });
  } else {
    connection.query('SELECT * FROM tb_board where flag = "' + req.params.flag + '" ORDER BY fid DESC,stp ASC limit ' + paging.start_row + ', ' + paging.ipp + ' ', function (err, rows) {
      if (err) throw err;
      res.send({ rows, paging });
    });
  }
});

//등록할 때 필요한 get fid(그룹아이디)의 최신번호 가져오기
router.post('/selectBoardFid/:flag', function (req, res) {
  //ifnull한 이유는 게시판에 데이터가 하나도 없을 땐 등록할 때 fid데이터가 없어서 대체값으로 1로 넣어준다.
  connection.query('SELECT IFNULL(MAX(fid)+1,1) AS fid FROM tb_board where flag = "' + req.params.flag + '" ', function (err, rows) {
    if (err) throw err;
    res.send(rows);
  });
});

//등록
router.post('/write', function (req, res) {
  var moment = require('moment');
  var todayDate = `${moment().format("YYYY-MM-DD HH:mm:ss")}`
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
  var no = parseInt(req.params.no, 10)
  connection.query('SELECT * FROM tb_board where no =  "' + no + '"', function (err, rows) {
    if (err) throw err;
    res.send(rows);
  });
});
//수정
router.post('/boardUpdate/:no', function (req, res) {
  var no = parseInt(req.params.no, 10)
  const board = {
    'title': req.body.board.title,
    'content': req.body.board.content,
  };
  connection.query('UPDATE tb_board SET title =  "' + board.title + '", content =  "' + board.content + '" where no =  "' + no + '"', function (err, rows) {
    if (err) throw err;
    res.send(rows);
  });
});
//삭제
router.post('/boardDelete/:no', function (req, res) {
  var no = parseInt(req.params.no, 10)
  connection.query('DELETE FROM tb_board where no =  "' + no + '"', function (err, rows) {
    if (err) throw err;
    res.send(rows);
  });
});
//해당글의 댓글을 작성할때 fid는 그대로 , lev+1, stp+1을 해주기 위해 쿼리실행후 화면으로 보내준다.
router.post('/selectBoardReply/:no', function (req, res) {
  var no = parseInt(req.params.no, 10)
  connection.query('SELECT fid ,lev + ' + 1 + ' as lev , stp + ' + 1 + ' as stp FROM tb_board where no =  "' + no + '"', function (err, rows) {
    if (err) throw err;
    res.send(rows);
  });
});
//테스트글에서 답글1작성, 답글1-1작성, 답글2작성 순서대로 했을 때 답글2가 가장 맨위로 올라가게 하기 위함
router.post('/updateBoardReplyStp', function (req, res) {
  const board = {
    'flag': req.body.board.flag,
    'fid': req.body.board.fid,
    'lev': req.body.board.lev,
    'stp': req.body.board.stp,
  }
  connection.query('UPDATE tb_board SET stp = stp + ' + 1 + '  where flag =  "' + board.flag + '" and fid =  "' + board.fid + '" and  stp >=  "' + board.stp + '"', function (err, rows) {
    if (err) throw err;
    res.send(rows);
  });
});
//조회수 증가
router.post('/updateBoardRead/:no', function (req, res) {
  var no = parseInt(req.params.no, 10)
  connection.query('UPDATE tb_board SET read_cnt =  read_cnt + ' + 1 + '  where no =  "' + no + '"', function (err, rows) {
    if (err) throw err;
    res.send(rows);
  });
});

module.exports = router; // 이 객체 자체를 모듈로 리턴해 준다.
