const express = require('express')
const cors = require('cors')
const config = require('./config')
const { userRouter, projectRouter } = require('./router')
// 解析 token 的中间件
const expressJWT = require('express-jwt')
const jwt = require('jsonwebtoken')
const app = express()
const server = require('http').Server(app)
app.use(cors())
app.use((req, res, next) => {
  // 0表示失败 1表示成功
  res.esend = function (err, status = 0) {
    res.send({
      status,
      message: err instanceof Error ? err.message : err
    })
  }
  res.ssend = function (data, status = 1) {
    res.send({
      status,
      message: 'success',
      data: data || {}
    })
  }
  next()
})
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
// app.use(expressJWT({ secret: config.jwtSecretKey }).unless({ path: [/^\/api\/auth\//] }))
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') return res.esend('身份认证失败！')
  next()
})
/* app.use(function (req, res, next) {
  //正则匹配需要鉴权的路由
  const regexp = new RegExp('^/api/auth')
  if (!regexp.test(req.path)) {
    const token = req.headers['authorization'].replace('Bearer ', '')
    const result = jwt.verify(token, config.jwtSecretKey)
    req.id = result.id
    req.username = result.username
  }
  next()
}) */
app.use('/api', userRouter)
app.use('/api', projectRouter)
server.listen(5000, function () {
  console.log('api server running at http://127.0.0.1:5000')
})
