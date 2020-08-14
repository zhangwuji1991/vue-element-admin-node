const express = require('express')
const multer = require('multer')
const boom = require('boom')
const router = express.Router()
const { UPLOAD_PATH } = require('../utils/constant')
const Book = require('../models/Book')
const Result = require('../models/Result')
const { decode } = require('../utils')
const bookService = require('../services/book')


router.post('/upload', multer({ dest: `${UPLOAD_PATH}/book` }).single('file'), function (req, res, next) {
  if (!req.file || req.file.length === 0) {
    new Result('上传电子书失败').fail(res)
  } else {
    const book = new Book(req.file)
    book.parse().then(book => {
      new Result(book, '上传电子书成功').success(res)
    }).catch(err => {
      next(boom.badImplementation(err))
    })
  }
})

router.post('/create', function (req, res, next) {
  const decoded = decode(req)
  if (decoded && decoded.username) {
    req.body.username = decoded.username
  }
  const book = new Book(null, req.body)
  bookService.insertBook(book).then(() => {
    new Result(book, '添加电子书成功').success(res)
  }).catch(err => {
    next(boom.badImplementation(err))
  })
})

router.get('/get', function (req, res, next) {
  const { fileName } = req.query
  if (!fileName) {
    next(boom.badRequest(new Error('参数fileName不能为空')))
  } else {
    bookService.getBook(fileName).then(book => {
      new Result(book, '获取信息成功').success(res)
    }).catch(err => {
      next(boom.badImplementation(err))
    })
  }
})

router.post('/update', function (req, res, next) {
  const decoded = decode(req)
  if (decoded && decoded.username) {
    req.body.username = decoded.username
  }
  const book = new Book(null, req.body)
  bookService.updateBook(book).then(() => {
    new Result(null, '更新成功').success(res)
  }).catch(err => {
    next(boom.badImplementation(err))
  })
})

router.get('/category', function (req, res, next) {
  bookService.getCategory().then(category => {
    new Result(category, '获取分类成功').success(res)
  }).catch(err => {
    next(boom.badImplementation(err))
  })
})

router.get('/list', function (req, res, next) {
  bookService.listBook(req.query).then(({ list, count, page, pageSize }) => {
    new Result({ list, count, page: +page, pageSize: +pageSize }, '获取图书列表成功').success(res)
  }).catch(err => {
    next(boom.badImplementation(err))
  })
})


router.get('/delete', function (req, res, next) {
  const { fileName } = req.query
  if (!fileName) {
    next(boom.badRequest(new Error('参数fileName不能为空')))
  } else {
    bookService.deleteBook(fileName).then(book => {
      new Result(book, '删除信息成功').success(res)
    }).catch(err => {
      next(boom.badImplementation(err))
    })
  }
})

module.exports = router