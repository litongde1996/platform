var express = require('express')
var path = require('path')
var session = require('express-session')
var router = require('./router')


var app = express()

app.use('/public/' , express.static(path.join(__dirname , './public/')))
app.use('/node_modules/' , express.static(path.join(__dirname , './node_modules/')))

//配置模板引擎
app.engine('html', require('express-art-template'))
app.set('views' , path.join(__dirname , './views'))//默认就是 ./views 目录

//配置 req.body , 配置一定在挂载路由之前
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
 
//在 Express 这个框架中，默认不支持 Session 和 Cookie
// 但是我们可以使用第三方中间件： express-session 来解决
//    当把这个插件配置好了之后，我们就可以通过 req.session 来访问和设置 Session 成员
//       添加 Session 数据： req.session.foo = 'bar'
//       访问 Session 数据： req.session.foo
app.use(session({
    // 配置加密字符串，它会在原有加密基础上和这个字符串拼起来去加密
    // 目的是为了增加安全性， 防止客户端恶意伪造
    secret: 'keyboard cat', 
    resave: false,
    // 无论你是否使用 Session ，我都默认直接给你分配一把钥匙
    saveUninitialized: true
}))


//把路由挂载到app中
app.use(router)

//配置一个处理 404 的中间件
app.use(function (req , res) {
    res.render('404.html')
})


//配置一个全局错误处理中间件
app.use(function (err, req , res , next) {
    res.status(500).json({
        err_code: 500,
        message: err.message
    })
})

 
app.listen(3000 , function () {
    console.log('running...')
})
