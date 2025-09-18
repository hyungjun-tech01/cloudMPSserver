const express = require('express');
const app = express();
const port = 38005;

// 라우터 파일 불러오기
const usersRouter = require('./routes/api/users');

// 특정 경로로 라우터 연결
app.use('/api/users', usersRouter);       // /users 로 시작하는 요청은 usersRouter가 처리

app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});