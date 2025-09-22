const express = require('express');
// jwt 모듈 추가
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // bcrypt 모듈 추가

const router = express.Router();

// PostgreSQL 연결을 위한 Pool 객체 정의 (예시)
const { Pool } = require('pg');

const localcheck = require('../../middleware/localcheck');
const authMiddleware = require('../../middleware/authMiddleware');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// login : host:port번호/api/users/login 
router.post('/login',localcheck, async(req, res) => {
  const {user_name, password, ip_address} = req.body;

  try{

      // login 시도했던 로그 생성 .

      const users = await pool.query('SELECT user_name, password FROM tbl_user_info WHERE user_name = $1', [user_name]);
      if(!users.rows.length) 
         throw new Error('Invalid userName or password');

       // bcrypt.compare를 사용하여 비밀번호를 비교합니다.
       const hashedPassword = users.rows[0].password;
       const passwordMatch = await bcrypt.compare(password, hashedPassword);


      if (passwordMatch) {
        const token = jwt.sign({ user_name }, process.env.JWT_SECRET, { expiresIn: '8hr' });
        res.json({ ResultCode: '0', ErrorMessage: '', token: token });
      } else {
        throw new Error('Invalid userName or password');
      }

      res.end();
  }catch(err){
      console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/users/login'] reqBody Error:`, user_name );
      console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/users/login '] Error:`, err.message); 

      res.status(401).json({ ResultCode: '1', ErrorMessage: err.message });
      res.end();
  }
});

// 사용자 정보 조회
router.post('/getuserinfo',localcheck, authMiddleware, async(req, res) => {

  const {user_name, ip_address} = req.body;

  try{
    const users = await pool.query(`SELECT *
      FROM tbl_user_info WHERE user_name = $1`, [user_name]);


    let user = users.rows[0];

    // password 속성 제거
    if (user) {
      const { password, ...userWithoutPassword } = user;
      user = userWithoutPassword;
    }

    res.json({ ResultCode: '0', ErrorMessage: '', user: user });
    res.end();

  }catch(err){
      console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/users/getuserinfo'] reqBody Error:`, user_name );
      console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/users/getuserinfo '] Error:`, err.message); 

      res.status(401).json({ ResultCode: '1', ErrorMessage: err.message });
      res.end();
  }

});



// 사용자 전체 목록 조회
router.get('/', (req, res) => {
  res.send('사용자 전체 목록 API');
});

// 특정 사용자 조회
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  res.send(`${userId} 사용자 조회 API`);
});

// 모듈로 내보내기
module.exports = router;