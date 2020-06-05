var express = require('express')
var User = require('./models/user')
var md5 = require('blueimp-md5')

var router = express.Router()

//首页
router.get('/' , function (req , res) {
    res.render('index.html' , {
        user: req.session.user
    })
})


router.get('/login' , function (req , res) {
    res.render('login.html')
})

router.post('/login' , function (req , res , next) {
    // 1. 获取表单数据
    // 2. 查询数据库用户名密码是否正确
    // 3. 发送响应数据
    var body = req.body
    User.findOne({
        email: body.email,
        password: md5(md5(body.password))
    } , function (err , user) {
        if (err) {
            return next(err)
        }

        if (!user) {
            return res.status(200).json({
                err_code: 1,
                message: 'email or password is invaild'
            })
        }

        //用户存在，登录成功，通过 Session 记录登录状态
        req.session.user = user

        res.status(200).json({
            err_code: 0,
            message: 'OK'
        })
    })
})

router.get('/register' , function (req , res , next) {
    res.render('register.html')
})

router.post('/register' , function (req , res , next) {
    //1. 获取表单提交的数据
    //    req.body
    //2. 操作数据库
    //  判断该用户是存在，
    //  如果已存在，不用徐注册，
    //  如果不存在， 注册新建用户
    //3. 发送响应
    var body = req.body
    User.findOne({
        $or: [
            {email: body.email},
            {nickname: body.nickname}
        ]
    } , function (err , data) {
        if (err) {
            return next(err)
        }
        if (data) {
            // 邮箱或者邮箱已存在
            res.status(200).json({
                err_code: 1,
                message: 'email or nickname already exists'
            })
        }
        // 对密码进行 md5 重复加密
        body.password = md5(md5(body.password))
        
        new User(body).save(function (err , user) {
            if (err) {
                return next(err)
            }

            // 注册成功，使用 Session 记录用户的登录状态
            req.session.user = user

            // Express  提供了一个响应方法，json
            // 该方法接收一个对象作为参数， 它会自动帮你把对象转为字符串再发送给浏览器
            res.status(200).json({
                err_code: 0,
                message: 'OK'
            })
        })     
    })
})

router.get('/logout' , function (req , res) {
    //清除登录状态
    //重定向到登录页
    req.session.user = null
    res.redirect('/login')
})


module.exports = router
