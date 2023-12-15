const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KPI365_Kpi = new Schema({
    id: { // ID kpi
        type: Number,
        required: true
    },
    name: {// Tên kpi
        type: String,
    },
    type: { // 1.Công ty, 2.Phòng ban, 3. Tổ, 4.Nhóm, 5.Cá nhân	6.Tổ chức
        type: String,
        default: ""
    },
    type_unit: {// 1.Tài chính, 2.Khách hàng, 3.Quy trình nội bộ, 4.Học hỏi và phát triển, 5.OKR
        type: String,
    },
    unit_id: { //ID đơn vị tính
        type: Number,
    },
    target: { //mục tiêu
        type: String,
        default: ""
    },
    percent: { //Trọng số
        type: String,
        default: "0"
    },
    conn_target: { //mục tiêu kết nối
        type: Number,
        default: 0
    },
    created_at: {// Ngày tạo
        type: Number,
    },
    updated_at: {// Ngày cập nhật
        type: Number,
        default: 0
    },
    start_day: { //Ngày bắt đầu
        type: Number,
    },
    end_date: { //Ngày kết thúc
        type: Number,
    },
    description: { //Mô tả
        type: String,
    },
    target_year: { //Năm mục tiêu
        type: Number,
        default: 0
    },
    department_id: { //ID phòng ban
        type: Number,
        default: 0
    },
    nest_id: { //ID tổ
        type: Number,
        default: 0
    },
    group_id: { //ID nhóm
        type: Number,
        default: 0
    },
    organization_id: { //ID tổ chức
        type: Number,
        default: 0
    },
    level: { //Cấp của tổ chức
        type: Number,
        default: 0
    },
    staff: { //Nhân viên
        type: String,
        default: "0"
    },
    manager: { //Người quản lý
        type: String,
        default: "0"
    },
    followers: { //Người theo dõi
        type: String,
        default: "0"
    },
    company_id: { //ID công ty
        type: Number,
    },
    is_deleted: { //0.Không xóa,1.Đã xóa, 2.Xóa vĩnh viễn
        type: Number,
        default: 0
    },
    is_last: { //0.Không có kết nối con, 1.Có kết nối con
        type: Number,
        default: 0
    },
    group_type: { //0. Null, 1.Nhóm KPI mới, 2.Nhóm
        type: Number,
        default: 0
    },
    type_target: { //0.KPI đơn mục tiêu, 1.KPI đa mục tiêu
        type: Number,
        default: 0
    },
    precent_target: { //Trọng số của chỉ tiêu
        type: String,
        default: "0"
    },
    calculate: { //Cách tính của chỉ tiêu (0.Tự nhập, 1.Công thức)
        type: String,
        default: "0"
    },
    target_id: { //ID chỉ tiêu
        type: String,
        default: "0"
    },
    is_parent_deleted: { //0.Chưa xóa, 1.Đã xóa, 2.Xóa vĩnh viễn
        type: Number,
        default: 0
    },
    formula: { //Công thức
        type: String,
        default: ""
    },
},
    {
        collection: "KPI365_Kpi",
        versionKey: false,
        timestamp: true
    })

module.exports = mongoose.model('KPI365_Kpi', KPI365_Kpi);