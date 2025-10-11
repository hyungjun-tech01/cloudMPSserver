const express = require('express');
require('dotenv').config();

const app = express();
const port = 38005;

// 라우터 파일 불러오기
const usersRouter = require('./routes/api/users');
const clientsRouter = require('./routes/api/clients');
const companiesRouter = require('./routes/api/companies');

// Express가 JSON 형식의 요청 본문을 파싱하도록 설정합니다.
app.use(express.json());

// 특정 경로로 라우터 연결
app.use('/api/users', usersRouter);       // users 로 시작하는 요청은 usersRouter가 처리
app.use('/api/clients', clientsRouter);       // clients 로 시작하는 요청은 clientsRouter 처리
app.use('/api/companies', companiesRouter);       // companies 로 시작하는 요청은 companiesRouter 처리


app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});