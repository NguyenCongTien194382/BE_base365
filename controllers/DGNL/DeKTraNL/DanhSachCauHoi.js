const functions = require('../../../services/functions')
const DanhSachCH = require('../../../models/DanhGiaNangLuc/DanhSachCauHoi')
const LoaiCauHoi = require('../../../models/DanhGiaNangLuc/LoaiCauHoi')
const Users = require('../../../models/Users')
// filter + render item

exports.listQues = async (req, res, next) => {
    try {
        /// lay id cong ty
        const type = req.user.data.type
        const filter = { trangthai_xoa: 1 }
        if (type === 1) {
            filter.id_congty = req.user.data.idQLC
        }
        else {
            filter.id_congty = req.user.data.com_id
            
        }
        const result = { hienThi: 5, skipped: 0 }
        // req dk filter
        const id = req.body.id
        const loai = req.body.loai
        const hinhthuc = req.body.hinhthuc
        if (id) filter.id = id
        if (loai) filter.loai = loai
        if (hinhthuc) filter.hinhthuc = hinhthuc

        // phan trang
        const hienThi = req.body.hienThi
        const skipped = req.body.skipped
        if (hienThi) result.hienThi = hienThi
        if (skipped) result.skipped = result.hienThi * Number(skipped)

        // dem ban ghi
        const countItem = await DanhSachCH.find(filter).countDocuments()
        if (countItem === 0) return functions.setError(res, 'Not found data', 404)
        // filter render
        const arrayResult = await DanhSachCH.aggregate(
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
                    $lookup:{
                        from:'Users',
                        let:{nguoitao:'$nguoi_capnhat'},
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                        $and:[{$eq:['$idQLC','$$nguoitao']}]
                                    }
                                }
                            },
                            {
                                $project:{
                                    idQLC: 1,
                                    userName: 1
                                }
                            }
                        ], as:'Name'
                    }
                },
                { $unwind:'$Name'},
                {
                    $lookup:{
                        from:'DGNL_LoaiCauHoi',
                        let:{loaiCH:'$loai'},
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                        $and:[{$eq:['$id','$$loaiCH']}]
                                    }
                                }
                            },{
                                $project:{
                                    id:1,
                                    ten_loai:1
                                }
                            }
                        ],as:'LoaiCH'
                    },
                },
                { $unwind:'$LoaiCH'},
                { 
                    $project:{
                        id:1,
                        cauhoi:1,
                        hinhthuc:1,
                        sodiem:1,
                        thoigian_thuchien:1,
                        created_at:1,
                        updated_at:1,
                        Name:1,
                        LoaiCH:1
                    }
                }
            ]
        )


        result.countItem = countItem
        result.arrayResult = arrayResult

        return functions.success(res, 'successfully', { data: result })
    }
    catch (error) {
        console.log(error)
        return functions.setError(res, 'Internal Error', 500)
    }
}

// search theo ten 
exports.searchCH = async (req, res, next) => {
    try {
        const filter = { trangthai_xoa: 1 }
       
        const option = [
            'id',
            'cauhoi'
        ]
   
        const type = req.user.data.type
        if(type === 1){
            filter.id_congty = req.user.data.idQLC
        }
        else{
            filter.id_congty= req.user.data.com_id
            
        }
        const result = await DanhSachCH.find(filter, option)
        return functions.success(res, 'successfully', { data: result })
    }
    catch (error) {
        return functions.setError(res, 'Internal Error', 500)
    }
}

// add Quess

exports.addQues = async (req, res, next) => {
    try {

        const type = req.user.data.type
        const id_congty = (type === 1) ? req.user.data.idQLC : req.user.data.com_id
        const id = await DanhSachCH.countDocuments() + 1

        const cauhoi = req.body.cauhoi
        if (!cauhoi) return functions.setError(res, 'Chưa nhập câu hỏi.', 400)
        const hinhthuc = req.body.hinhthuc

        const loai = req.body.loai
        if (!loai) return functions.setError(res, 'Chưa chọn loại.', 400)

        const sodiem = Number(req.body.sodiem)
        if (!sodiem) return functions.setError(res, 'Chưa nhập số điểm.', 400)

        const thoigian_thuchien = req.body.thoigian_thuchien
        if (!thoigian_thuchien) return functions.setError(res, 'Chưa nhập thời gian thực hiện.', 400)

        const img_cauhoi = req.body.img_cauhoi

        const dap_an = req.body.dap_an
        if (!dap_an) return functions.setError(res, 'Chưa nhập đáp án.', 400)
        const created_at = functions.getTimeNow()

        const filter = {
            id,
            cauhoi,
            hinhthuc,
            loai,
            sodiem,
            thoigian_thuchien,
            img_cauhoi, id_congty,
            dap_an, nguoi_capnhat: req.user.data.idQLC, trangthai_xoa: 1, congty_or_nv: type,
            created_at, updated_at: null
        }
        const addOb = await (
            new DanhSachCH(filter)
        ).save()

        return functions.success(res, 'successfully', { data: addOb })
    }
    catch (error) {
        return functions.setError(res, 'Internal server', 500)
    }
}

// chi tiet cauhoi
exports.detailQues = async (req, res, next) => {
    try {
        const type = req.user.data.type
        const filter = { trangthai_xoa: 1 }
        if (type === 1) {
            filter.id_congty = req.user.data.idQLC
        }
        else {
            filter.id_congty = req.user.data.com_id
            
        }
        const id = req.params.id
        if(id)filter.id = id
        const result ={}
        result.Infor = await DanhSachCH.findOne(filter,{id:1,
                            cauhoi:1,
                            hinhthuc:1,
                            sodiem:1,
                            nguoi_capnhat:1,
                            loai:1,
                            thoigian_thuchien:1,
                            created_at:1,
                            updated_at:1,
                            dap_an:1})
        result.nguoitao = await Users.findOne({idQLC: result.Infor.nguoi_capnhat},{ idQLC:1, userName:1 })
        result.loai = await LoaiCauHoi.findOne({id: result.Infor.loai},{ id:1, ten_loai:1 })
       
        return functions.success(res, 'successfully', { data: result })
    }
    catch (error) {
        console.log(error)
        return functions.setError(res, 'Internal server', 500)
    }
}

// chinh sua danh sach cau hoi 

exports.changeQues = async (req, res, next) => {
    try {
        const result = {}
        const type = req.user.data.type
        if (type === 1) {
            id_congty = req.user.data.idQLC
        }
        else {
            id_congty = req.user.data.com_id
        }
        const id = req.body.id
        if(!id) return functions.setError(res,'Không lấy được id',400)

        const loai = req.body.loai
        if(!loai)return functions.setError(res,'Chưa chọn loại',400)
        const sodiem = req.body.sodiem
        if(!sodiem)return functions.setError(res,'Chưa nhập số điểm',400)
        const thoigian_thuchien = req.body.thoigian_thuchien
        if(!thoigian_thuchien)return functions.setError(res,'Chưa nhập thời gian thực hiện',400)
        const cauhoi = req.body.cauhoi
        if(!cauhoi)return functions.setError(res,'Chưa nhập câu hỏi',400)
        const dap_an = req.body.dap_an
        if(!dap_an)return functions.setError(res,'Chưa nhập đáp án',400)
        const img_cauhoi = req.body.img_cauhoi
        const updated_at = functions.getTimeNow()

       
        const filter = {
            loai,
            sodiem,
            thoigian_thuchien,
            cauhoi,
            dap_an, img_cauhoi,
            updated_at
        }
        result.arrayResult = await DanhSachCH.updateOne({ id, id_congty }, filter, {
            new: true
        })
        return functions.success(res, 'successfully', {
            data: result
        })
    }
    catch (error) {
        console.log(error)
        return functions.setError(res, 'Internal server', 500)
    }
}
// xoas du lieu
exports.deleteQues = async (req, res, next) => {
    try {
        const result = {}
        const id = req.body.id
        const type = req.user.data.type
        if (type === 1) {
            id_congty = req.user.data.idQLC
        }
        else {
            id_congty = req.user.data.com_id  
        }
        result.arrayResult = await DanhSachCH.updateOne({ id, id_congty }, { trangthai_xoa: 2 }, {
            new: true
        })
        return functions.success(res, 'successfully', {
            data: result
        })
    }
    catch (error) {
        return functions.setError(res, 'Internal error', 500)
    }
}

/// api luu anh vao storage

exports.uploadMutiple = async (req, res, next) => {
    const { files } = req;
    if (!files || files.length === 0) {
        return res.status(400).send('No files uploaded.');
    }
    return res.send('Files uploaded successfully.');
}

exports.tenLoaiCauHoi = async (req, res, next) => {
    try {
        const filter = { trangthai_xoa: 1 }
        /// lay id cong ty
        const type = req.user.data.type


        if (type === 1) {
            filter.id_congty = req.user.data.idQLC
        }
        else {
            filter.id_congty = req.user.data.com_id
            filter.nguoitao = req.user.data.idQLC
        }
        const option = [
            'id',
            'ten_loai',
        ]

        // loc theo search lay cac ban ghi moi nhat
        const tada = await LoaiCauHoi.find(filter,option)
        return functions.success(res,'Successfully',{data : tada})
    }
    catch (error) {
        console.log(error)
        return functions.setError(res, 'internall server', 500)
    }
}


exports.DsTracnghiem = async(req,res,next) =>{
    try{
        const type = req.user.data.type
        const filter= {
            trangthai_xoa : 1,
            hinhthuc:2
        }
        if(type === 1){
            filter.id_congty = req.user.data.idQLC
        }
        else{
            filter.id_congty = req.user.data.com_id
            
        }
        const result = await DanhSachCH.aggregate(
            [
                {
                    $match: filter
                },
                {
                    $project:{
                        id:1,
                        cauhoi:1,
                        sodiem:1,
                        checked:'0'
                    }
                }
            ]
        )
       
        return functions.success(res,'Successfully', {data : result})
    }
    catch(error){
        console.log(error)
        return functions.setError(res,"Internal server",500)
    }
}

exports.DsTuluan = async(req,res,next) =>{
    try{
        const type = req.user.data.type
        const filter= {
            trangthai_xoa : 1,
            hinhthuc:1
        }
        if(type === 1){
            filter.id_congty = req.user.data.idQLC
        }
        else{
            filter.id_congty = req.user.data.com_id
            
        }
        const result = await DanhSachCH.aggregate(
            [
                {
                    $match: filter
                },
                {
                    $project:{
                        id:1,
                        cauhoi:1,
                        sodiem:1,
                        checked:'0'
                    }
                }
            ]
        )
       
        return functions.success(res,'Successfully', {data : result})
    }
    catch(error){
        console.log(error)
        return functions.setError(res,"Internal server",500)
    }
}

// exports.DsTracnghiemRender = async(req,res,next) =>{
//     try{
//         const type = req.user.data.type
//         const filter= {
//             trangthai_xoa : 1,
//             hinhthuc:2
//         }
//         if(type === 1){
//             filter.id_congty = req.user.data.idQLC
//         }
//         else{
//             filter.id_congty = req.user.data.com_id
//             filter.nguoi_capnhat = req.user.data.idQLC
//         }
//         const id=  req.body.id
//         var check = 10 
//         if(id) {filter.id = id, check = 0}
//         const result = await DanhSachCH.find(filter,{id:1, cauhoi:1, sodiem:1}).limit(check)
        
//         return functions.success(res,'Successfully', {data : result})
//     }
//     catch(error){

//         return functions.setError(res,"Internal server",500)
//     }
// }