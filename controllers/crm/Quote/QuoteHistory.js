const QuoteHistory = require('../../../models/crm/Quote/QuoteHistory');
const functions = require('../../../services/functions');
const Users = require('../../../models/Users');

exports.addHistory = async (comId, userId, quote_id, action) => {
    try {
        const maxId = await QuoteHistory.findOne({ com_id: comId }, { id: 1 }, { sort: { id: -1 } }).lean() || 0
        const id = Number(maxId.id) + 1 || 1

        if (comId && userId && quote_id && action) {
            const newData = new QuoteHistory({
                id: id,
                com_id: comId,
                quote_id: quote_id,
                action: action,
                user_id: userId,
                modify_at: new Date(),
                is_delete: 0,
            })

            const result = await newData.save()
        } else {
            const newData = new QuoteHistory({
                id: id,
                com_id: comId ? comId : 0,
                quote_id: quote_id ? quote_id : 0,
                action: 'Thay đổi không hợp lệ',
                user_id: userId ? userId : 0,
                modify_at: new Date(),
                is_delete: 0,
            })

            const result = await newData.save()
        }
    } catch (error) {
        console.log('Error: ', error);
    }
}

exports.getQuoteHistory = async (req, res, next) => {
    try {
        const { quote_id } = req.body
        let comId = 0

        if (req.user.data.type == 1 || req.user.data.type == 2) {
            comId = req.user.data.com_id;

            if (comId && quote_id) {
                comId = req.user.data.com_id;

                // Tìm theo các giá trị...
                let conditions = { quote_id: Number(quote_id), is_delete: 0, com_id: comId } // Mặc định 

                const data = await QuoteHistory.find(conditions)
                    .sort({ modify_at: -1 })
                    .populate({
                        path: 'user_id',
                        model: Users,
                        localField: 'user_id',
                        foreignField: 'idQLC',
                        options: { lean: true },
                        select: 'userName',
                    })

                return functions.success(res, "Lịch sử báo giá", { data: data })
            } else {
                return functions.setError(res, "Thiếu trường thuộc tính", 400);
            }
        } else {
            return functions.setError(res, "Bạn không có quyền", 400);
        }
    } catch (error) {
        console.log('Error: ', error);
        return functions.setError(res, error.message)
    }
}