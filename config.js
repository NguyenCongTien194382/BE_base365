var mongoose = require('mongoose');

exports.DbConnect = () => {
    const DB_URL = 'mongodb://localhost:27017/api-base365';
    mongoose.connect(DB_URL, { serverSelectionTimeoutMS: 10000 })
        .then(() => console.log('DB Connected!'))
        .catch(error => console.log('DB connection error:', error.message));
    mongoose.connection.on('error', function() {
        console.log("Lỗi try vấn")
    });
}