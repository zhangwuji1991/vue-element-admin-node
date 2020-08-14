const { env } = require('./env')
const UPLOAD_PATH = env === 'env' ? 'd:/web/ziyuan/admin-upload-ebook' : 'd:/web/ziyuan/admin-upload-ebook'
const UPLOAD_URL = env === 'dev' ? 'http://localhost:9000/admin-upload-ebook' : 'http://localhost:9000/admin-upload-ebook'

module.exports = {
  CODE_ERROR: -1,
  CODE_TOKEN_EXPIRED: -2,
  CODE_SUCCESS: 0,
  debug: true,
  PWD_SALT: 'admin_imooc_node',
  PRIVATE_KEY: 'admin_imooc_node_test_youbaobao_xyz',
  JWT_EXPIRED: 60 * 60 * 24, // token失效时间,
  UPLOAD_PATH,
  UPLOAD_URL,
  MIME_TYPE_EPUB: 'application/epub'
}