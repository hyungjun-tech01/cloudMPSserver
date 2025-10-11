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
        console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/companies/getcompanyinfo'] reqBody Error:`, company_code );
        console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/companies/getcompanyinfo '] Error:`, err.message); 
  
        res.status(401).json({ ResultCode: '1', ErrorMessage: err.message });
        res.end();
    }
  
  });

// 컴퍼니리스트 정보 조회 by 회사코드, 회사이름, 사업자번호 
router.post('/getcompanylist_query',localcheck, authMiddleware, async(req, res) => {

  const {company_code, 
          company_name, 
          business_registration_code, 
          user_name, 
          ip_address} = req.body;

  //username 과 ip_address로 logging

  try{

    if (!company_code && !company_name && !business_registration_code) {
      // 사용자 입력 오류로 간주하여 커스텀 에러 객체를 throw
      const error = new Error('회사코드, 회사이름, 사업자번호 중 최소 하나는 입력해야 합니다.');
      error.statusCode = 400; // HTTP 상태 코드 지정
      error.resultCode = '2'; // 사용자 정의 ResultCode 지정 (옵션)
      throw error;
    }

    let conditions = [];
    let params = [];
    let paramIndex = 1; // 매개변수 인덱스 ($1, $2, $3...)

    // 2. 조건에 따라 쿼리 조각과 매개변수 구성
    if (company_code) {
        conditions.push(`CAST(company_code AS TEXT) ILIKE '%' || $${paramIndex} || '%'`);
        params.push(company_code);
        paramIndex++;
    }

    if (company_name) {
        // company_name은 ILIKE를 사용하고 있으므로, company_code도 ILIKE로 통일하는 것이 일관적입니다.
        conditions.push(`company_name ILIKE '%' || $${paramIndex} || '%'`);
        params.push(company_name);
        paramIndex++;
    }

    if (business_registration_code) {
        conditions.push(`business_registration_code ILIKE '%' || $${paramIndex} || '%'`);
        params.push(business_registration_code);
        paramIndex++;
    }
    
    // 모든 조건을 OR로 연결하여 최종 쿼리 문자열 생성
    const whereClause = conditions.join(' OR ');


    const companys = await pool.query(`SELECT *
      FROM tbl_company_info 
      WHERE ${whereClause}`, params);

      if (companys.rows.length === 0) {
          const error = new Error('조회된 회사 정보가 없습니다.');
          error.statusCode = 404; // HTTP 상태 코드 지정 (Not Found)
          error.resultCode = '3'; // 검색 결과 없음을 나타내는 ResultCode (예시)
          throw error;
      }

    res.json({ ResultCode: '0', ErrorMessage: '', companies: companys.rows });
    res.end();

  }catch(err){
      console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/companies/getcompanylist_query'] reqBody Error:`, company_code, company_name, business_registration_code );
      console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/companies/getcompanylist_query '] Error:`, err.message); 

      const resultCode = err.resultCode || '1';

      res.status(401).json({ ResultCode: resultCode, ErrorMessage: err.message });
      res.end();
  }

});  

 // 모듈로 내보내기
module.exports = router;