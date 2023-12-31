var TagBlog = require('../../models/Timviec365/Blog/TagBlog');
var functions = require('../../services/functions');

exports.relatedkeywords = async(title) => {
    // Từ khóa liên quan
    let key_blog = functions.clean_sp(title);
    const listTag = await TagBlog.find({
        $text: {
            $search: key_blog
        }
    }, {
        tag_url: 1,
        tag_key: 1,
    }).limit(12).lean();

    return listTag;
}

exports.removerKeyBlog = (title = []) => {
    if (Array.isArray(title) && title.length > 0) {
        const arrRemove = [
            "việc", "làm", "gì", "những", "là", "công", "viên", "cách", "nhất", "bạn", "dụng",
            "cv", "về", "nhân", "cho", "tuyển", "cần", "biết", "mẫu", "xin", "của", "trong",
            "tìm", "mới", "có", "tại", "và", "nhà", "thông", "nghiệp", "khi", "hiệu", "kinh",
            "viết", "tin", "lương", "để", "doanh", "nên", "quyết", "hàng", "điều", "quả", "lý",
            "vấn", "bí", "thành", "sự", "giúp", "không", "nào", "quan", "các", "2019", "học",
            "nghề", "thêm", "hợp", "người", "năng", "ứng", "câu", "hỏi", "hay", "quản", "với",
            "đơn", "một", "phỏng", "chuẩn", "định", "bản", "cơ", "thế", "sinh", "dẫn", "đồng",
            "ngành", "hướng", "tải", "kỹ", "bán", "thu", "tạo", "trình", "hiện", "hồ", "phí",
            "động", "liên", "như", "thời", "nay", "hiểu", "sơ", "miễn", "từ", "nghiệm", "tiếng",
            "đề", "bộ", "kế", "ra", "theo", "bằng", "cao", "quy", "biên", "hội", "vị", "được",
            "nhật", "tất", "chức", "mức", "nhận", "qua", "số", "thuế", "chọn", "nghỉ", "trường",
            "tiền", "toán", "tài", "đối", "chuyên", "nhập", "anh", "bị", "nội", "tập", "tật",
            "báo", "lãnh", "nhanh", "top", "tượng", "đạo", "gian", "sản", "tính", "điểm", "lao",
            "lưu", "minh", "văn", "đầu", "thể", "thực", "tra", "trọng", "tần", "cập", "dành",
            "giới", "hóa", "phòng", "phải", "sách", "chưa", "năm", "sếp", "tiêu", "ty", "tác"
        ];

        const result = title.filter((item) => !arrRemove.includes(item.toLowerCase()));
        return result;
    } else {
        return title;
    }
}