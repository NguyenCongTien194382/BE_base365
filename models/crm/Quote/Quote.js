const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const crm_quote = new Schema ({
    // Báo giá

    // Tự sinh
    id: {
        type: Number,
        require: true
    },
    com_id: {
        type: Number,
        require: true
    },
    quote_code: { // Số báo giá, tự sinh, format: BG-0001, Lưu dạng số
        type: Number,
        require: true
    },
    // Lưu cả dạng số và chữ để tiện trong việc tạo và tìm
    quote_code_str: { // Số báo giá, tự sinh, format: BG-0001
        type: String,
        require: true
    },
    
    date_quote: { // Ngày báo giá
        type: Date,
        require: true
    },
    date_quote_end: { // Hạn thanh toán
        type: Date,
        require: true
    },
    status: { // Tình trạng: 1 Bản thảo, 2 Đàm phán, 3 Đã gửi, 4 Chờ xác nhận, 5 Đồng ý, 6 Từ chối
        type: Number,
        require: true
    },
    customer_id: { // Khách hàng
        type: Number,
        require: true
    },
    tax_code: { // Mã số thuế
        type: String,
        default: null
    },
    address: { // Địa chỉ
        type: String,
        default: null
    }, 
    phone_number: { // Số điện thoại
        type: String,
        default: null
    },
    // Cơ hội, giao diện có, tài liệu không
    introducer: { // Lời giới thiệu
        type: String,
        default: null
    },
    // Hàng hóa, lưu ntn? Lấy từ bảng nào
    product_list: [
        {
            product_id: { // Hàng hóa
                type: Number,
                default: 0
            },
            amount: { // Số lượng
                type: Number,
                default: 0
            },
            product_price: {
                type: Number,
                default: 0
            },
            product_discount_rate: { // Tỷ lệ chiết khấu
                type: Number,
                default: 0
            },
            // product_discount_money: { // Tiền chiết khấu
            //     type: Number,
            //     default: 0
            // },
            tax_rate: { // VAT
                type: Number,
                default: 0
            },
            // tax_money: { // Tiền thuế
            //     type: Number,
            //     default: 0
            // },
            product_total_money: { // Thành tiền
                type: Number,
                default: 0
            }
        }
    ],
    //
    //
    // Chương trình khuyến mãi?
    //
    //
    discount_rate: { // Chiết khấu đơn hàng (%)
        type: Number,
        default: 0
    },
    // discount_money: { // Chiết khấu đơn hàng (VND)
    //     type: Number,
    //     default: 0
    // },
    total_money: { // Tổng tiền thanh toán
        type: Number,
        default: 0
    },
    terms_and_conditions: { // Điều khoản và quy định
        type: String,
        default: null
    },
    note: { // Ghi chú
        type: String,
        default: null
    },
    creator_name: { // Người lập
        type: String,
        require: true
    },
    ceo_name: { // Giám đốc
        type: String,
        require: true
    },
    description: { // Mô tả
        type: String,
        default: null
    },
    use_system_info: { // Trên giao diện: Thông tin hệ thống, checkbox dùng chung
        type: Boolean,
        default: null
    },

    user_created_id: {
        type: Number,
        default: null
    },
    user_updated_id: {
        type: Number,
        default: null
    },
    is_delete: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Number,
        default: 0
    },
    updated_at: {
        type: Number,
        default: 0
    }
}, {
    collection: 'CRM_Quote',
    versionKey: false,
    timestamps: true
})

module.exports = mongoose.model('CRM_Quote', crm_quote)