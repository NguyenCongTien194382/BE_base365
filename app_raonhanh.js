var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser')
var cors = require('cors');
var logger = require('morgan');
var mongoose = require('mongoose')
const rateLimit = require("express-rate-limit");
var AppRaonhanh = express();

function configureApp(app) {
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
    //app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static("/root/app/storage"));
    app.use(cors());

    app.use(function(err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });

    // unti ddos 
    const limiter = rateLimit({
        windowMs: 1000,
        max: 10
    });
    app.use(limiter);
}

function errorApp(app) {
    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        next(createError(404));
    });

    // error handler
    app.use(function(err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });
}

// Cấu hình AppRaonhanh
configureApp(AppRaonhanh);
var raonhanhRouter = require('./routes/raonhanh');
var raonhanhtool = require('./routes/raonhanh365/tools');
AppRaonhanh.use("/api/raonhanh", raonhanhRouter);
AppRaonhanh.use("/api/tool", raonhanhtool);
errorApp(AppRaonhanh);

const DB_URL = 'mongodb://localhost:27017/api-base365';
mongoose.connect(DB_URL, { serverSelectionTimeoutMS: 10000 })
    .then(() => console.log('App RaoNhanh365: DB Connected!'))
    .catch(error => console.log('App RaoNhanh365: DB connection error:', error.message));
mongoose.connection.on('error', function() {
    console.log("Lỗi try vấn")
});
// Raonhanh
AppRaonhanh.listen(3004, () => {});