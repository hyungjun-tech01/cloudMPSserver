const express = require('express');
// jwt 모듈 추가
const jwt = require('jsonwebtoken');

const router = express.Router();


const localcheck = require('../../middleware/localcheck');
const authMiddleware = require('../../middleware/authMiddleware');
const checkRateLimit = require('../../middleware/checkRateLimit');
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

// 컴퍼니리스트 정보 조회 by 회사코드, 회사이름, 사업자번호 , 로그인 전에 보내주어야 함.
router.post('/getcompanylist_query', checkRateLimit , localcheck, async(req, res) => {

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


    const companys = await pool.query(`SELECT company_code, company_name, company_address
      FROM tbl_company_info 
      WHERE ${whereClause}
      LIMIT 50`, params);

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

// 컴퍼니 정보 수정 
router.post('/modify',localcheck, authMiddleware, async(req, res) => {

  const {deal_company_code
    ,company_group
    ,company_scale
    ,deal_type
    ,company_name
    ,company_name_en
    ,business_registration_code
    ,establishment_date
    ,closure_date
    ,ceo_name
    ,business_type
    ,business_item
    ,industry_type
    ,company_zip_code
    ,company_address
    ,company_phone_number
    ,company_fax_number
    ,homepage
    ,company_memo
    ,counter
    ,account_code
    ,bank_name
    ,account_owner
    ,sales_resource
    ,application_engineer
    ,region
    ,status
    ,contract_expiraton_date
    ,language
    ,time_zone
    ,currency_code
    ,country
    ,company_type
    ,company_code
    , user_name
    , ip_address} = req.body;

  //username 과 ip_address로 logging

  try{
    const dateRegex = /^\d{4}\-\d{2}\-\d{2}$/;
    let establishment_date_input = establishment_date;
    let closure_date_input = closure_date;
    let contract_expiraton_date_input = contract_expiraton_date;

    if(!company_code){
      const error = new Error('company_code 필수입니다.');
      error.statusCode = 400; // HTTP 상태 코드 지정
      error.resultCode = '2'; // 사용자 정의 ResultCode 지정 (옵션)
      throw error;
    }

    if (establishment_date_input === null || establishment_date_input === undefined || String(establishment_date_input).trim() === '') {
      establishment_date_input = null; 
    } else {
      if (!dateRegex.test(establishment_date_input)) {
        const error = new Error('undefined_foramt_establishment_date');
        error.statusCode = 400; // HTTP 상태 코드 지정
        error.resultCode = '3'; // 사용자 정의 ResultCode 지정 (옵션)
        throw error;
      }
    }

    if (closure_date_input === null || closure_date_input === undefined || String(closure_date_input).trim() === '') {
      closure_date_input = null; 
    } else {
      if (!dateRegex.test(closure_date_input)) {
        const error = new Error('undefined_foramt_closure_date');
        error.statusCode = 400; // HTTP 상태 코드 지정
        error.resultCode = '3'; // 사용자 정의 ResultCode 지정 (옵션)
        throw error;
      }
    }

    if (contract_expiraton_date_input === null || contract_expiraton_date_input === undefined || String(closure_date_input).trim() === '') {
      contract_expiraton_date_input = null; 
    } else {
      if (!dateRegex.test(contract_expiraton_date_input)) {
        const error = new Error('undefined_foramt_contract_expiraton_date');
        error.statusCode = 400; // HTTP 상태 코드 지정
        error.resultCode = '3'; // 사용자 정의 ResultCode 지정 (옵션)
        throw error;
      }
    }

    const user_id = await pool.query(`select user_id
      from tbl_user_info tbi
      where tbi.user_name = $1`,[user_name]);

    const v_user_id = user_id.rows[0].user_id;
      
    const createCompany = await pool.query(`
    update tbl_company_info
    set deal_company_code         = $2::integer,
      company_group               = $3,
      company_scale               = $4,
      deal_type                   = $5,
      company_name                = $6,
      company_name_en             = $7,
      business_registration_code  = $8,
      establishment_date          = $9::date,
      closure_date                = $10::date,
      ceo_name                    = $11,
      business_type               = $12,
      business_item               = $13,
      industry_type               = $14,
      company_zip_code            = $15,
      company_address             = $16,
      company_phone_number        = $17,
      company_fax_number          = $18,
      homepage                    = $19,
      company_memo                = $20,
      counter                     = $21,
      account_code                = $22,
      bank_name                   = $23,
      account_owner               = $24,
      sales_resource              = $25,
      application_engineer        = $26,
      region                      = $27,
      status                      = $28,
      contract_expiraton_date     = $29,
      language                    = $30,
      time_zone                   = $31,
      currency_code               = $32,
      country                     = $33,
      company_type		            = $34,
      recent_user                 = $35,
      modify_date                 = now()
      where company_code = $1 ` ,
    [ company_code             
      ,deal_company_code ,company_group ,company_scale
    ,deal_type ,company_name ,company_name_en ,business_registration_code
    ,establishment_date_input ,closure_date_input ,ceo_name
    ,business_type  ,business_item ,industry_type
    ,company_zip_code ,company_address ,company_phone_number
    ,company_fax_number ,homepage ,company_memo
    ,counter ,account_code ,bank_name
    ,account_owner ,sales_resource ,application_engineer
    ,region ,status ,contract_expiraton_date_input
    ,language ,time_zone ,currency_code
    ,country ,company_type, v_user_id
  ]);


    res.json({ ResultCode: '0', ErrorMessage: '' });
    res.end();

  }catch(err){
      console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/companies/getcompanyinfo'] reqBody Error:`, company_code );
      console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/companies/getcompanyinfo '] Error:`, err.message); 

      const resultCode = err.resultCode || '1';
      res.status(401).json({ ResultCode: resultCode, ErrorMessage: err.message });

      res.end();
  }

});

 // 모듈로 내보내기
module.exports = router;