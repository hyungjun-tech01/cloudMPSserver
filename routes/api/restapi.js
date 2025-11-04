const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // bcrypt 모듈 추가

const router = express.Router();

// PostgreSQL 연결을 위한 Pool 객체 정의 (예시)
const { Pool } = require('pg');

const localcheck = require('../../middleware/localcheck');
const pool  = require('../../utils/db');

// login : host:port번호/api/restapi/MFPIDPWDLogin 
router.post('/MFPIDPWDLogin',localcheck, async(req, res) => {
    const {user_name, password, ip_address} = req.body;
    try{
        const users = await pool.query(`SELECT user_name, full_name, privilege, password FROM tbl_user_info 
                                         WHERE user_name = $1 
                                         and user_status='COMPLETE_AUTH' 
                                         and deleted = 'N'`, [user_name]);
                                         
        if(!users.rows.length) 
        throw new Error('Invalid userName or password');

        // bcrypt.compare를 사용하여 비밀번호를 비교합니다.
        const hashedPassword = users.rows[0].password;
        const full_name = users.rows[0].full_name;
        const privilege = users.rows[0].privilege;

        
        const passwordMatch = await bcrypt.compare(password, hashedPassword);

        if (passwordMatch) {
        const token = jwt.sign({ user_name }, process.env.JWT_SECRET, { expiresIn: '24hr' });
        res.json({ result: 'OK', details: {description:'로그인 성공', ID:user_name, full_name:full_name, privilege:privilege}});
        } else {
        const error = new Error('등록되지 않은 ID이거나 잘못된 비밀번호입니다.');
        error.statusCode = 400; // HTTP 상태 코드 지정
        error.resultCode = '2'; // 사용자 정의 ResultCode 지정 (옵션)
        throw error;
        }

        res.end();

    }catch(err){
        console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/restapi/MFPIDPWDLogin'] reqBody Error:`, user_name );
        console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/restapi/MFPIDPWDLogin '] Error:`, err.message); 
    
        res.status(401).json({ result: 'NG', details: {description:err.message, ID:'', full_name:'', privilege:''} });
        res.end();
    }
  });          


  // 모듈로 내보내기
  module.exports = router;