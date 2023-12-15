const fnc = require("../../services/GiaSu/functions")
const functions = require("../../services/functions")
const Users = require("../../models/Users")
const City = require("../../models/City")
const District = require("../../models/District")
const AdminUser = require("../../models/GiaSu/AdminUser")
const AdminUserRight = require("../../models/GiaSu/AdminUserRight")
const Modules = require("../../models/GiaSu/Modules")
const md5 = require('md5')
const NotCompleteProfile = require("../../models/GiaSu/NotCompleteProfile")
const PostFindTutor = require("../../models/GiaSu/PostFindTutor")
const AllSubject = require("../../models/GiaSu/AllSubject")
const ListSearch = require("../../models/GiaSu/ListSearch")
const NewDistrict = require("../../models/GiaSu/NewDistrict")
const NewTeacherCity = require("../../models/GiaSu/NewTeacherCity")
const NewTagsGS = require("../../models/GiaSu/NewTagsGS")
const NewLevelClass = require("../../models/GiaSu/NewLevelClass")
const NewTeacherSubject = require("../../models/GiaSu/NewTeacherSubject")
const NewHome = require("../../models/GiaSu/NewHome")
const NewParentTeacher = require("../../models/GiaSu/NewParentTeacher")

//thêm nhà quản trị
exports.add_user_admin = async (req, res) =>{
    try{
        const name = req.body.name;
        const userName = req.body.userName;
        const phone = req.body.phone;
        const password = req.body.password;
        const email = req.body.email;
        const modul = req.body.modul;
   
        if(name &&password &&email ){
            const checkName = await AdminUser.findOne({
                adm_loginname : userName
            }).lean()
            if(!checkName){
                const max = await functions.getMaxIdByField(AdminUser,"adm_id")

                const insert = new AdminUser({
                    adm_id : max,
                    adm_loginname : userName,
                    adm_password : md5(password),
                    adm_email : email,
                    adm_phone : phone,
                    adm_name : name,
                })
                await insert.save() 
                
                const maxPermis = await functions.getMaxIdByField(AdminUserRight,"adu_admin_id")
                const insertPermis = new AdminUserRight({
                    adu_admin_id : max ,
                    adu_admin_module_id : modul ,
                    adu_add : 0 ,
                    adu_edit : 0 ,
                })
                  await insertPermis.save() 
            
                return functions.success(res, "Thêm tài khoản thành công")
            }
            return functions.setError(res,"Tên đăng nhập đã tồn tại")
        }
        return functions.setError(res,"Nhập thiếu trường")
    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}
exports.edit_user_admin = async (req, res) =>{
    try{
        const idAdmin = req.body.idAdmin;
        const name = req.body.name;
        const userName = req.body.userName;
        const phone = req.body.phone;
        const password = req.body.password;
        const email = req.body.email;
        const modul = req.body.modul;
   
        if(idAdmin){
            const checkName = await AdminUser.findOne({
                adm_id : idAdmin
            }).lean()
            if(checkName){

                await AdminUser.updateOne({
                    adm_id : idAdmin,
                },{
                    adm_loginname : userName,
                    adm_password : md5(password),
                    adm_email : email,
                    adm_phone : phone,
                    adm_name : name,
                })

                if(modul){
                    await AdminUserRight.updateOne({
                        adu_admin_id : idAdmin ,
                    },{
                        adu_admin_module_id : modul ,
                        adu_add : 0 ,
                        adu_edit : 0 ,
                    })
                }
            
                return functions.success(res, "Sửa tài khoản thành công")
            }
            return functions.setError(res,"Tài khoản không tồn tại")
        }
        return functions.setError(res,"Nhập thiếu trường")
    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}

//danh sách tên quyền
exports.list_Modules = async (req, res) =>{
    try{
        const [result , count] = await Promise.all([
            Modules.find({
                $or : [
                    {
                        mod_id : {$ne : 11}
                    },{
                        mod_id : {$ne : 12}
                    }
                ]
            }).select("mod_id mod_name").lean(),
            Modules.countDocuments({
                $or : [
                    {
                        mod_id : {$ne : 11}
                    },{
                        mod_id : {$ne : 12}
                    }
                ]
            })
        ])
            return functions.success(res , "lấy thành công" ,{result, count})

    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}

//thêm 
exports.add_Modules = async (req, res) =>{
    try{
        const mod_name = req.body.mod_name;
        const mod_path = req.body.mod_path;
        const mod_listname = req.body.mod_listname;
        const mod_listfile = req.body.mod_listfile;
        const mod_order = req.body.mod_order;
        const mod_help = req.body.mod_help;
        const lang_id = req.body.lang_id;
        const mod_checkloca = req.body.mod_checkloca;

        const max = await functions.getMaxIdByField(Modules,"mod_id")
                const insertPermis = new Modules({
                    mod_id : max ,
                    mod_name : mod_name ,
                    mod_path : mod_path ,
                    mod_listname : mod_listname ,
                    mod_listfile : mod_listfile ,
                    mod_order : mod_order ,
                    mod_help : mod_help ,
                    lang_id : lang_id ,
                    mod_checkloca : mod_checkloca ,
                })
                  await insertPermis.save() 
            
                return functions.success(res, "Thêm Module thành công")

    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}
//danh sách nhà quản trị
exports.list_user_admin = async (req, res) =>{
    try{
        let page = Number(req.body.page)|| 1;
        let pageSize = Number(req.body.pageSize)|| 10;
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        const result = await AdminUser.aggregate([
            {$match : {adm_isadmin : {$ne : 1}}},
            {$sort : {adm_id : -1}},
            {$lookup :{
                from : "GS_admin_user_right",
                localField : "adm_id",
                foreignField : "adu_admin_id",
                as : "SJ"
            }},
            {$unwind : {path : "$SJ" , preserveNullAndEmptyArrays : true} },
            {$project : {
                adm_id : 1 ,
                adm_loginname : 1 ,
                adm_email : 1 ,
                adm_name : 1 ,
                adm_phone : 1 ,
                "arr_Quyen" : "$SJ.adu_admin_module_id" ,
            }},
            {
                $facet: {
                  paginatedResults: [{ $skip: skip }, { $limit: limit }],
                  totalCount: [
                    { 
                      $count: 'count'
                    }
                  ]
                }
              }
        ])
        let data = {}
        let totalCount = {}
        if (result[0].totalCount.length > 0) {
        data = result[0].paginatedResults;
        totalCount = result[0].totalCount[0].count;
        await Promise.all(data.map(async (element) => {
            //Xử lí tên quyền
				if (element.arr_Quyen != '' && element.arr_Quyen != null && element.arr_Quyen != 0) {
					let array_name_permiss =
						typeof element.arr_Quyen == 'string'
							? element.arr_Quyen.split(',')
							: element.arr_Quyen;
                        for (let t = 0; t < array_name_permiss.length; t++) {
                        let newFor = array_name_permiss[t]
                        let array = newFor.split(',')
                        for (let r = 0; r < array.length; r++) {
                            let cit = await Modules.findOne({ mod_id: Number(array[r]) }).select("mod_name").lean()
                            if (cit) array[r] = cit.mod_name
                        }
                        array_name_permiss[t] = array
                    
					}
					element.new_name_permiss = array_name_permiss.toString();
				} else {
					element.new_name_permiss = "Chưa cập nhật"
				}
        }))
        }
        return functions.success(res , "lấy thành công" ,{data, totalCount})


    }catch(e){ 
        console.log(e)
        return functions.setError(res, e.message )
    }
}

//thêm môn học
exports.add_subject = async (req, res) =>{
    try{
        const monhoc = req.body.monhoc
        if(monhoc){
            const check = await AllSubject.findOne({
                as_name : monhoc
                }).lean()
                if(!check){
                    let alias = ""
                    if(monhoc) alias = fnc.renderAlias(monhoc)
                const max = await functions.getMaxIdByField(AllSubject,"as_id")
                    let insert = new AllSubject({
                        as_id : max ,
                        as_name : monhoc ,
                        as_alias : alias ,
                    })
                    await insert.save()
                    return functions.success(res , "Tạo thành công" ,{insert})
                }
                return functions.setError(res, "Tên đã tồn tại" )
            }
            return functions.setError(res, "Nhập thiếu trường" )

    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}

//Sửa môn học
exports.edit_subject = async (req, res) =>{
    try{
        const id = req.body.id
        const monhoc = req.body.monhoc
        const activeClass = req.body.activeClass
        const activeTeach = req.body.activeTeach
        if(monhoc&&id){
            const check = await AllSubject.findOne({
                as_id : Number(id)
                }).lean()
                if(check){
                    //xử lí alias
                    let alias = ""
                    if(monhoc) alias = fnc.renderAlias(monhoc)
                    //update
                    await AllSubject.updateOne({
                        as_id : Number(id) ,
                    },{
                        as_name : monhoc ,
                        as_alias : alias ,
                        active_class : activeClass ? 1 : 0 ,
                        active_teach : activeTeach ? 1 : 0 ,

                    })
               
                    return functions.success(res , "Sửa thành công" )
                }
                return functions.setError(res, "Môn học không tồn tại" )
            }
            return functions.setError(res, "Nhập thiếu trường" )

    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}

//danh sách môn học
exports.list_subject = async (req, res) =>{
    try{
        const id = req.body.id
    
        let cond = {}
        if(id) cond.as_id = Number(id)
            const [result , count] = await Promise.all([
                AllSubject.find(cond).sort({as_id : -1}).lean(),
                AllSubject.countDocuments(cond)
            ])
                return functions.success(res , "lấy thành công" ,{result, count})

    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}

// danh sách phụ huynh
exports.ListParent = async (req, res) =>{
    try{
        const mail = req.body.mail
        const name = req.body.name
        const phone = req.body.phone
        const idGiaSu = req.body.MaPH
        const City = req.body.City
        const sourse = req.body.sourse
        const date = req.body.date
        
        let cond = {}
        cond["inforGiaSu.ugs_ft"] = 2
        if(mail) cond.email =  {$regex : mail, $options: 'i'}
        if(name) cond.userName =  {$regex : name, $options: 'i'}
        if(phone) cond.phoneTK =  {$regex : phone, $options: 'i'}
        if(idGiaSu) cond.idGiaSu =  Number(idGiaSu)
        if(City) cond.city =  Number(City)
        if(sourse) cond.fromWeb =  {$regex : sourse, $options: 'i'}
        if(date) cond["inforGiaSu.check_date"] =  date
        const [result , count] = await Promise.all([
            Users.find(cond).select("idGiaSu userName phoneTK phone emailContact email password address createdAt authentic fromWeb").sort({idGiaSu : -1}),
            Users.countDocuments(cond)
        ])
            return functions.success(res , "lấy thành công" ,{result, count})
    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}

//danh sách PH chưa đăng tin
exports.ListParentHaveNoPost = async (req, res) =>{
    try{
        const keyWord = req.body.keyWord

        const City = req.body.City
        
        let cond = {}
        cond["inforGiaSu.ugs_ft"] = 2 // type : PH
        cond["inforGiaSu.check_index"] = 0 // khi đăng bài , sẽ update check_index = 1
        if(keyWord) cond["$or"] = [
            { "email" : {$regex : keyWord, $options: 'i'}},
            { "userName" : {$regex : keyWord, $options: 'i'}},
            { "phoneTK" : {$regex : keyWord, $options: 'i'}},
        ]
        if(City) cond.city =  Number(City)

        const [result , count] = await Promise.all([
            Users.find(cond).select("idGiaSu userName phoneTK phone emailContact email address createdAt updatedAt avatarUser authentic fromWeb").sort({ updatedAt : -1 , idGiaSu : -1}),
            Users.countDocuments(cond)
        ])
        if(result.length > 0){
            for (let i = 0; i < result.length; i++) {
                //ghép link avatar
                result[i].avatarUser = fnc.createLinkFile("PH", result[i].updatedAt, result[i].avatarUser);
            }
        }
            return functions.success(res , "lấy thành công" ,{result, count})
    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}

//danh sách lop hoc
exports.ListClass = async (req, res) =>{
    try{
        let page = Number(req.body.page)|| 1;
        let pageSize = Number(req.body.pageSize)|| 10;
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        const keyWord = req.body.keyWord

        const City = req.body.City
        
        let cond = {}
        if(keyWord) cond["$or"] = [
            { "email" : {$regex : keyWord, $options: 'i'}},
            { "userName" : {$regex : keyWord, $options: 'i'}},
            { "phoneTK" : {$regex : keyWord, $options: 'i'}},
        ]
        if(City) cond.city =  Number(City)

        let result = await PostFindTutor.aggregate([
            { $sort: {pft_id : -1}},
            {$lookup : {
                from : "Users",
                localField : "ugs_id",
                foreignField : "idGiaSu",
                as : "infoUsers"
            }},
            {$unwind : {path : "$infoUsers" , preserveNullAndEmptyArrays : true} },
            { $match: cond },
            {$project : {
                ugs_id : 1,
                "id_lop" : "$pft_id",
                "title" : "$pft_summary",
                alias: 1,
                day_post: 1,
                "pft_form" : "$pft_form",
                "userName" : "$infoUsers.userName" ,
                "idPhuHuynh" : "$infoUsers.idGiaSu" ,
                "avatarUser" : "$infoUsers.avatarUser" ,
                "email" : "$infoUsers.email" ,
                "phoneTK" : "$infoUsers.phoneTK" ,
                "address" : "$infoUsers.address" ,
            }},
            {
                $facet: {
                  paginatedResults: [{ $skip: skip }, { $limit: limit }],
                  totalCount: [
                    {
                      $count: 'count'
                    }
                  ]
                }
              }

        ])
        let data = {}
        let totalCount = {}
        if (result[0].totalCount.length > 0) {
        data = result[0].paginatedResults;
        totalCount = result[0].totalCount[0].count;
        for (let i = 0; i < data.length; i++) {
            //ghép link avatar
            data[i].avatarUser = await fnc.createLinkFile("PH", data[i].updatedAt, data[i].avatarUser);
            // chuyển đổi dạng date
            if(data[i].day_post) data[i].day_post = new Date(data[i].day_post * 1000)
            // xử lý trạng thái 
            if(data[i].pft_form == 1) data[i].Hinhthucday =  "Gặp mặt"
            else data[i].Hinhthucday =  "Online"
            }
        }
        return functions.success(res , "lấy thành công" ,{data, totalCount})
    
    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}

//danh sách gia sư
exports.ListTeach = async (req, res) =>{
    try{
        const mail = req.body.mail
        const name = req.body.name
        const phone = req.body.phone
        const idGiaSu = req.body.MaPH
        const City = req.body.City
        const sourse = req.body.sourse
        const date = req.body.date
        
        let cond = {}
        cond["inforGiaSu.ugs_ft"] = 1
        if(mail) cond.email =  {$regex : mail, $options: 'i'}
        if(name) cond.userName =  {$regex : name, $options: 'i'}
        if(phone) cond.phoneTK =  {$regex : phone, $options: 'i'}
        if(idGiaSu) cond.idGiaSu =  Number(idGiaSu)
        if(City) cond.city =  Number(City)
        if(sourse) cond.fromWeb =  {$regex : sourse, $options: 'i'}
        if(date) cond["inforGiaSu.check_date"] = date
        const [result , count] = await Promise.all([
            Users.find(cond).select("idGiaSu userName phoneTK phone emailContact email password address createdAt authentic fromWeb").sort({idGiaSu : -1}),
            Users.countDocuments(cond)
        ])
            return functions.success(res , "lấy thành công" ,{result, count})
    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}
//gia sư cập nhật gần nhất
exports.ListTeachRecentUpdate = async (req, res) =>{
    try{
        const keyWord = req.body.keyWord

        const City = req.body.City
        
        let cond = {}
        cond["inforGiaSu.ugs_ft"] = 1
        if(keyWord) cond["$or"] = [
            { "email" : {$regex : keyWord, $options: 'i'}},
            { "userName" : {$regex : keyWord, $options: 'i'}},
            { "phoneTK" : {$regex : keyWord, $options: 'i'}},
        ]
        if(City) cond.city =  Number(City)

        const [result , count] = await Promise.all([
            Users.find(cond).select("idGiaSu userName phoneTK phone emailContact email address createdAt updatedAt avatarUser authentic fromWeb").sort({ updatedAt : -1 , idGiaSu : -1}),
            Users.countDocuments(cond)
        ])
        if(result.length > 0){
            for (let i = 0; i < result.length; i++) {
                //ghép link avatar
                result[i].avatarUser = fnc.createLinkFile("GS", result[i].updatedAt, result[i].avatarUser);
            }
        }
            return functions.success(res , "lấy thành công" ,{result, count})
    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}
exports.ListParentNotComplete = async (req, res) =>{
    try{
        const sourse = req.body.sourse
        const date = req.body.date
        let cond = {}
        cond["user_type"] = 2
        if(sourse) cond.fromWeb =  {$regex : sourse, $options: 'i'}
        if(date) cond.created_at = date
        const [result , count] = await Promise.all([
            NotCompleteProfile.find(cond).select("profile_id user_name user_phone user_email user_address ugs_gender ugs_brithday created_at user_type source").sort({profile_id : -1}),
            NotCompleteProfile.countDocuments(cond)
        ])
            return functions.success(res , "lấy thành công" ,{result, count})
    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}
exports.ListTeachNotComplete = async (req, res) =>{
    try{
        const sourse = req.body.sourse
        const date = req.body.date
        let cond = {}
        cond["user_type"] = 1
        if(sourse) cond.fromWeb =  {$regex : sourse, $options: 'i'}
        if(date) cond.created_at = date
        const [result , count] = await Promise.all([
            NotCompleteProfile.find(cond).select("profile_id user_name user_phone user_email user_address ugs_gender ugs_brithday created_at user_type source").sort({profile_id : -1}),
            NotCompleteProfile.countDocuments(cond)
        ])
            return functions.success(res , "lấy thành công" ,{result, count})
    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}
//thêm tag
exports.list_add_tags = async (req, res) =>{
    try{
        const id_mon = req.body.id_mon
        const name_tag = req.body.name_tag
        if(name_tag){
            const check = await AllSubject.findOne({
                as_name : name_tag
                }).lean()
                if(!check){
                    let alias = ""
                    if(name_tag) alias = fnc.renderAlias(name_tag)
                    if(!id_mon) id_mon = 0

                const max = await functions.getMaxIdByField(AllSubject,"as_id")
                let insert = new AllSubject({
                    as_id : max ,
                    as_name : name_tag ,
                    as_alias : alias ,
                    as_parent : Number(id_mon) ,
                })
                await insert.save()
                
                const ls_name_gs = 'gia sư ' + name_tag
                const ls_name_lop = 'Tìm lớp gia sư ' + name_tag

                const maxLS = await functions.getMaxIdByField(ListSearch,"ls_id")

                let id_parent1 = new ListSearch({
                    ls_id : maxLS ,
                    ls_name : ls_name_gs ,
                    type : 1 ,
                    ls_cate : max ,
                    js_parent : 0 ,
                })
                await id_parent1.save()

                let id_parent2 = new ListSearch({
                    ls_id : maxLS + 1,
                    ls_name : ls_name_lop ,
                    type : 2 ,
                    ls_cate : max ,
                    js_parent : 1 ,
                })
                await id_parent2.save()

                await AllSubject.updateOne({
                    as_id : Number(max) ,
                },{
                    ls_parent1 : maxLS ,
                    ls_parent2 : maxLS + 1 ,
                })
                    return functions.success(res , "Tạo thành công" )
                }
                return functions.setError(res, "Tên đã tồn tại" )
            }
            return functions.setError(res, "Nhập thiếu trường" )

    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}

//thêm bài viết quận huyện
exports.list_add_post_gsDistrict = async (req, res) =>{
    try{
        const city = req.body.city
        const district = req.body.district
        const content = req.body.content
        const suggest_title = req.body.suggest_title
        const suggest_content = req.body.suggest_content
        const save_after = req.body.save_after
        if(city&&district){
            const check = await NewDistrict.findOne({
                dis_parent : Number(city),
                dist_id : Number(district),
                }).lean()
                if(!check){
                    const max = await functions.getMaxIdByField(NewDistrict,"new_id")
                    let insert = new NewDistrict({
                        new_id : max ,
                        dis_parent : Number(city),
                        dist_id : Number(district),
                        content : content,
                        title_suggest : suggest_title,
                        content_suggest : suggest_content,
                        type : 1,
                    })
                    await insert.save()
                    return functions.success(res , "Tạo thành công" ,{insert})
                }
                return functions.setError(res, "Đã có bài viết tại quận huyện này!" )
            }
            return functions.setError(res, "Nhập thiếu trường" )

    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}
exports.edit_post_gsDistrict = async (req, res) =>{
    try{
        const id = req.body.id
        const city = req.body.city
        const district = req.body.district
        const content = req.body.content
        const suggest_title = req.body.suggest_title
        const suggest_content = req.body.suggest_content
        const save_after = req.body.save_after
        if(id){
            const check = await NewDistrict.findOne({
                new_id : Number(id),
                }).lean()
                if(check){
                    
                    let insert = await NewDistrict.updateOne({
                        new_id : Number(id) ,
                    },{
                        dis_parent : Number(city),
                        dist_id : Number(district),
                        content : content,
                        title_suggest : suggest_title,
                        content_suggest : suggest_content,
                        type : 1,
                    })
                   
                    return functions.success(res , "Sửa thành công" ,{insert})
                }
                return functions.setError(res, "Không có bài viết tại quận huyện này!" )
            }
            return functions.setError(res, "Nhập thiếu trường" )

    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}

//danh sách bài viết quận huyện
exports.list_post_gsDistrict = async (req, res) =>{
    try{
        const id = req.body.id
        let page = Number(req.body.page)|| 1;
        let pageSize = Number(req.body.pageSize)|| 10;
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        let cond = {}
        if(id) cond.dist_id = Number(id)
            const result = await NewDistrict.aggregate([
                    {$match : cond},
                    {$sort : {new_id : -1}},
                    {$lookup :{
                        from : "District",
                        localField : "dist_id",
                        foreignField : "_id",
                        as : "QH"
                    }},
                    {$unwind : {path : "$QH" , preserveNullAndEmptyArrays : true} },
                    {$project : {
                        "id" : "$QH._id" ,
                        "tenQH" : "$QH.name" ,
                    }},
                    {
                        $facet: {
                          paginatedResults: [{ $skip: skip }, { $limit: limit }],
                          totalCount: [
                            {
                              $count: 'count'
                            }
                          ]
                        }
                      }
                ])
                let data = {}
                let totalCount = {}
                if (result[0].totalCount.length > 0) {
                data = result[0].paginatedResults;
                totalCount = result[0].totalCount[0].count;
                }
                return functions.success(res , "lấy thành công" ,{data, totalCount})

    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}

//thêm bài viết tỉnh thành
exports.list_add_post_gsCity = async (req, res) =>{
    try{
        const city = req.body.city
        const district = req.body.district
        const content = req.body.content
        const suggest_title = req.body.suggest_title
        const suggest_content = req.body.suggest_content
        const save_after = req.body.save_after
        if(city){
            const check = await NewTeacherCity.findOne({
                city_id : Number(city),
                }).lean()
                if(!check){
                    const max = await functions.getMaxIdByField(NewTeacherCity,"new_id")
                    let insert = new NewTeacherCity({
                        new_id : max ,
                        city_id : Number(city),
                        content : content,
                        title_suggest : suggest_title,
                        content_suggest : suggest_content,
                        //chưa rõ
                    })
                    await insert.save()
                    return functions.success(res , "Tạo thành công" ,{insert})
                }
                return functions.setError(res, "Đã có bài viết tại tỉnh thành này!" )
            }
            return functions.setError(res, "Nhập thiếu trường" )

    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}

//sửa bài viết tỉnh thành
exports.edit_post_gsCity = async (req, res) =>{
    try{
        const id = req.body.id
        const content = req.body.content
        const suggest_title = req.body.suggest_title
        const suggest_content = req.body.suggest_content
        if(id){
            const check = await NewTeacherCity.findOne({
                new_id : Number(id),
                }).lean()
                if(check){
                    let insert = await NewTeacherCity.updateOne({
                        new_id : Number(id) ,
                    },{
                        content : content,
                        title_suggest : suggest_title,
                        content_suggest : suggest_content,
                    })
                   
                    return functions.success(res , "Sửa thành công" ,{insert})
                }
                return functions.setError(res, "Không có bài viết tại tỉnh thành này!" )
            }
            return functions.setError(res, "Nhập thiếu trường" )

    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}

//danh sách bài viết tỉnh thành
exports.list_post_gsCity = async (req, res) =>{
    try{
        const id = req.body.id
        let page = Number(req.body.page)|| 1;
        let pageSize = Number(req.body.pageSize)|| 10;
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        let cond = {}
        if(id) cond.city_id = Number(id)
            const result = await NewTeacherCity.aggregate([
                    {$match : cond},
                    {$sort : {new_id : -1}},
                    {$lookup :{
                        from : "City",
                        localField : "city_id",
                        foreignField : "_id",
                        as : "city"
                    }},
                    {$unwind : {path : "$city" , preserveNullAndEmptyArrays : true} },
                    {$project : {
                        "id" : "$city._id" ,
                        "tenTP" : "$city.name" ,
                    }},
                    {
                        $facet: {
                          paginatedResults: [{ $skip: skip }, { $limit: limit }],
                          totalCount: [
                            {
                              $count: 'count'
                            }
                          ]
                        }
                      }
                ])
                let data = {}
                let totalCount = {}
                if (result[0].totalCount.length > 0) {
                data = result[0].paginatedResults;
                totalCount = result[0].totalCount[0].count;
                }
                return functions.success(res , "lấy thành công" ,{data, totalCount})

    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}
//thêm bài viết tag
exports.add_post_tag = async (req, res) =>{
    try{
        const tag_id = req.body.tag_id
        const new_type = req.body.new_type
        const content = req.body.content
        const suggest_title = req.body.suggest_title
        const suggest_content = req.body.suggest_content
        if(tag_id&&new_type){
            const check = await NewTagsGS.findOne({
                tag_id : Number(tag_id),
                }).lean()
                if(!check){
                    const max = await functions.getMaxIdByField(NewTagsGS,"new_id")
                    let insert = new NewTagsGS({
                        new_id : max ,
                        tag_id : Number(tag_id),
                        new_type : Number(new_type),
                        content : content,
                        title_suggest : suggest_title,
                        content_suggest : suggest_content,
                        //chưa rõ
                    })
                    await insert.save()
                    return functions.success(res , "Tạo thành công" ,{insert})
                }
                return functions.setError(res, "Đã có bài viết TAG này!" )
            }
            return functions.setError(res, "Nhập thiếu trường" )

    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}

//sửa bài viết TAG
exports.edit_post_tag = async (req, res) =>{
    try{
        const id = req.body.id
        const content = req.body.content
        const suggest_title = req.body.suggest_title
        const suggest_content = req.body.suggest_content
        if(id){
            const check = await NewTagsGS.findOne({
                new_id : Number(id),
                }).lean()
                if(check){
                    let insert = await NewTagsGS.updateOne({
                        new_id : Number(id) ,
                    },{
                        content : content,
                        title_suggest : suggest_title,
                        content_suggest : suggest_content,
                    })
                   
                    return functions.success(res , "Sửa thành công" ,{insert})
                }
                return functions.setError(res, "Không có bài viết tag này!" )
            }
            return functions.setError(res, "Nhập thiếu trường" )

    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}

//danh sách bài viết tag
exports.list_post_tag = async (req, res) =>{
    try{
        const id = req.body.id
        let page = Number(req.body.page)|| 1;
        let pageSize = Number(req.body.pageSize)|| 10;
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        let cond = {}
        if(id) cond.tag_id = Number(id)
            const result = await NewTagsGS.aggregate([
                    {$match : cond},
                    {$sort : {new_id : -1}},
                    {$lookup :{
                        from : "GS_all_subject",
                        localField : "tag_id",
                        foreignField : "as_id",
                        as : "SJ"
                    }},
                    {$unwind : {path : "$SJ" , preserveNullAndEmptyArrays : true} },
                    {$project : {
                        "id" : "$tag_id" ,
                        "tenMonHoc" : "$SJ.as_name" ,
                        "alias" : "$SJ.as_alias" ,
                        "id_loai" : "$new_type" ,
                    }},
                    {
                        $facet: {
                          paginatedResults: [{ $skip: skip }, { $limit: limit }],
                          totalCount: [
                            { 
                              $count: 'count'
                            }
                          ]
                        }
                      }
                ])
                let data = {}
                let totalCount = {}
                if (result[0].totalCount.length > 0) {
                data = result[0].paginatedResults;
                totalCount = result[0].totalCount[0].count;
                for (let i = 0; i < data.length; i++) {
                    // xử lý trạng thái 
                    if(data[i].id_loai == 1) data[i].theLoai =  "Bài viết gia sư"
                    else data[i].theLoai =  "Bài viết lớp học"
                   }
                }
                return functions.success(res , "lấy thành công" ,{data, totalCount})

    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}
//thêm bài viết theo cấp
exports.add_post_level_class = async (req, res) =>{
    try{
        const id_level = req.body.id_level
        const id_type = req.body.id_type
        const content = req.body.content
        const suggest_title = req.body.suggest_title
        const suggest_content = req.body.suggest_content
        if(id_level){
            const check = await NewLevelClass.findOne({
                id_level : Number(id_level),
                }).lean()
                if(!check){
                    const max = await functions.getMaxIdByField(NewLevelClass,"id")
                    let insert = new NewLevelClass({
                        id : max ,
                        id_level : Number(id_level),
                        id_type : id_type ? Number(id_type) : 0,
                        content : content,
                        title_suggest : suggest_title,
                        content_suggest : suggest_content,
                        //chưa rõ
                    })
                    await insert.save()
                    return functions.success(res , "Tạo thành công" ,{insert})
                }
                return functions.setError(res, "Đã có bài viết TAG này!" )
            }
            return functions.setError(res, "Nhập thiếu trường" )

    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}

//sửa bài viết theo cấp
exports.edit_post_level_class = async (req, res) =>{
    try{
        const id = req.body.id
        const content = req.body.content
        const suggest_title = req.body.suggest_title
        const suggest_content = req.body.suggest_content
        if(id){
            const check = await NewLevelClass.findOne({
                id : Number(id),
                }).lean()
                if(check){
                    let insert = await NewLevelClass.updateOne({
                        id : Number(id) ,
                    },{
                        content : content,
                        title_suggest : suggest_title,
                        content_suggest : suggest_content,
                    })
                   
                    return functions.success(res , "Sửa thành công" ,{insert})
                }
                return functions.setError(res, "Không có bài viết theo cấp này!" )
            }
            return functions.setError(res, "Nhập thiếu trường" )

    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}

//danh sách bài viết theo cấp
exports.list_post_level_class = async (req, res) =>{
    try{
        const id = req.body.id
        let page = Number(req.body.page)|| 1;
        let pageSize = Number(req.body.pageSize)|| 10;
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        let cond = {}
        if(id) cond.id_level = Number(id)
            const result = await NewLevelClass.aggregate([
                    {$match : cond},
                    {$sort : {id : -1}},
                    {$lookup :{
                        from : "GS_gs_level_class",
                        localField : "id_level",
                        foreignField : "level_class_id",
                        as : "SJ"
                    }},
                    {$unwind : {path : "$SJ" , preserveNullAndEmptyArrays : true} },
                    {$project : {
                        "id" : "$id_level" ,
                        "capHoc" : "$SJ.slug_class_name" ,
                    }},
                    {
                        $facet: {
                          paginatedResults: [{ $skip: skip }, { $limit: limit }],
                          totalCount: [
                            { 
                              $count: 'count'
                            }
                          ]
                        }
                      }
                ])
                let data = {}
                let totalCount = {}
                if (result[0].totalCount.length > 0) {
                data = result[0].paginatedResults;
                totalCount = result[0].totalCount[0].count;
                }
                return functions.success(res , "lấy thành công" ,{data, totalCount})

    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}
//thêm bài viết theo môn
exports.add_post_subject = async (req, res) =>{
    try{
        const as_id = req.body.as_id
        const content = req.body.content
        const suggest_title = req.body.suggest_title
        const suggest_content = req.body.suggest_content
        if(as_id){
            const check = await NewTeacherSubject.findOne({
                as_id : Number(as_id),
                }).lean()
                if(!check){
                    const max = await functions.getMaxIdByField(NewTeacherSubject,"new_id")
                    let insert = new NewTeacherSubject({
                        new_id : max ,
                        as_id : Number(as_id),
                        content : content,
                        title_suggest : suggest_title,
                        content_suggest : suggest_content,
                        //chưa rõ
                    })
                    await insert.save()
                    return functions.success(res , "Tạo thành công" ,{insert})
                }
                return functions.setError(res, "Đã có bài viết theo môn này!" )
            }
            return functions.setError(res, "Nhập thiếu trường" )

    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}

//sửa bài viết theo môn
exports.edit_post_subject = async (req, res) =>{
    try{
        const id = req.body.id
        const content = req.body.content
        const suggest_title = req.body.suggest_title
        const suggest_content = req.body.suggest_content
        if(id){
            const check = await NewTeacherSubject.findOne({
                new_id : Number(id),
                }).lean()
                if(check){
                    let insert = await NewTeacherSubject.updateOne({
                        new_id : Number(id) ,
                    },{
                        content : content,
                        title_suggest : suggest_title,
                        content_suggest : suggest_content,
                    })
                   
                    return functions.success(res , "Sửa thành công" ,{insert})
                }
                return functions.setError(res, "Không có bài viết theo môn này!" )
            }
            return functions.setError(res, "Nhập thiếu trường" )

    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}

//danh sách bài viết theo môn
exports.list_post_subject = async (req, res) =>{
    try{
        const id = req.body.id
        let page = Number(req.body.page)|| 1;
        let pageSize = Number(req.body.pageSize)|| 10;
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        let cond = {}
        if(id) cond.as_id = Number(id)
            const result = await NewTeacherSubject.aggregate([
                    {$match : cond},
                    {$sort : {new_id : -1}},
                    {$lookup :{
                        from : "GS_all_subject",
                        localField : "as_id",
                        foreignField : "as_id",
                        as : "SJ"
                    }},
                    {$unwind : {path : "$SJ" , preserveNullAndEmptyArrays : true} },
                    {$project : {
                        "id" : "$tag_id" ,
                        "tenMonHoc" : "$SJ.as_name" ,
                        "alias" : "$SJ.as_alias" ,
                    }},
                    {
                        $facet: {
                          paginatedResults: [{ $skip: skip }, { $limit: limit }],
                          totalCount: [
                            { 
                              $count: 'count'
                            }
                          ]
                        }
                      }
                ])
                let data = {}
                let totalCount = {}
                if (result[0].totalCount.length > 0) {
                data = result[0].paginatedResults;
                totalCount = result[0].totalCount[0].count;
                }
                return functions.success(res , "lấy thành công" ,{data, totalCount})

    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}
//thêm bài viết trang chủ
exports.add_new_home = async (req, res) =>{
    try{
        const content = req.body.content
        const suggest_title = req.body.suggest_title
        const suggest_content = req.body.suggest_content
            const check = await NewHome.findOne({
                }).lean()
                if(!check){
                    const max = await functions.getMaxIdByField(NewHome,"new_id")
                    let insert = new NewHome({
                        new_id : max ,
                        content : content,
                        title_suggest : suggest_title,
                        content_suggest : suggest_content,
                        //chưa rõ
                    })
                    await insert.save()
                    return functions.success(res , "Tạo thành công" ,{insert})
                }else{
                    insert = await NewHome.updateOne({
                    },{
                        content : content,
                        title_suggest : suggest_title,
                        content_suggest : suggest_content,
                    })
                    return functions.success(res , "Sửa thành công" ,{insert})
                }

    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}

//xem bài viết trang chủ
exports.list_new_home = async (req, res) =>{
    try{
            const result = await NewHome.findOne({})
            if(result){
                return functions.success(res , "lấy thành công" ,{result})
            }
            return functions.setError(res, "Không có bài viết trang chủ nào!" )

    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}

//thêm bài viết phụ huynh
exports.add_post_parent = async (req, res) =>{
    try{
        const new_id = req.body.new_id
        const content = req.body.content
        const suggest_title = req.body.suggest_title
        const suggest_content = req.body.suggest_content
        if(new_id){
            const check = await NewParentTeacher.findOne({
                new_id : Number(new_id),
                }).lean()
                if(!check){
                    const max = await functions.getMaxIdByField(NewParentTeacher,"new_id")
                    let insert = new NewParentTeacher({
                        new_id : max ,
                        content : content,
                        title_suggest : suggest_title,
                        content_suggest : suggest_content,
                        //chưa rõ
                    })
                    await insert.save()
                    return functions.success(res , "Tạo thành công" ,{insert})
                }else{
                    insert = await NewParentTeacher.updateOne({
                    },{
                        content : content,
                        title_suggest : suggest_title,
                        content_suggest : suggest_content,
                    })
                    return functions.success(res , "Sửa thành công" ,{insert})
                }

        }
        return functions.setError(res, "new_id = 1 : bài viết PH ; new_id = 2 : bài viết GS !" )


    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}

//xem bài viết phụ huynh
exports.list_post_parent = async (req, res) =>{
    try{
            const new_id = req.body.new_id
            if(new_id){
            const result = await NewParentTeacher.findOne({new_id : Number(new_id),})
                if(result){
                    return functions.success(res , "lấy thành công" ,{result})
                }
                return functions.setError(res, "Không có bài viết phụ huynh nào!" )
            }
            return functions.setError(res, "new_id = 1 : bài viết PH ; new_id = 2 : bài viết GS !" )
    }catch(e){
        console.log(e)
        return functions.setError(res, e.message )
    }
}