const mongoose = require("mongoose");
const see_user = new mongoose.Schema({

    su_id : {
        type : Number ,
        required: true,
        unique: true,
        autoIncrement: true

    },
    ugs_parent : {
        type : Number ,

    },
    ugs_teach : {
        type : Number ,

    },
    su_today : {
        type : Number ,

    },
    su_status : {
        //1: miễn phí. 2: mất phí',
        type : Number ,

    },
    type : {
        //'0: đã xem(khi xem chi tiết), 1: đã mở(khi mất điểm để xem)'
        type : Number ,
        default : 0
    },

}, {
    collection: "GS_see_user",
    versionKey: false,
}
);
module.exports = mongoose.model("GS_see_user", see_user);