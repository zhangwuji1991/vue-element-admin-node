const Book = require('../models/Book')
const db = require('../db')
const lodash = require('lodash')
const {
  debug
} = require('../utils/constant')

function exists(book) {
  const {
    title,
    author,
    publisher
  } = book
  const sql = `select title, author, publisher  from book where title='${title}' and author='${author}' and publisher='${publisher}'`
  return db.queryOne(sql)
}

async function removeBook(book) {
  if (book) {
    book.reset()
    if (book.fileName) {
      const removeBookSql = `delete  from book where fileName='${book.fileName}'`
      const removeContentsSql = `delete  from contents where fileName='${book.fileName}'`
      await db.querySql(removeBookSql)
      await db.querySql(removeContentsSql)
    }
  }
}

async function inserContents(book) {
  const contents = book.getContents()
  if (contents && contents.length > 0) {
    for (let i = 0; i < contents.length; i++) {
      const content = contents[i]
      const _content = lodash.pick(content, [
        'href',
        'fileName',
        'id',
        'order',
        'level',
        'label',
        'pid',
        'navId',
        'text'
      ])
      await db.insert(_content, 'contents')
    }
  }
}

function insertBook(book) {
  return new Promise(async (resolve, reject) => {
    try {
      if (book instanceof Book) {
        const result = await exists(book)
        if (result) {
          await removeBook(book)
          reject(new Error('电子书已存在'))
        } else {
          await db.insert(book.toDb(), 'book')
          await inserContents(book)
          resolve()
        }
      } else {
        reject(new Error('添加的图书对象不合法'))
      }
    } catch (error) {

    }
  })
}


function getBook(fileName) {
  return new Promise(async (resolve, reject) => {
    const bookSql = `select * from book where fileName='${fileName}'`
    const contentsSql = `select * from contents where fileName='${fileName}'`
    const book = await db.queryOne(bookSql)
    const contents = await db.querySql(contentsSql)
    if (book) {
      book.cover = Book.genCoverUrl(book)
      book.contentsTree = Book.getContentsTree(contents)
      resolve(book)
    } else {
      reject(new Error('电子书不存在'))
    }

  })
}

function updateBook(book) {
  return new Promise(async (resolve, reject) => {
    try {
      if (book instanceof Book) {
        const result = await getBook(book.fileName)
        if (result) {
          const model = book.toDb()
          if (Number(result.updateType) === 0) {
            reject(new Error('默认图书不能编辑'))
          } else {
            delete model.createDt // 创建时间不能更新
            if (result.createUser !== book.createUser) {
              reject(new Error('只有创建人才能编辑'))
            } else {
              await db.update(model, 'book', `where fileName='${book.fileName}'`)
              resolve()
            }
          }
        } else {
          reject(new Error('电子书不存在'))
        }
      } else {
        reject(new Error('添加的图书对象不合法'))
      }
    } catch (e) {
      reject(e)
    }
  })
}

async function getCategory() {
  const sql = 'select * from category order by category asc'
  const result = await db.querySql(sql)
  const categoryList = []
  result.forEach(item => {
    categoryList.push({
      label: item.categoryText,
      value: item.category,
      num: item.num
    })
  });
  return categoryList
}

async function listBook(query) {
  const {
    category,
    author,
    title,
    sort,
    page = 1,
    pageSize = 20
  } = query
  const offset = (page - 1) * pageSize
  let bookSql = 'select * from book'
  let where = 'where'
  category && (where = db.and(where, 'categoryText', category))
  author && (where = db.andLike(where, 'author', author))
  title && (where = db.andLike(where, 'title', title))
  if (where !== 'where') {
    bookSql = `${bookSql} ${where}`
  }

  //排序
  if (sort) {
    const symbol = sort[0]
    const column = sort.slice(1, sort.length)
    const order = symbol === '+' ? 'asc' : 'desc'
    bookSql = `${bookSql} order by \`${column}\` ${order}`
  }

  let countSql = `select count(*) as count from book`
  if (where !== 'where') {
    countSql = `${countSql} ${where}`
  }
  const count = await db.querySql(countSql)

  bookSql = `${bookSql} limit ${pageSize} offset ${offset}`
  const list = await db.querySql(bookSql)
  list.forEach(book => book.cover = Book.genCoverUrl(book))
  return {
    list,
    count: count[0].count,
    page,
    pageSize
  }
}

async function deleteBook(fileName) {
  let book = getBook(fileName)
  if (book) {
    if (+book.updateType === 0) {
      new Error('内置电子书不能删除')
    } else {
      const bookObj = new Book(null, book)
      const sql = `delete from book where fileName='${fileName}'`
      await db.querySql(sql).then(() => {
        bookObj.reset()
      })
    }

  } else {
    new Error('电子书不存在')
  }
}

module.exports = {
  insertBook,
  getBook,
  updateBook,
  getCategory,
  listBook,
  deleteBook
}