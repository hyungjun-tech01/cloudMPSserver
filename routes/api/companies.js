const express = require('express');
// jwt 모듈 추가
const jwt = require('jsonwebtoken');

const router = express.Router();


const localcheck = require('../../middleware/localcheck');
const authMiddleware = require('../../middleware/authMiddleware');
const pool  = require('../../utils/db');


// 컴퍼니 정보 조회
router.post('/getcompanyinfo',localcheck, authMiddleware, async(req, res) => {

    const {company_code, user_name, ip_address} = req.body;

    //username 과 ip_address로 logging
  
    try{
      const companys = await pool.query(`SELECT *
        FROM tbl_company_info WHERE company_code = $1`, [company_code]);
  
  
      let company = companys.rows[0];
  
  
      res.json({ ResultCode: '0', ErrorMessage: '', company: company });
      res.end();
  
    }catch(err){
        console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/users/getuserinfo'] reqBody Error:`, user_name );
        console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/users/getuserinfo '] Error:`, err.message); 
  
        res.status(401).json({ ResultCode: '1', ErrorMessage: err.message });
        res.end();
    }
  
  });

 // 모듈로 내보내기
module.exports = router;