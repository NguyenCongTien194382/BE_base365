const functions = require('../../../services/functions')
const LoaiCauHoi = require('../../../models/DanhGiaNangLuc/LoaiCauHoi')
const Users = require('../../../models/Users')

exports.listTypeQues = async (req,res,next) =>{
    try{
        
        const result ={hienThi: 5, skipped:0}
        const id= Number(req.body.id)
        const hienThi = Number(req.body.hienThi)
        const skipped = Number(req.body.skipped)
        
        
        // phan trang 
        if(hienThi)result.hienThi =hienThi
        if(skipped)result.skipped =Number(skipped) * Number(result.hienThi)
       
        
        const filter = {trangthai_xoa:1}
        if(id) filter.id =id
        /// lay id cong ty
            const type = req.user.data.type


        if (type === 1) {
            filter.id_congty = req.user.data.idQLC
        }
        else {
            filter.id_congty = req.user.data.com_id
            
        }
        const option = [
            'id',
            'ten_loai',
            'nguoitao',
            'created_at',
            'ghichu'
        ]
        
        // loc theo search lay cac ban ghi moi nhat
        // result.tada = await LoaiCauHoi.find(filter,option).sort({created_at: -1}).skip(scrpitQery.skipped).limit(scrpitQery.hienThi)
        // result.NameQues = await LoaiCauHoi.find(filter,{'id':1,'ten_loai':1}).sort({id: -1})
        result.arrayResult = await LoaiCauHoi.aggregate(
            [
                {
                    $match:filter
                },
                { $sort :{ created_at : -1 }},
                { $skip: result.skipped}, {$limit : result.hienThi},
                {
                    $lookup:{
                        from:'Users',
                        let:{nguoitao:'$nguoitao'},
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                        $and:[{ $eq:['$idQLC','$$nguoitao']}]
                                    }
                                }
                            },{
                                $project:{
                                    idQLC: 1,
                                    userName :1
                                }
                            }
                        ], as: 'Name'
                    }
                },
                { $unwind:'$Name'},
                {
                    $project:{
                        id:1,
                        ten_loai: 1,
                        nguoitao: 1,
                        created_at :1,
                        ghichu : 1,
                        Name:1
                    }
                }
            ],
            
        )
        
        if(result.arrayResult) {
            // dem ban ghi 
            const countItem = await LoaiCauHoi.find(filter,option).countDocuments()
            if(countItem) result.countItem=countItem
        }
        
        return functions.success(res,'sucessfully',{
            data: result
        })
    }
    catch(error){
        console.log(error)
        return functions.setError(res,'internall server', 500)
    }
}

// xoa 
exports.deleteItem = async (req,res,next) =>{
    try{
        const result ={}

        const id = req.body.id
        
        // detail
        const deleteresult = await LoaiCauHoi.updateOne({id},{trangthai_xoa: 2},{
            new:true
        })
        if(deleteresult) result.deleteresult = deleteresult
        return functions.success(res,'successfully',{
            data: result
        })

    }
    catch(error){
        return functions.setError(res,'intenalll server')
    }
}
// Them moi 
exports.addItem=  async (req,res,next) =>{
    try{
        //Guarding clause
        // if (!req.user || !req.user.data || !req.user.data.idQLC)
        //     return functions.setError(res, "Không có thông tin tài khoản", 400);
        // let usc_id = req.user.data.idQLC;
        const result ={}
        const type = req.user.data.type
        const id_congty = type === 1 ? req.user.data.idQLC : req.user.data.com_id
        const nguoitao = req.user.data.idQLC
        const id = await LoaiCauHoi.countDocuments() + 1
        const ten_loai = req.body.ten_loai 
        if(!ten_loai) return functions.setError(res,'Chưa điền tên loại',400)
        const created_at = functions.getTimeNow()
        const updated_at = null
        const ghichu = req.body.ghichu
        const trangthai_xoa =1
        if(ten_loai){
            const filter ={
                id,
                ten_loai,
                nguoitao,
                id_congty,
                created_at,
                updated_at,
                trangthai_xoa,
                ghichu
    
            }
            const array =await(
                new LoaiCauHoi(filter)
            ).save()
            return functions.success(res,'successfully',{data:array})
        }
        return functions.setError(res,'error input',400)
    }
    catch(error){
        return functions.setError(res,'Internal server',500)
    }
}

// Chinh sua

exports.changeItem = async (req,res,next) =>{
    try{
        const result = {}
        const id= req.body.id
        const ten_loai = req.body.ten_loai
        if(!ten_loai) return functions.setError(res,'Chưa điền tên loại câu hỏi',400)
        const ghichu = req.body.ghichu
        if(!ghichu) return functions.setError(res,'Chưa điền ghi chú',400)
        const updated_at = functions.getTimeNow()
        
        if(ten_loai)
        {
            const item = await LoaiCauHoi.updateOne({id},{ten_loai,ghichu,updated_at})
            return functions.success(res,'successfully',{data:item})
        }

        return functions.setError(res,'error input',400) 
    }
    catch(error){
        console.log(error)
        return functions.setError(res,'Iternal server',500)
    }
}
// lay chi tiet 1 cau hoi
exports.searchLoai  = async (req,res,next) =>{
    try{
        const filter= {trangthai_xoa : 1}
        const id = req.body.id
        if(id) filter.id = id
        const option = [
            'id',
            'ten_loai',
            'ghichu'
        ]
        const result = await LoaiCauHoi.findOne(filter,option)
        return functions.success(res,'successfully',{data: result})
    }
    catch(error){
        return functions.setError(res,'Internal Error',500)
    }
}

exports.getNameList = async (req, res, next) =>{
    try{
        /// lay id cong ty
        const type = req.user.data.type  
        const filter ={}     
        if (type === 1) {
            filter.id_congty = req.user.data.idQLC
        }
        else {
            filter.id_congty = req.user.data.com_id
            
        }
        const NameQues = await LoaiCauHoi.find(filter,{'id':1,'ten_loai':1}).sort({id: -1})
        return functions.success(res,'Successfully',{data : NameQues})
    }
    catch(error){
        console.log(error)
        return functions.setError(res,'Internal Error',500)
    }
}