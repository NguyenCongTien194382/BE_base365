const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KPI365_Decentralization = new Schema({
    id: { // ID phân quyền
        type: Number,
        required: true
    },
    user_id  : { // ID người dùng
        type: Number,
    },
    type: {//  1: Sơ đồ KPI 2:Theo dõi KPI 3: Đánh giá KPI 4: Thiết lập KPI 5: Quản lý phòng ban
        //6: Quản lý nhân viên 7: Dữ liệu xóa 8: KPI toàn công ty
        type: Number,
    },
    function: { //	1.Xem , 2.Thêm mới, 3.Chỉnh sửa, 4.Cập nhật, 5.Xóa
        type: Number,
    },
    
},
{
    collection: "KPI365_Decentralization",
    versionKey: false,
    timestamp: true
})

module.exports = mongoose.model('KPI365_Decentralization', KPI365_Decentralization);