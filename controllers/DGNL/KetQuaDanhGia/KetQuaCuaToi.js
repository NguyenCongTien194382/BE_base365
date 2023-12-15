const functions = require('../../../services/functions');
const QLC_Deparments = require('../../../models/qlc/Deparment');
const DGNL_khDanhGia = require('../../../models/DanhGiaNangLuc/KhDanhGia');
const DGNL_PhieuDanhGiaChiTiet = require('../../../models/DanhGiaNangLuc/PhieuDanhGiaChiTiet');
const Users = require('../../../models/Users');

// all phòng ban
exports.allPhongBan = async(req, res, next) => {
    try {
        const type = req.user.data.type

        const tokenData = {id_congty:0}; // Define usc_id as needed
        if(type === 1){
        tokenData.id_congty = req.user.data._id
        }
        else {
        tokenData.id_congty = req.user.data.com_id
        }
        console.log(tokenData.id_congty)
        
        const options = {
            _id: 0,
            dep_id:1,
            dep_name:1,
        }
        const result = await QLC_Deparments.find({com_id: tokenData.id_congty }, options);
        return functions.success(res, "success", result)
    } catch (error) {
        return functions.setError(res, "error")
    }
}
 
// all kế hoach đánh giá'
exports.allKhdg = async(req, res, next) => {
  try {
    const type = req.user.data.type;
    const tockenData = {id_congty: 0}
    if(type === 1){
      tockenData.id_congty = req.user.data._id;
    } else {
      tockenData.id_congty = req.user.data.com_id
    }
     
      const option = {
          _id : 0,
          kh_id : 1,
          kh_ten : 1,
      }
      const result = await DGNL_khDanhGia.find({id_congty: tockenData.id_congty, trangthai_xoa : 1}, option);
      return functions.success(res, "success", result);

  }catch (error) {
      return functions.setError(res, "error");
  }
}


// all nhân viên của công ty
exports.allusers = async(req, res, next) => {
    try {
        const type = req.user.data.type

        const tokenData = {id_congty:0}; // Define usc_id as needed
        if(type === 1){
        tokenData.id_congty = req.user.data._id
        }
        else {
        tokenData.id_congty = req.user.data.com_id
        }
        console.log(tokenData.id_congty)
        const options = {
            _id : 1,
            userName : 1
        }
        const result = await Users.find({"inForPerson.employee.com_id":tokenData.id_congty}, options);
        return functions.success(res, "success", result);
    } catch (error) {
        return functions.setError(res, "error")
    }
}

exports.KetQuaDanhGiaCuaToi = async(req, res, next) => {
   
        try {
            const type = req.user.data.type

            const tokenData = {id_congty:0, id: 0}; 
            if(type === 1){
              tokenData.id_congty = req.user.data._id
              // tokenData.id = req.user.data._id
            }
            else {
              tokenData.id_congty = req.user.data.com_id
              tokenData.id = req.user.data._id
            }
            console.log(tokenData.id_congty)
            console.log(tokenData.id)

            let page = Number(req.body.page);
            let pageSize = Number(req.body.pageSize) ;
            const skip = (page - 1) * pageSize;
            const limit = pageSize; 
           

            
           
            let result = await Users.aggregate([
                            {
                                $match: {"inForPerson.employee.com_id": tokenData.id_congty}
                            },
                            // {
                            //     $match: {"_id": tokenData.id}
                            // },
                           
                           
                            {
                              $lookup: {
                                  from: 'DGNL_TblChucVu',
                                  let: {
                                      position_id: "$inForPerson.employee.position_id",
                                      dep_id: "$inForPerson.employee.dep_id"
                                  },
                                  pipeline: [
                                      {
                                          $match: {
                                              $expr: {
                                                  $and: [
                                                      { $eq: ["$id_chucvu", "$$position_id"] },
                                                      { $eq: ["$id_phongban", "$$dep_id"] }
                                                  ]
                                              }
                                          }
                                      }
                                  ],
                                  as: 'chucvu'
                              }
                          },
                            {
                                $lookup: {
                                  from: 'QLC_Deparments',
                                  let: { phong_ban: ['$inForPerson.employee.dep_id'] }, // Chắc chắn rằng phong_ban là một mảng
                                  pipeline: [
                                    {
                                      $match: {
                                        $expr: {
                                          $in: ['$dep_id', '$$phong_ban']
                                        }
                                      }
                                    }
                                  ],
                                  as: 'users'
                                }
                            },
                            {
                                $lookup: {
                                  from: 'DGNL_khDanhGia',
                                  let: { id: { $toString: '$_id' }},
                                  pipeline: [
                                    {
                                      $match: {
                                       
                                        $expr: {
                                            $regexMatch: {
                                              input: {
                                                $reduce: {
                                                  input: { $split: ['$kh_user_dg', ','] },
                                                  initialValue: '',
                                                  in: {
                                                    $concat: ["$$value", "$$this"]
                                                  }
                                                }
                                              },
                                              regex: "$$id",
                                              options: "i"
                                            }
                                        }
                                      }
                                    },
                                    {
                                        $lookup: {
                                          from: 'DGNL_PhieuDanhGiaChiTiet',
                                          let: { kh_id: '$kh_id' },
                                          pipeline: [
                                            {
                                              $match: {
                                                $expr: {
                                                  $eq: ['$phieu_id', '$$kh_id']
                                                }
                                              }
                                            }
                                          ],
                                          as: 'phieu'
                                        }
                                            },
                                      {$unwind: '$phieu'}
                                    
                                  ],
                                  as: 'kh'
                                }
                               
                            }, 
                            {$unwind: "$kh"},
                            { $skip : skip}, 
                            { $limit : limit},
                            {
                                $project: {
                                  ma_nv: {
                                    $concat: ["NV", { $toString: "$_id" }]
                                  },
                               
                                   _id: 1,
                                   ten_pb : '$users.dep_name',
                                   name: "$userName",
                                   phong_ban: "$inForPerson.employee.dep_id",
                                   chuc_vu: "$inForPerson.employee.position_id",
                                   phieu_danhgia : '$kh.kh_id',
                                   ke_hoach_danhgia: '$kh.kh_ten',
                                   tong_diem: {
                                    $divide: [
                                      { $add: ['$kh.phieu.tongdiem', '$kh.phieu.tongdiem_kt'] },
                                      2 // Số 2 để chia đôi tổng
                                    ]
                                  },
                                  ten_chucvu : "$chucvu.ten_chucvu"
                                }
                            }
            ]); 
            return functions.success(res, "success", result);
        } catch (error) {
            console.log(error)
            return functions.setError(res, "error")
        }
    
}