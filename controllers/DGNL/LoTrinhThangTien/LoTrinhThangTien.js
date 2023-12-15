

const functions = require('../../../services/functions');
const Users = require('../../../models/Users');
const QLC_Deparments = require('../../../models/qlc/Deparment')
const DGNL_TblChucVu = require('../../../models/DanhGiaNangLuc/TblChucVu')

// all search results all phong ban
// exports.SearchResult = async (req, res, next) => {
//     try {
//       const type = req.user.data.type
//       const dep_id = parseInt(req.body.dep_id)
//       const tokenData = {id_congty:0}; // Define usc_id as needed
//       if(type === 1){
//       tokenData.id_congty = req.user.data._id
//       }
//       else {
//       tokenData.id_congty = req.user.data.com_id
//       }
//       // console.log(tokenData.id_congty)
//       // console.log(req.user.data)

//     const options = {
//         _id: 0,
//         com_id:1,
//         dep_id: 1,
//         dep_name: 1,

//     }
//     const result = await QLC_Deparments.find({ com_id : tokenData.id_congty, dep_id: parseInt(req.body.dep_id)}, options)
//     return functions.success(res, 'success', result);
//     } catch (error) {
//       console.log(error);
//         return functions.setError(res, 'Error');
//     }
// };
exports.SearchResult = async (req, res, next) => {
  try {
    const type = req.user.data.type;
    const tokenData = { id_congty: 0 }; // Define usc_id as needed
    if (type === 1) {
      tokenData.id_congty = req.user.data._id;
    } else {
      tokenData.id_congty = req.user.data.com_id;
    }

    const options = {
      _id: 0,
      com_id: 1,
      dep_id: 1,
      dep_name: 1,
    };

    let query = { com_id: tokenData.id_congty }; // Tạo một query mặc định với điều kiện com_id
    if (req.body.dep_id) {
      // Nếu có dep_id được cung cấp, thêm nó vào query
      query.dep_id = parseInt(req.body.dep_id);
    }

    const result = await QLC_Deparments.find(query, options);
    return functions.success(res, 'success', result);
  } catch (error) {
    console.log(error);
    return functions.setError(res, 'Error');
  }
};

// render cac phong
// exports.renderPhongBan = async (req, res, next) => {
//   try {
//     const type = req.user.data.type

//     const tokenData = {id_congty:0}; // Define usc_id as needed
//     if(type === 1){
//       tokenData.id_congty = req.user.data._id
//     }
//     else {
//       tokenData.id_congty = req.user.data.com_id
//     }
//     console.log(tokenData.id_congty)
//     const dep_id = Number(req.body.dep_id);
//     const matchStage = dep_id ? { dep_id: Number(dep_id) } : {};
//     const department = await QLC_Deparments.aggregate([
//       {
//         $match: { com_id:  tokenData.id_congty }
//       },
//       {
//         $match: matchStage 
//       },
//       {
//         $lookup: {
//           from: 'Users',
//           let: { dep_id: ['$dep_id'] },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $in: ["$inForPerson.employee.dep_id", '$$dep_id']
//                 }
//               }
//             },
//             {
//               $lookup: {
//                 from: 'DGNL_khDanhGia',
//                 let: { id: { $toString: '$_id' } },
//                 pipeline: [
//                   {
//                     $match: {
//                       $expr: {
//                         $regexMatch: {
//                           input: {
//                             $reduce: {
//                               input: { $split: ['$kh_user_dg', ','] },
//                               initialValue: '',
//                               in: {
//                                 $concat: ["$$value", "$$this"]
//                               }
//                             }
//                           },
//                           regex: "$$id",
//                           options: "i"
//                         }
//                       }
//                     }
//                   },
//                 ],
//                 as: 'kh'
//               }
//             },
//           ],
//           as: 'users'
//         }
//       },
//       {
//             $project: {
//               _id: 0,
//               dep_id: 1,
//               dep_name: 1,
//               user: '$users._id',
//               tong_chucvu: { $size: { $addToSet: '$users.inForPerson.employee.position_id' } },


//             }
//         },
//     ]);

//     return functions.success(res, "success", department);
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };
exports.renderPhongBan = async (req, res, next) => {
  try {
    const type = req.user.data.type;
    const tokenData = { id_congty: 0 }; // Define usc_id as needed
    if (type === 1) {
      tokenData.id_congty = req.user.data._id;
      // tokenData.id = req.user.data._id
    } else {
      tokenData.id_congty = req.user.data.com_id;
      tokenData.id = req.user.data._id
    }
    console.log(tokenData.id_congty);
    console.log(tokenData.id);

    const dep_id = Number(req.body.dep_id);
    console.log(dep_id);
    const matchStage = dep_id ? { dep_id: Number(dep_id) } : {};
    const specificUserId = tokenData.id;
    const matchStage2 = specificUserId ? { 'users._id': specificUserId } : {};
    const department = await QLC_Deparments.aggregate([
      {
        $match: { com_id: tokenData.id_congty },
      },
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: 'Users',
          let: { dep_id: ['$dep_id'] },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$inForPerson.employee.dep_id", '$$dep_id'],
                },
              },
            },
            {
              $lookup: {
                from: 'DGNL_khDanhGia',
                let: { id: { $toString: '$_id' } },
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
                                $concat: ["$$value", "$$this"],
                              },
                            },
                          },
                          regex: "$$id",
                          options: "i",
                        },
                      },
                    },
                  },
                ],
                as: 'kh',
              },
            },
          ],
          as: 'users',
        },
      },
      {
        $unwind: '$users',
      },
      {
        $match: matchStage2
      },
      {
        $group: {
          _id: '$_id',
          dep_id: { $first: '$dep_id' },
          dep_name: { $first: '$dep_name' },
          users: { $push: '$users._id' },
          avatarUser: { $push: '$users.avatarUser' },
          tong_chucvu: { $addToSet: '$users.inForPerson.employee.position_id' },
        },
      },
      {
        $project: {
          _id: 0,
          dep_id: 1,
          dep_name: 1,
          users: 1,
          avatarUser: 1,
          tong_chucvu: { $size: '$tong_chucvu' },
        },
      },
    ]);

    return functions.success(res, "success", department);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//   list user
exports.getListThanhVien = async (req, res, next) => {
  try {
    const type = req.user.data.type

    const tokenData = { id_congty: 0 };
    if (type === 1) {
      tokenData.id_congty = req.user.data._id
      tokenData.id = req.user.data._id
    }
    else {
      tokenData.id_congty = req.user.data.com_id
      tokenData.id = req.user.data._id
    }
    console.log(tokenData.id_congty)
    console.log(tokenData.id)


    const { dep_id } = req.body;
    const { position_id } = req.body;
    console.log(dep_id)
    const matchStage2 = position_id ? { 'inForPerson.employee.position_id': parseInt(position_id) } : {};
    const matchStage = dep_id ? { 'inForPerson.employee.dep_id': parseInt(dep_id) } : {};


    const ListThanhVien = await Users.aggregate([
      {
        $match: {
          'inForPerson.employee.com_id': tokenData.id_congty,
          ...matchStage,
          ...matchStage2,
        }
      },
      {
        $lookup: {
          from: 'QLC_Deparments',
          localField: 'inForPerson.employee.dep_id',
          foreignField: 'dep_id',
          as: 'qlc'
        }
      },
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
        $project: {
          'inForPerson.employee.dep_id': 1,
          'inForPerson.employee.position_id': 1,
          _id: 0,
          userName: 1,
          avatarUser: 1,
          'chucvu.ten_chucvu': 1,
          'chucvu.id_chucvu': 1,
          'qlc.dep_name': 1,

          'pb': 1
        }
      }
    ]);

    return functions.success(res, 'success', ListThanhVien);
  } catch (error) {
    return functions.setError(res, 'Error');

  }
};

