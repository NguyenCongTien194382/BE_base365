var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var cors = require('cors')
var logger = require('morgan')
var mongoose = require('mongoose')
const rateLimit = require('express-rate-limit')
const cronjob = require("./services/cronjob/NotifyTimekeeping")

var AppQLC = express()
var AppHr = express()
var AppVanThu = express()

function configureApp(app) {
    app.set('views', path.join(__dirname, 'views'))
    app.set('view engine', 'jade')
    //app.use(logger('dev'));
    // AppQLC.use(express.json({ limit: '100mb' }))
    // AppHr.use(express.json({ limit: '100mb' }))
    // AppVanThu.use(express.json({ limit: '100mb' }))
    app.set('trust proxy', '127.0.0.1');
    app.use(express.json({ limit: '200mb' }))
    app.use(express.urlencoded({ extended: false, limit: '2gb' }))
    // app.use(express.limit('2gb'))
    // app.use(bodyParser.json({ limit: '2gb' }))
    app.use(cookieParser())
    app.use(express.static('/root/app/storage'))
    app.use(cors())

    app.use(function (err, req, res, next) {
        res.locals.message = err.message
        res.locals.error = req.app.get('env') === 'development' ? err : {}

        // render the error page
        res.status(err.status || 500)
        res.render('error')
    })
    const limiter = rateLimit({
        windowMs: 1000,
        max: 100,
    })
    app.use(limiter)
}

function errorApp(app) {
    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        next(createError(404))
    })

    // error handler
    app.use(function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message
        res.locals.error = req.app.get('env') === 'development' ? err : {}

        // render the error page
        res.status(err.status || 500)
        res.render('error')
    })
}

function getImgStoragePath() {
    const curDir = __dirname
    const split = curDir
        .split('/')
        .filter((item) => item !== '')
        .slice(0, -1)
    return '/' + split.join('/') + '/storage/base365/qlc'
}
getImgStoragePath()

// Cấu hình AppQLC
configureApp(AppQLC)
var qlcRouter = require('./routes/qlc')
var ToolQLC = require('./routes/qlc/Tools')
AppQLC.use('/api/qlc', qlcRouter)
AppQLC.use('/api/tool', ToolQLC)

// HR
configureApp(AppHr)
var hrRouter = require('./routes/hr')
AppHr.use('/api/hr', hrRouter)

// Vanthu
configureApp(AppVanThu)
var vanthuRouter = require('./routes/vanthu')
AppVanThu.use('/api', vanthuRouter)

//serve image
const storagePath = getImgStoragePath()
console.log(storagePath)
// AppQLC.use(express.static(storagePath));
AppQLC.use('/images', express.static(storagePath))

//lay data video tu client

errorApp(AppQLC)
errorApp(AppHr)
errorApp(AppVanThu)

const DB_URL = 'mongodb://localhost:27017/api-base365'
mongoose
    .connect(DB_URL, { serverSelectionTimeoutMS: 10000 })
    .then(() => console.log('App QLC: DB Connected!'))
    .catch((error) => console.log('App QLC: DB connection error:', error.message))
mongoose.connection.on('error', function () {
    console.log("Lỗi try vấn")
});
//Quản lý chung
AppQLC.listen(3000, () => {
    console.log('AppQLC app is running on port 3000')
})

// vanthu
AppVanThu.listen(3005, () => {
    console.log('AppVanThu app is running on port 3005')
})

//hr
AppHr.listen(3006, () => {
    console.log('AppHr app is running on port 3006')
})

cronjob.get_time_shift()