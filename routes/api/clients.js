const express = require('express');

const router = express.Router();

// PostgreSQL 연결을 위한 Pool 객체 정의 (예시)
const { Pool } = require('pg');

const localcheck = require('../../middleware/localcheck');
const authMiddleware = require('../../middleware/authMiddleware');
const pool  = require('../../utils/db');
const getSafePagination = require('../../utils/getSafePagination');

// 클라이언트 등록 

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