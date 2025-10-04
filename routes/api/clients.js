const express = require('express');

const router = express.Router();

// PostgreSQL 연결을 위한 Pool 객체 정의 (예시)
const { Pool } = require('pg');

const localcheck = require('../../middleware/localcheck');
const authMiddleware = require('../../middleware/authMiddleware');
const pool  = require('../../utils/db');
const getSafePagination = require('../../utils/getSafePagination');

// 클라이언트 등록 
router.post('/create_client',localcheck, authMiddleware, async(req, res) => {
  const {
    action_type                 ,  // CREATE, CHANGE, COMPANY_CLIENT_LINK
    client_id                   ,  
    member_company_code         ,   
    client_group                ,   
    client_scale                ,   
    deal_type                   ,   
    client_name                 ,   
    client_name_en              ,   
    business_registration_code  ,   
    establishment_date          ,   
    closure_date                ,   
    ceo_name                    ,   
    business_type               ,   
    business_item               ,   
    industry_type               ,   
    client_zip_code             ,   
    client_address              ,   
    client_phone_number         ,   
    client_fax_number           ,   
    homepage                    ,   
    client_memo                 ,   
    created_by                  ,   
    create_date                 ,   
    modify_date                 ,   
    recent_user                 ,   
    account_code                ,   
    bank_name                   ,   
    account_owner               ,   
    sales_resource              ,   
    application_engineer        ,   
    region                      ,   
    status					            ,	
    user_name                   , 
    company_code, ip_address} = req.body;  

    try{

      const dateRegex = /^\d{4}\.\d{2}\.\d{2}$/;
      let establishment_date_input = establishment_date;
      let closure_date_input = closure_date;

      if (establishment_date_input === null || establishment_date_input === undefined || String(establishment_date_input).trim() === '') {
        establishment_date_input = null; 
      } else {
        if (!dateRegex.test(establishment_date_input)) {
          throw new Error('establishment_date : 날짜는 YYYY.MM.DD 형식이어야 합니다.');
        }
      }

      if (closure_date_input === null || closure_date_input === undefined || String(closure_date_input).trim() === '') {
        closure_date_input = null; 
      } else {
        if (!dateRegex.test(closure_date_input)) {
          throw new Error('closure_date: 날짜는 YYYY.MM.DD 형식이어야 합니다.');
        }
      }
      
  
      const createClient = await pool.query(`call create_client($1, $2, $3, $4, 
        $5, $6, $7, $8, $9, $10, $11, $12, $13, 
        $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, 
        $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36)` ,
      [action_type              ,
       client_id                , 
       company_code             , 
       member_company_code      , 
       client_group             , 
       client_scale             , 
       deal_type                , 
       client_name              , 
       client_name_en           , 
       business_registration_code ,
       establishment_date_input   , 
       closure_date_input         , 
       ceo_name                 , 
       business_type            , 
       business_item            , 
       industry_type            , 
       client_zip_code          , 
       client_address           , 
       client_phone_number      , 
       client_fax_number        , 
       homepage                 , 
       client_memo              , 
       created_by               , 
       create_date              , 
       modify_date              , 
       recent_user              , 
       account_code             , 
       bank_name                , 
       account_owner            , 
       sales_resource           , 
       application_engineer     , 
       region                   , 
       status                   , 
       null                     , 
       null                     , 
       null                     , 
    ]);
    const x_client_id = createClient.rows[0].x_client_id;
    const x_rtn_status = createClient.rows[0].x_rtn_status;
    const x_rtn_msg = createClient.rows[0].x_rtn_msg;
  
    if( x_rtn_status === 'S' ){
      res.json({ ResultCode: '0', ErrorMessage: '' , x_client_id:x_client_id });
    }else{
      res.json({ ResultCode: '1', ErrorMessage: x_rtn_msg});  
    }

    }catch(err){
        console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/clients/create'] reqBody Error:`, client_name );
        console.log(`[${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}] [API: 'api/clients/create '] Error:`, err.message); 
  
        res.status(401).json({ ResultCode: '1', ErrorMessage: err.message });
    }
});

  // 내 회사 클라이언트들  정보 조회
router.post('/getclientlist',localcheck, authMiddleware, async(req, res) => {

    const {search_client_name, 
            search_business_registration_code, 
            search_client_address, 
            search_sales_resource,
            items_per_page, 
            current_page,
            user_name, 
            company_code, ip_address} = req.body;

   // 값이 undefined, null 또는 없는 경우 ''로 설정하여 SQL 쿼리 안전성 확보
   const searchClientName = search_client_name ?? '';
   const searchBusinessRegistrationCode = search_business_registration_code ?? '';
   const searchClientAddress = search_client_address ?? '';
   const searchSalesResource = search_sales_resource ?? '';
 
   //  페이징 함수 호출 및 변수 설정 
   const { itemsPerPage, currentPage, offset } 
     = getSafePagination(items_per_page, current_page); 
              
  
    try{
        const count = await pool.query(`SELECT count(*)
            FROM tbl_client_info 
            WHERE company_code = $1
            and client_name ilike '%'||$2||'%'
            and business_registration_code ilike '%'||$3||'%'
            and client_address ilike '%'||$4||'%'
            and sales_resource ilike '%'||$5||'%'`, 
            [company_code, searchClientName, 
                searchBusinessRegistrationCode, searchClientAddress, 
                searchSalesResource]);
       
        const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);        

        const clientResults = await pool.query(`SELECT *
            FROM tbl_client_info 
            WHERE company_code = $1
            and client_name ilike '%'||$2||'%'
            and business_registration_code ilike '%'||$3||'%'
            and client_address ilike '%'||$4||'%'
            and sales_resource ilike '%'||$5||'%'
            limit $6 offset $7`, 
            [company_code, searchClientName, 
                searchBusinessRegistrationCode, searchClientAddress, 
                searchSalesResource, itemsPerPage, offset]);
  
        let clients = clientResults.rows;
  
      res.json({ ResultCode: '0', ErrorMessage: '', totalPages:totalPages,  clients: clients });
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