const DexuatSensitive = require("../../models/crm/DexuatSensitive");
const functions = require('../../services/functions');
const axios = require('axios');
exports.DexuatWordSensitive = async(req, res) => {
    try {

        let newobj = new DexuatSensitive({
            creator: req.body.creator,
            receiver: req.body.receiver,
            word: req.body.word,
            link: req.body.link
        })
        await newobj.save();

        return functions.success(res, "Lưu thành công");
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

exports.DuyetDexuatWordSensitive = async(req, res) => {
    try {
        let obj = await DexuatSensitive.findOne({ _id: req.body._id }).lean();
        await DexuatSensitive.deleteOne({ _id: req.body._id });
        await axios({
            method: "post",
            url: "http://43.239.223.5:5558/add",
            data: {
                text: obj.word
            },
            headers: { "Content-Type": "multipart/form-data" }
        })
        return functions.success(res, "Duyệt thành công");
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

exports.TuchoiDexuatWordSensitive = async(req, res) => {
    try {
        await DexuatSensitive.deleteOne({ _id: req.body._id });
        return functions.success(res, "Từ chối thành công");
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

exports.GetListWordSensitive = async(req, res) => {
    try {
        let page = req.body.page ? Number(req.body.page) : 1;
        let pageSize = 30;
        let listDexuat = await DexuatSensitive.aggregate([{
                $lookup: {
                    from: 'Users',
                    localField: 'creator',
                    foreignField: 'idQLC',
                    as: 'creator',
                }
            }, {
                $unwind: '$creator'
            },
            {
                $match: {
                    "creator.type": { $ne: 1 }
                }
            },
            {
                $skip: (page - 1) * pageSize
            }, {
                $limit: pageSize
            }, {
                $project: {
                    "creator.password": 0
                }
            }
        ])
        return res.json({
            data: {
                result: true,
                listDexuat
            }
        });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}