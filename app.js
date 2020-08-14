const express = require('express')
const router = require('./router/index')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
app.use(bodyParser.json({
  limit: '50mb'
}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));
// 创建 express 应用


app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

// 监听 / 路径的 get 请求
app.use(router)


//设置跨域请求
app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", ' 3.2.1')
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});


// app.use(cors());
// 使 express 监听 5000 端口号发起的 http 请求
const server = app.listen(5000, function () {
  const {
    address,
    port
  } = server.address()
  console.log('Http Server is running on http://%s:%s', address, port)
})