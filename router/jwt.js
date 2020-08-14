const expressJwt = require('express-jwt');
const {
  PRIVATE_KEY
} = require('../utils/constant');

const jwtAuth = expressJwt({
  secret: PRIVATE_KEY,
  credentialsRequired: false // 设置为false就不进行校验了，游客也可以访问
}).unless({
  path: [
    '/',
    '/user/login',
    '/book/upload'
  ], // 设置 jwt 认证白名单
});

module.exports = jwtAuth;