const functions = require('../../../services/functions');
const DGNL_khDanhGia = require('../../../models/DanhGiaNangLuc/KhDanhGia');
const DGNL_PhieuDanhGia = require('../../../models/DanhGiaNangLuc/PhieuDanhGia');
const Users = require('../../../models/Users');
const moment = require('moment');

// tên kế hoạch
exports.allNguoiDanhGia = async (req, res, next) => {
  try {
    const type = req.user.data.type;
    const tockenData = { id_congty: 0 }
    if (type === 1) {
      tockenData.id_congty = req.user.data._id;
    } else {
      tockenData.id_congty = req.user.data.com_id
    }

    const option = {
      _id: 0,
      kh_id: 1,
      kh_ten: 1,
    }
    const result = await DGNL_khDanhGia.find({ id_congty: tockenData.id_congty, trangthai_xoa: 1 }, option);
    return functions.success(res, "success", result);

  } catch (error) {
    return functions.setError(res, "error");
  }
}

// render dữ liệu trong bảng và phân trang
// exports.getListBang = async (req, res, next) => {
//   try {
//     const type = req.user.data.type;

//     const tokenData = { id_congty: 0 }; // Định nghĩa usc_id theo cần thiết
//     if (type === 1) {
//       tokenData.id_congty = req.user.data._id;
//     } else {
//       tokenData.id_congty = req.user.data.com_id;
//     }

//     const { kh_id, is_duyet } = req.body;
//     const pageSize = parseInt(req.body.pageSize);
//     const skipValue = parseInt(req.body.skipValue);

//     const matchStage1 = kh_id ? { kh_id: parseInt(kh_id) } : {};

//     // Áp dụng điều kiện is_duyet từ DGNL_PhieuDanhGia
//     const matchStage2 = is_duyet ? { 'phieu_danhgia.is_duyet': parseInt(is_duyet) } : {};

//     const options = await DGNL_khDanhGia.aggregate([
//       {
//         $match: { id_congty: tokenData.id_congty }
//       },
//       {
//         $match: matchStage1
//       },
//       {
//         $match: {
//           trangthai_xoa: 1
//         }
//       },
//       {
//         $skip: skipValue
//       },
//       {
//         $limit: pageSize
//       },
//       {
//         $lookup: {
//           from: 'DGNL_PhieuDanhGia',
//           localField: 'kh_id',
//           foreignField: 'phieuct_id_kh',
//           as: 'phieu_danhgia'
//         }
//       },
//       {
//         $lookup: {
//           from: 'Users',
//           let: { nguoi_danhgia: { $split: ['$kh_user_dg', ','] } },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $in: [{ $toString: '$_id' }, '$$nguoi_danhgia']
//                 }
//               }
//             }
//           ],
//           as: 'users'
//         }
//       },
//       {
//         $unwind: '$phieu_danhgia'
//       },
//       {
//         $match: matchStage2 // Áp dụng điều kiện is_duyet từ DGNL_PhieuDanhGia
//       },
//       {
//         $project: {
//           _id: 0,
//           id_congty: 1,
//           kh_id: 1,
//           khUserArray: 1,
//           ma_phieu: {
//             $concat: ["PDG", { $toString: "$kh_id" }]
//           },
//           tenkehoachdanhgia: "$kh_ten",
//           trang_thai: "$phieu_danhgia.is_duyet",
//           doi_tuong_pb: "$kh_user_pb",
//           doi_tuong_nv: { $size: { $ifNull: [{ $split: ["$kh_user_nv", ","] }, []] } },
//           thoi_gian_batdau: {
//             $concat: [
//               { $toString: "$kh_giobatdau" },
//               "-",
//               {
//                 $dateToString: {
//                   format: "%d/%m/%Y",
//                   date: { $toDate: { $multiply: ["$kh_ngaybatdau", 1000] } }
//                 }
//               }
//             ]
//           },
//           thoi_gian_ketthuc: {
//             $concat: [
//               { $toString: "$kh_gioketthuc" },
//               "-",
//               {
//                 $dateToString: {
//                   format: "%d/%m/%Y",
//                   date: { $toDate: { $multiply: ["$kh_ngayketthuc", 1000] } }
//                 }
//               }
//             ]
//           },
//           ghi_chu: "$kh_ghichu",
//           trangthai_xoa: 1,
//           nguoi_danhgia: '$users._id',
//           anh_nguoi_danhgia: '$users.avatarUser'
//         }
//       },
//     ]);

//     return functions.success(res, "success", options);
//   } catch (err) {
//     console.log(err);
//     return functions.setError(res, "error");
//   }
// };


// exports.getListBang = async (req, res, next) => {
//   try {
//     const type = req.user.data.type;
//     const tokenData = { id_congty: 0 };
//     if (type === 1) {
//       tokenData.id_congty = req.user.data._id;

//     } else {
//       tokenData.id_congty = req.user.data.com_id;
//       tokenData.id = req.user.data._id
//     }

//     const { kh_id, is_duyet, start_date, end_date } = req.body;
//     console.log(tokenData.id)

//     const matchStage1 = kh_id ? { kh_id: parseInt(kh_id) } : {};

//     // Áp dụng điều kiện is_duyet từ DGNL_PhieuDanhGia
//     const matchStage2 = is_duyet ? { 'phieu_danhgia.is_duyet': parseInt(is_duyet) } : {};
//     const specificUserId = tokenData.id;
//     const matchStage3 = specificUserId ? { 'users._id': specificUserId } : {};


//     // console.log("start_date - end_date", start_date, end_date);
//     const start_date_formatted = moment(start_date, 'DD/MM/YYYY').tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY');
//     const end_date_formatted = moment(end_date, 'DD/MM/YYYY').tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY');

//     const start_date_timestamp = moment(start_date, 'DD/MM/YYYY').unix();
//     const end_date_timestamp = moment(end_date, 'DD/MM/YYYY').unix();

//     console.log("start_date_formatted 1654621200", start_date_formatted)
//     console.log("start_date_timestamp 1654621200", start_date_timestamp)

//     console.log("end_date_formatted 1654721200", end_date_formatted)
//     console.log("end_date_timestamp 1654721200", end_date_timestamp)

//     const options = await DGNL_khDanhGia.aggregate([
//       {
//         $match: { id_congty: tokenData.id_congty }
//       },
//       {
//         $match: matchStage1
//       },
//       {
//         $match: {
//           trangthai_xoa: 1
//         }
//       },
//       {
//         $lookup: {
//           from: 'DGNL_PhieuDanhGia',
//           localField: 'kh_id',
//           foreignField: 'phieuct_id_kh',
//           as: 'phieu_danhgia'
//         }
//       },
//       {
//         $lookup: {
//           from: 'Users',
//           let: { nguoi_danhgia: { $split: ['$kh_user_dg', ','] } },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $in: [{ $toString: '$_id' }, '$$nguoi_danhgia']
//                 }
//               }
//             }
//           ],
//           as: 'users'
//         }
//       },
//       {
//         $unwind: '$phieu_danhgia'
//       },
//       {
//         $match: matchStage2
//       },
//       { $match: matchStage3 },
//       // {
//       //   $match: {
//       //     "kh_ngaybatdau": { $gte: start_date_timestamp }, 
//       //     "kh_ngayketthuc": { $lte: end_date_timestamp }    
//       //   }
//       // },
//       {
//         $match: {
//           $or: [
//             {
//               "kh_ngaybatdau": { $gte: start_date_timestamp },
//               "kh_ngayketthuc": { $lte: end_date_timestamp }
//             },
//             {
//               $and: [
//                 { "kh_ngaybatdau": { $exists: false } },
//                 { "kh_ngayketthuc": { $exists: false } }
//               ]
//             }
//           ]
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           id_congty: 1,
//           kh_id: 1,
//           khUserArray: 1,
//           ma_phieu: {
//             $concat: ["PDG", { $toString: "$kh_id" }]
//           },
//           tenkehoachdanhgia: "$kh_ten",
//           trang_thai: "$phieu_danhgia.is_duyet",
//           doi_tuong_pb: "$kh_user_pb",
//           doi_tuong_nv: { $size: { $ifNull: [{ $split: ["$kh_user_nv", ","] }, []] } },
//           thoi_gian_batdau: {
//             $concat: [
//               { $toString: "$kh_giobatdau" },
//               "-",
//               {
//                 $dateToString: {
//                   format: "%d/%m/%Y",
//                   date: { $toDate: { $multiply: ["$kh_ngaybatdau", 1000] } },
//                   timezone: "Asia/Ho_Chi_Minh"
//                 }
//               }
//             ]
//           },
//           thoi_gian_ketthuc: {
//             $concat: [
//               { $toString: "$kh_gioketthuc" },
//               "-",
//               {
//                 $dateToString: {
//                   format: "%d/%m/%Y",
//                   date: {
//                     $toDate: { $multiply: ["$kh_ngayketthuc", 1000] },
//                   },
//                   timezone: "Asia/Ho_Chi_Minh"
//                 }
//               }
//             ]
//           },
//           ghi_chu: "$kh_ghichu",
//           trangthai_xoa: 1,
//           nguoi_danhgia: '$users._id',
//           anh_nguoi_danhgia: '$users.avatarUser',
//           'kh_ngaybatdau': 1,
//           'kh_ngayketthuc': 1,

//           thoi_gian_batdau_test: {
//             $dateToString: {
//               format: "%d/%m/%Y",
//               date: {
//                 $toDate: { $multiply: ["$kh_ngaybatdau", 1000] }
//               },
//               timezone: "Asia/Ho_Chi_Minh" // Thay thế bằng múi giờ bạn muốn sử dụng
//             }
//           },


//           thoi_gian_ketthuc_test: {

//             $dateToString: {
//               format: "%d/%m/%Y",
//               date: { $toDate: { $multiply: ["$kh_ngayketthuc", 1000] } },
//               timezone: "Asia/Ho_Chi_Minh"
//             }


//           },

//         }

//       }
//     ]);

//     return functions.success(res, "success", options);
//   } catch (err) {
//     console.log(err);
//     return functions.setError(res, "error");
//   }
// };

exports.getListBang = async (req, res, next) => {
  try {
    const type = req.user.data.type;
    const tokenData = { id_congty: 0 };

    if (type === 1) {
      tokenData.id_congty = req.user.data._id;
    } else {
      tokenData.id_congty = req.user.data.com_id;
      tokenData.id = req.user.data._id;
    }

    const { kh_id, is_duyet, start_date, end_date } = req.body;
    // console.log(tokenData.id);

    const matchStage1 = kh_id ? { kh_id: parseInt(kh_id) } : {};
    const matchStage2 = is_duyet ? { 'phieu_danhgia.is_duyet': parseInt(is_duyet) } : {};
    const specificUserId = tokenData.id;
    const matchStage3 = specificUserId ? { 'users._id': specificUserId } : {};

    const start_date_timestamp = start_date ? moment(start_date, 'YYYY-DD-MM').unix() : null;
    const end_date_timestamp = end_date ? moment(end_date, 'YYYY-DD-MM').unix() : null;
    const start_date_formatted = moment(start_date, 'YYYY-DD-MM').tz('Asia/Ho_Chi_Minh').format('YYYY-DD-MM');
    const end_date_formatted = moment(end_date, 'YYYY-DD-MM').tz('Asia/Ho_Chi_Minh').format('YYYY-DD-MM');

    console.log("start_date_timestamp start_date_formatted", start_date_timestamp, start_date_formatted)
    console.log("end_date_timestamp end_date_formatted", end_date_timestamp , end_date_formatted)
    const pipeline = [
      {
        $match: { id_congty: tokenData.id_congty }
      },
      {
        $match: matchStage1
      },
      {
        $match: {
          trangthai_xoa: 1
        }
      },
      {
        $lookup: {
          from: 'DGNL_PhieuDanhGia',
          localField: 'kh_id',
          foreignField: 'phieuct_id_kh',
          as: 'phieu_danhgia'
        },
      },
      {
        $lookup: {
          from: 'Users',
          let: { nguoi_danhgia: { $split: ['$kh_user_dg', ','] } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [{ $toString: '$_id' }, '$$nguoi_danhgia']
                }
              }
            }
          ],
          as: 'users'
        },
      },
      {
        $unwind: '$phieu_danhgia'
      },
      {
        $match: matchStage2
      },
      {
        $match: matchStage3
      }
    ];

    if (start_date_timestamp && end_date_timestamp) {
      pipeline.push({
        $match: {
          "kh_ngaybatdau": { $gte: start_date_timestamp },
          "kh_ngayketthuc": { $lte: end_date_timestamp }
        }
      });
    }

    pipeline.push({
      $project: {
        _id: 0,
        id_congty: 1,
        kh_id: 1,
        khUserArray: 1,
        ma_phieu: {
          $concat: ["PDG", { $toString: "$kh_id" }]
        },
        tenkehoachdanhgia: "$kh_ten",
        trang_thai: "$phieu_danhgia.is_duyet",
        doi_tuong_pb: "$kh_user_pb",
        doi_tuong_nv: { $size: { $ifNull: [{ $split: ["$kh_user_nv", ","] }, []] } },
        thoi_gian_batdau: {
          $concat: [
            { $toString: "$kh_giobatdau" },
            "-",
            {
              $dateToString: {
                format: "%d/%m/%Y",
                date: { $toDate: { $multiply: ["$kh_ngaybatdau", 1000] } },
                timezone: "Asia/Ho_Chi_Minh"
              }
            }
          ]
        },
        thoi_gian_ketthuc: {
          $concat: [
            { $toString: "$kh_gioketthuc" },
            "-",
            {
              $dateToString: {
                format: "%d/%m/%Y",
                date: {
                  $toDate: { $multiply: ["$kh_ngayketthuc", 1000] },
                },
                timezone: "Asia/Ho_Chi_Minh"
              }
            }
          ]
        },
        ghi_chu: "$kh_ghichu",
        trangthai_xoa: 1,
        nguoi_danhgia: '$users._id',
        anh_nguoi_danhgia: '$users.avatarUser',
        'kh_ngaybatdau': 1,
        'kh_ngayketthuc': 1,

        thoi_gian_batdau_test: {
          $dateToString: {
            format: "%d/%m/%Y",
            date: {
              $toDate: { $multiply: ["$kh_ngaybatdau", 1000] }
            },
            timezone: "Asia/Ho_Chi_Minh"
          }
        },


        thoi_gian_ketthuc_test: {

          $dateToString: {
            format: "%d/%m/%Y",
            date: { $toDate: { $multiply: ["$kh_ngayketthuc", 1000] } },
            timezone: "Asia/Ho_Chi_Minh"
          }


        },

      }

    });

    const options = await DGNL_khDanhGia.aggregate(pipeline);

    return functions.success(res, "success", options);
  } catch (err) {
    console.log(err);
    return functions.setError(res, "error");
  }
};



// list người đánh giá
exports.ListUsers = async (req, res, next) => {
  try {

    const type = req.user.data.type

    const tokenData = { id_congty: 0 };
    if (type === 1) {
      tokenData.id_congty = req.user.data._id
    }
    else {
      tokenData.id_congty = req.user.data.com_id
    }
    console.log(tokenData.id_congty)
    const { kh_id } = req.body;




    console.log(kh_id);


    const matchStage1 = kh_id ? { kh_id: parseInt(kh_id) } : {};



    const options = await DGNL_khDanhGia.aggregate([
      {
        $match: { id_congty: tokenData.id_congty }
      },
      {
        $match: matchStage1
      },

      {
        $lookup: {
          from: 'Users',
          let: { nguoi_danhgia: { $split: ['$kh_user_dg', ','] } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [{ $toString: '$_id' }, '$$nguoi_danhgia']
                }
              }
            },
            {
              $lookup: {
                from: 'DGNL_TblChucVu',
                let: { idchucvu: '$inForPerson.employee.position_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$id_chucvu', '$$idchucvu']
                      }
                    }
                  }
                ],
                as: 'phieu'
              }
            },
            {
              $lookup: {
                from: 'QLC_Deparments',
                let: { phong_ban: ['$inForPerson.employee.dep_id'] },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: ['$dep_id', '$$phong_ban']
                      }
                    }
                  }
                ],
                as: 'phong'
              }
            },
            // {$unwind: '$phieu'}
          ],
          as: 'users'
        },
      },
      { $unwind: '$users' },

      {
        $project: {
          _id: 0,
          kh_id: 1,
          nguoi_danhgia: '$users._id',
          ten: '$users.userName',
          anh: '$users.avatarUser',
          phong_ban: '$users.inForPerson.employee.dep_id',
          chuc_vu: '$users.inForPerson.employee.position_id',
          tenchucvu: { $arrayElemAt: ['$users.phieu.ten_chucvu', 0] },
          phong: '$users.phong.dep_name'

        },

      },
    ]);


    return functions.success(res, "success", options);
  } catch (err) {
    console.log(err);
    return functions.setError(res, "error");
  }
};


// xóa KHDG
exports.deleteKHDG = async (req, res, next) => {
  try {
    const type = req.user.data.type;
    const tockenData = { id_congty: 0 }
    if (type === 1) {
      tockenData.id_congty = req.user.data._id;
    } else {
      tockenData.id_congty = req.user.data.com_id
    }
    const { kh_id } = req.body;

    // if (!kh_id || !id_congty) {
    //   return functions.setError(res, 'Không có kh_id hoặc id_congty được cung cấp');
    // }

    // Cập nhật trạng thái trangthai_xoa từ 1 thành 2 trong model DGNL_khDanhGia
    const updatedKHDG = await DGNL_khDanhGia.findOneAndUpdate(
      { kh_id, id_congty: tockenData.id_congty },
      { trangthai_xoa: 2 },
      { new: true } // Đảm bảo trả về bản ghi sau khi cập nhật
    );

    if (!updatedKHDG) {
      return functions.setError(res, 'Không tìm thấy KHDG để cập nhật');
    }

    // Tìm tất cả các bản ghi trong DGNL_PhieuDanhGia có phieuct_id_kh tương ứng với kh_id đã cập nhật
    const phieuDanhGiaToUpdate = await DGNL_PhieuDanhGia.find({ phieuct_id_kh: updatedKHDG.kh_id });

    // Cập nhật trạng thái trangthai_xoa từ 1 thành 2 trong tất cả các bản ghi tìm thấy
    await DGNL_PhieuDanhGia.updateMany(
      { phieuct_id_kh: updatedKHDG.kh_id },
      { trangthai_xoa: 2 }
    );

    return functions.success(res, 'Cập nhật trạng thái thành công', updatedKHDG);
  } catch (error) {
    console.error(error);
    return functions.setError(res, 'Cập nhật trạng thái không thành công');
  }
};
