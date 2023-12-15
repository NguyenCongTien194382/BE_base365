const functions = require('../../../services/functions')
const TblTieuChi = require('../../../models/DanhGiaNangLuc/TblTieuChi')
const DeDanhGia = require('../../../models/DanhGiaNangLuc/DeDanhGia')
const TblThangDiem = require('../../../models/DanhGiaNangLuc/TblThangDiem')
const Tool = require('../CaiDat/Tool')

// them moi de danh gia
exports.addDe = async (req, res, next) => {
    try {
        const type = req.user.data.type

        const tokenData = { id_congty: 0 }; // Define usc_id as needed
        if (type === 1) {
            tokenData.id_congty = req.user.data.idQLC
        }
        else {
            tokenData.id_congty = req.user.data.com_id
        }
        //Guarding clause
        // if (!req.user || !req.user.data || !req.user.data.idQLC)
        //     return functions.setError(res, "Không có thông tin tài khoản", 400);
        // let usc_id = req.user.data.idQLC;
        const now = functions.getTimeNow()
        const dg_capnhat = functions.convertDate(now)
        let dg_id = Number(await DeDanhGia.countDocuments()) + 1
        let dg_ten = req.body.dg_ten
        if (!dg_ten) return functions.setError(res, 'Chưa điền tên đề đánh giá.',400)
        let dg_nguoitao = req.user.data.idQLC
        const dg_ngaytao = now
        let dg_thangdiem_id = req.body.dg_thangdiem_id
        let dg_ghichu = req.body.dg_ghichu

        /// xet phan loai mac dinh 
        var dg_loai_macdinh = req.body.dg_loai_macdinh
        var dg_phanloaikhac = null
        const dg_id_tieuchi = req.body.dg_id_tieuchi
        if (!dg_id_tieuchi) return functions.setError(res, 'Chọn ít nhất 1 tiêu chí.',500)
        const checkThietLap = req.body.checkThietLap
        if (checkThietLap === 2) {
            dg_loai_macdinh = null
            dg_phanloaikhac = req.body.dg_phanloaikhac
            if(Tool.ArrayPhanLoaiCheck(Tool.ArrayPhanLoai(dg_phanloaikhac)) === 1)return functions.setError(res,'Chưa điền phân loại khác.')
        }

        const dataResult = await (new DeDanhGia(
            {
                dg_id,
                dg_ten,
                dg_nguoitao,
                dg_ngaytao,
                dg_thangdiem_id,
                dg_ghichu,
                dg_loai_macdinh,
                dg_phanloaikhac,
                dg_id_tieuchi,
                dg_capnhat,
                id_congty: tokenData.id_congty,
                trangthai_xoa: 1,
            }
        )).save()

        return functions.success(res, 'sucessfully', {
            data: dataResult
        })
    } catch (error) {
        console.log(error)
        return functions.setError(res, 'Them khong thanh cong', 400)
    }
}


/// show danh sach de danh gia nang luc (default 5 latest records) and search
exports.listDeDG = async (req, res, next) => {
    try {
        const type = req.user.data.type
       
        const dg_id = Number(req.body.dg_id)
        const filter = { trangthai_xoa: 1 }
        if (type === 1) {
            filter.id_congty = req.user.data.idQLC
        }
        else {
            filter.id_congty = req.user.data.com_id
            
        }
        const result ={skipped:0}
        result.hienThi = req.body.hienThi ? Number(req.body.hienThi) : 5;
        const skipped = req.body.skipped ? req.body.skipped : 0;
        if (skipped) {
            result.skipped = Number(skipped) * result.hienThi
        }
        if (dg_id) {
            filter.dg_id = dg_id
        }
        const option = [
            'dg_id',
            'dg_ten',
            'dg_nguoitao',
            'dg_capnhat',
            'dg_ghichu'
        ]
       result.countId = await DeDanhGia.countDocuments(filter)
       result.arrayRender = await DeDanhGia.aggregate(
            [
                {
                    $match: filter
                },
                {
                    $skip: result.skipped
                },
                {
                    $limit: result.hienThi
                },
                {
                    $lookup: {
                        from: 'Users',
                        let: { id_nguoi: '$dg_nguoitao' },
                        pipeline: [
                            {
                                $match: {
                                    $expr:{$eq: ['$$id_nguoi', '$idQLC']}
                                }
                                
                            },
                            {
                                $project: {
                                    userName: 1
                                }
                            }
                        ],
                        as: 'userName'
                    }
                },
                {
                    $unwind:'$userName'
                },
                {
                    $project: {
                        dg_id: 1,
                        dg_ten: 1,
                        dg_nguoitao: 1,
                        dg_capnhat: 1,
                        dg_ghichu: 1,
                        userName: 1
                    }
                }
            ]
        )
     
        return functions.success(res, 'sucessfully', {
            data: result
        })
    }
    catch (error) {
        console.log(error)
        return functions.setError(res, 'internall server', 500)
    }
}

// list name thanh search de danh gia theo ten

exports.listNameDe = async (req, res, next) => {
    try {
        const result = {}
        const filter ={trangthai_xoa:1}
        const type = req.user.data.type
        if (type === 1) {
            filter.id_congty = req.user.data.idQLC
        }
        else {
            filter.id_congty = req.user.data.com_id
            
        }
        const option = [
            'dg_id',
            'dg_ten'
        ]
        const nameDeDG = await DeDanhGia.find(filter, option)
        if (nameDeDG) result.nameDeDG = nameDeDG
        return functions.success(res, 'sucessfully', {
            data: result
        })
    }
    catch (error) {
        console.log(error)
        return functions.setError(res, 'internall server', 500)
    }
}

// Chinh sua

exports.changeDeDG = async (req, res, next) => {
    try {
        const id = Number(req.body.id)
        const result = {}
        var dg_nguoitao = 0
        var id_congty = 0
        const type = req.user.data.type
        if (type === 1) {
            id_congty = req.user.data.idQLC
            
        }
        else {
            id_congty = req.user.data.com_id
           
        }
        
        const dg_ten = req.body.dg_ten
        if (!dg_ten) return functions.setError(res, 'Chưa điền tên.')
        const dg_ghichu = req.body.dg_ghichu
        var dg_loai_macdinh = req.body.dg_loai_macdinh
        var dg_phanloaikhac = null
        const dg_id_tieuchi = req.body.dg_id_tieuchi
        if (!dg_id_tieuchi) return functions.setError(res, 'Chọn ít nhất 1 tiêu chí.')
        const checkThietLap = Number(req.body.checkThietLap)
        if (checkThietLap === 2) {
            dg_loai_macdinh = null
            dg_phanloaikhac = req.body.dg_phanloaikhac
            if(Tool.ArrayPhanLoaiCheck(Tool.ArrayPhanLoai(dg_phanloaikhac)) === 1)return functions.setError(res,'Chưa điền phân loại khác.')
        }
        const now = functions.getTimeNow()
        const dg_capnhat = functions.convertDate(now)
        const arrayResult = await DeDanhGia.updateOne({ dg_id: id }, {
            dg_ten,
            dg_ghichu,
            dg_loai_macdinh,
            dg_phanloaikhac,
            dg_id_tieuchi,
            dg_capnhat,
            dg_nguoitao,
            id_congty
        }, {
            new: true
        })
        if (arrayResult) result.arrayResult = arrayResult
        return functions.success(res, 'sucessfully repaired', {
            data: result
        })
    }
    catch (error) {
        console.log(error)
        return functions.setError(res, 'internall server', 500)
    }
}
// chi tiet
exports.desDeDG = async (req, res) => {

    try {
        
        const id = Number(req.params.id)
         
        const type = req.user.data.type
        const id_congty = (type === 1) ? (req.user.data.idQLC) : (req.user.data.com_id)
        const result ={}
        result.ChiTietDe = await DeDanhGia.aggregate([
            {
                $match:{dg_id:id, trangthai_xoa:1,id_congty}
            },
            {
                $lookup:{
                    from:'Users',
                    let:{dg_nguoitao:'$dg_nguoitao'},
                    pipeline:[
                        {
                            $match:{
                                $expr:{
                                    $eq:['$$dg_nguoitao','$idQLC']
                                }
                            }
                        },
                        {
                            $project:{
                                userName:1
                            }
                        }
                    ],
                    as:'userName'

                }
            },
            {
                $unwind:'$userName'
            },
            {
                $project:{
                    dg_id:1,
                    dg_ten:1,
                    dg_nguoitao:1,
                    dg_ngaytao:1,
                    dg_thangdiem_id:1,
                    dg_ghichu:1,
                    dg_id_tieuchi:1,
                    id_tc:{
                        $split:['$dg_id_tieuchi',',']
                    },
                    userName:1
                } 
             },
             
            
        ])
        result.arrayTc = await DeDanhGia.aggregate(
            [
                {
                    $match:{dg_id:id, trangthai_xoa:1,id_congty}
                },
                {
                    $project:{
                        dg_id:1,
                        dg_ten:1,
                        dg_nguoitao:1,
                        dg_ngaytao:1,
                        
                        dg_ghichu:1,
                        dg_id_tieuchi:1,
                         id_tc:{
                             $split:['$dg_id_tieuchi',',']
                         }
                    } 
                 },
                 {
                    $unwind:'$id_tc'
                 },
                {
                    $lookup:{
                        from:'DGNL_TlbTieuChi',
                        let:{ id_tc :{$toDouble:'$id_tc'}, trangthai_xoa:'$trangthai_xoa', id_congty:'$id_congty'},
                        pipeline:[
                            {
                               $match:{
                                    $expr:{
                                        $and:[
                                            {$eq:['$$id_tc','$id']},
                                            {$eq:[1,'$trangthai_xoa']},
                                            {$eq:[id_congty,'$id_congty']},
                                            {$eq:[2,'$tcd_loai']}
                                        ]
                                    }
                               }
                            },
                            {
                                $project:{
                                    id:1,
                                    tcd_ten:1,
                                    tcd_thangdiem:1
                                }
                            }
                        ],
                        as:'tc_data'
                    }
                },
                {
                    $unwind:"$tc_data"
                },
                {
                    $project:{
                        dg_ten:1,
                        dg_nguoitao:1,
                        dg_ngaytao:1,
                        dg_thangdiem_id:1,
                        dg_ghichu:1,
                        
                        id_tc:1,
                         tc_data:1
                    }
                },
                {
                    $group:{
                        _id:'$tc_data',
                    }
                }
               
            ]
        )
        result.totalPoint = await DeDanhGia.aggregate(
            [
                {
                    $match:{dg_id:id, trangthai_xoa:1,id_congty}
                },
                {
                    $project:{
                         id_tc:{
                             $split:['$dg_id_tieuchi',',']
                         }
                    } 
                 },
                 {
                    $unwind:'$id_tc'
                 },
                {
                    $lookup:{
                        from:'DGNL_TlbTieuChi',
                        let:{ id_tc :{$toDouble:'$id_tc'}, trangthai_xoa:'$trangthai_xoa'},
                        pipeline:[
                            {
                               $match:{
                                    $expr:{
                                        $and:[
                                            {$eq:['$$id_tc','$id']},
                                            {$eq:[1,'$trangthai_xoa']}
                                        ]
                                    }
                               }
                            },
                            {
                                $project:{
                                    tcd_thangdiem:1
                                }
                            },
                            {
                                $unwind:'$tcd_thangdiem'
                            },
                        ],
                        as:'tc_data'
                    }
                },
                {
                    $unwind:"$tc_data"
                },
                
                {
                    $group:{
                        _id:'null',
                        tongdiem:{ $sum:'$tc_data.tcd_thangdiem'}
                    }
                },
              
               
            ]
        )
        let data = await Promise.all(
            [result.ChiTietDe,
            result.arrayTc, result.totalPoint]
        )
        result.ChiTietDe = data[0]
        result.arrayTc = data[1]
        result.totalPoint =data[2]
        return functions.success(res, 'Show information', { data: result })
    }
    catch (error){
        console.log(error)
        return functions.setError(res, 'Not Found', 404)
    }
}
//xoa
exports.XoaDe = async (req, res) => {
    try {
        const dg_id = Number(req.body.id)
        const type = req.user.data.type
        const id_congty = (type === 1) ? (req.user.data.idQLC) : (req.user.data.com_id)
        const trangthai_xoa = Number(req.body.trangthai_xoa)
        const deleteItem = await DeDanhGia.updateOne({ dg_id ,id_congty}, { trangthai_xoa }, {
            new: true
        })
        if (!deleteItem) {
            return functions.setError(res, 'Item not found', 500)
        }
        return functions.success(res, 'successfully deleted', {
            data: deleteItem
        })
    }
    catch (error) {
        console.log(error)
        return functions.setError(res, 'Internal Server Error', 500)
    }
}



// lay ra thang diem can set 

exports.ThangDiem = async (req, res, next) => {
    try {
        const type = req.user.data.type
        const thangdiem = req.body.thangdiem
        const tokenData = {id_congty:0}; // Define usc_id as needed
        if(type === 1){
            tokenData.id_congty = req.user.data.idQLC
        }
        else {
            tokenData.id_congty = req.user.data.com_id
        }

        const result =await TblThangDiem.findOne({id_congty: tokenData.id_congty,thangdiem},{id:1, thangdiem:1, phanloai:1})
        var array = []
        if(result.phanloai !== '' && result.phanloai) {array = Tool.ArrayPhanLoai(result.phanloai)}
        
        
        return functions.success(res,'Successfully',{data: array})
    }
    catch (error) {
        console.log(error)
        return functions.setError(res, 'Internal Server', 500)
    }
}