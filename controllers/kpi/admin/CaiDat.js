const functions = require('../../../services/functions');

const KPI365_ActivityDiary = require('../../../models/kpi/KPI365_ActivityDiary');


//Danh sách nhật ký hoạt động
exports.listActivityDiary = async (req, res) => {
    try {
        let { idQLC, type, com_id } = req.user.data;
        let { active, search } = req.body;
        let list_activity_diary = await KPI365_ActivityDiary.aggregate([
            {
                $match: {
                    user_id: idQLC,
                    login_type: type,
                    content: { $regex: search, $options: 'i' },
                },
            },
            {
                $sort: { id: -1 }
            },
            {
                $group: {
                    _id: { date: '$date' },
                    records: { $push: '$$ROOT' },
                },
            },
            {
                $sort: { id: -1 },
            },
            {
                $project: {
                    _id: 0,
                    date: '$_id',
                    activity_diary: "$records",
                },
            },
        ]).then(data => {
            return data.map(item => {
                let result = {
                    date: item.date.date,
                };
                let ad = item.activity_diary;
                if (item.activity_diary.length > 0)
                    ad = item.activity_diary.map(item => {
                        let time = new Date(item.created_at * 1000).getHours().toString().padStart(2, '0') + ':' + new Date(item.created_at * 1000).getMinutes().toString().padStart(2, '0');
                        item.time = time
                        item.type = item.type == 1 ? "Sơ đồ KPI" :
                            (item.type == 2 ? "Theo dõi KPI" :
                                (item.type == 3 ? "Đánh giá KPI" :
                                    (item.type == 4 ? "Thiết lập KPI" :
                                        (item.type == 5 ? "Dữ liệu xóa" :
                                            (item.type == 6 ? "Phân quyền" : "Cài đặt")))))

                        return { id: item.id, time: item.time, content: item.content }
                    })
                result.activity_diary = ad
                return result;
            })
        })
            .catch(error => [])

        return functions.success(res,
            `Lấy danh sách nhật ký hoạt động thành công`,
            {
                list_activity_diary
            })
    }
    catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

//Xóa nhật ký hoạt động
exports.deleteActivityDiary = async (req, res) => {
    try {
        let { idQLC, type, com_id } = req.user.data;
        let id = parseInt(req.body.id) || 0;
        if (id == 0)
            return functions.setError(res, "Chưa truyền vào id hoặc truyền sai định dạng", 400);

        await KPI365_ActivityDiary.deleteOne({ id: parseInt(id) })

        return functions.success(res,
            `Xóa nhật ký hoạt động thành công`,
            {
            })
    }
    catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}