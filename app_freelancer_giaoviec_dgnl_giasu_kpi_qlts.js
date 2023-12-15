var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var cors = require('cors');
var logger = require('morgan');
var mongoose = require('mongoose');
var db = require('./config');
const rateLimit = require("express-rate-limit");

var AppDGNL = express();
var AppFreelancer = express();
var AppGiaoViec = express();
var AppGiaSu = express();
var AppKPI = express();
var appQLTS = express();

function configureApp(app) {
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
    //app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static('/root/app/storage'));
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

// Cấu hình AppDGNL
configureApp(AppDGNL);
var DgnlRouter = require('./routes/DGNL');
AppDGNL.use('/api/DGNL', DgnlRouter);
errorApp(AppDGNL);

// Cấu hình App Freelancer
configureApp(AppFreelancer);
var freelancerRouter = require('./routes/freelancer');
AppFreelancer.use('/api/freelancer', freelancerRouter);
errorApp(AppFreelancer);

// Cấu hình App Giao viec
configureApp(AppGiaoViec);
var giaoViecRouter = require('./routes/giaoviec');
AppGiaoViec.use('/api/giaoviec', giaoViecRouter);
errorApp(AppGiaoViec);

// Cấu hình AppGiasu
configureApp(AppGiaSu);
var GiaSuRouter = require('./routes/giasu');
AppGiaSu.use('/api/giasu', GiaSuRouter);
errorApp(AppGiaSu);

// Cấu hình KPI
configureApp(AppKPI);
var KPIRouter = require('./routes/kpi');
AppKPI.use('/api/kpi', KPIRouter);
errorApp(AppKPI);

// Cấu hình appQLTS
configureApp(appQLTS);
var qltsRouter = require('./routes/qltsRouter');
appQLTS.use('/api/qlts', qltsRouter);
errorApp(appQLTS);

// const DB_URL = 'mongodb://localhost:27017/api-base365';
// mongoose
//     .connect(DB_URL)
//     .then(() => console.log('DB Connected!'))
//     .catch((error) => console.log('DB connection error:', error.message));
db.DbConnect();

// DGNL
AppDGNL.listen(3014, () => {
    console.log(`Danh Gia Nang Luc app is running on port 3014`);
});

//Freelancer
AppFreelancer.listen(3016, () => {
    console.log(`Freelancer app is running on port 3016`);
});

AppFreelancer.on('error', (error) => {
    console.error('Error occurred while listening on freelancer port:', error);
});

// Giao việc
AppGiaoViec.listen(3012, () => {
    console.log(`GiaoViec app is running on port 3012`);
});

// Gia sư
AppGiaSu.listen(3023, () => {
    console.log(`GiaSu app is running on port 3023`);
});

// KPI
AppKPI.listen(3015, () => {
    console.log(`KPI app is running on port 3015`);
});

// QLTS
appQLTS.listen(3011, () => {
    console.log(`QLTS app is running on port 3011`);
});