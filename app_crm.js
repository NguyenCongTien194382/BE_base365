var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser')
var cors = require('cors');
var logger = require('morgan');
var mongoose = require('mongoose')
const cron = require('node-cron')
const rateLimit = require("express-rate-limit");
const { handle_auto_call } = require('./controllers/crm/Customer/ScheduleAutoCall')

var AppCRM = express();

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
    const limiter = rateLimit({
        windowMs: 1000,
        max: 10
    });
    // app.use(limiter);
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


// Cấu hình AppCRM
configureApp(AppCRM);
var CrmRouter = require('./routes/crm/CRMroutes');
AppCRM.use("/api/crm", CrmRouter);
errorApp(AppCRM);

const DB_URL = 'mongodb://localhost:27017/api-base365';
mongoose.connect(DB_URL, { serverSelectionTimeoutMS: 10000 })
    .then(() => console.log('APP CRM: DB Connected!'))
    .catch(error => console.log('APP CRM: DB connection error:', error.message));
mongoose.connection.on('error', function() {
    console.log("Lỗi try vấn")
});
cron.schedule('*/30 * * * * *', () => {
    handle_auto_call()
});

// // Quản trị crm
AppCRM.listen(3007, () => {});