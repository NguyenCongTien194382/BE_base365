
const functions = require('../../../services/functions');
const Users = require('../../../models/Users');
const DGNL_khDanhGia = require('../../../models/DanhGiaNangLuc/KhDanhGia');
const QLC_Deparments = require('../../../models/qlc/Deparment');
const DGNL_PhieuDanhGiaChiTiet = require('../../../models/DanhGiaNangLuc/PhieuDanhGiaChiTiet');
const DGNL_PhieuDanhGia = require('../../../models/DanhGiaNangLuc/PhieuDanhGia');


exports.allKHDGV2 = async (req, res, next) => {
  try {
    const type = req.user.data.type

    const tokenData = { id_congty: 0 }; // Define usc_id as needed
    if (type === 1) {
      tokenData.id_congty = req.user.data._id
    }
    else {
      tokenData.id_congty = req.user.data.com_id
    }
    console.log(tokenData.id_congty)

    const option = {
      _id: 0,
      kh_id: 1,
      kh_ten: 1,
    }
    const results = await DGNL_khDanhGia.find({ id_congty: tokenData.id_congty, trangthai_xoa: 1 }, option);
    return functions.success(res, 'success', results)

  } catch (err) {
    return functions.setError(res, 'error', err)
  }
};


// all tìm kiếm phòng ban

exports.allPb = async (req, res, next) => {
  try {
    const type = req.user.data.type

    const tokenData = { id_congty: 0 }; // Define usc_id as needed
    if (type === 1) {
      tokenData.id_congty = req.user.data._id
    }
    else {
      tokenData.id_congty = req.user.data.com_id
    }
    console.log(tokenData.id_congty)
    const options = {
      dep_id: 1,
      dep_name: 1
    }
    const results = await QLC_Deparments.find({ com_id: tokenData.id_congty }, options);
    return functions.success(res, 'success', results)
  } catch (err) {
    return functions.setError(res, 'error', err)
  }
};



// render dữ liệu bảng
exports.KetQuaPhongBan = async (req, res, next) => {
  try {
    let page = Number(req.body.page);
    let pageSize = Number(req.body.pageSize);
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    const type = req.user.data.type;

    const tokenData = { id_congty: 0 };
    if (type === 1) {
      tokenData.id_congty = req.user.data._id;
    } else {
      tokenData.id_congty = req.user.data.com_id;
      tokenData.id = req.user.data._id;
    }

    const locdiem = req.body.locdiem !== undefined ? Number(req.body.locdiem) : null;
    console.log("lOCDIEM:", locdiem);

    const tong_diem = {
      $divide: [
        { $add: ['$users.kh.phieu.tongdiem', '$users.kh.phieu.tongdiem_kt'] },
        2
      ]
    };

    const sortDirection = locdiem === 1 ? 1 : -1;
    const dep_id = Number(req.body.dep_id);
    const kh_id = Number(req.body.kh_id);
    const matchStage = dep_id ? { 'dep_id': parseInt(dep_id) } : {};
    const matchStage2 = kh_id ? { 'users.kh.kh_id': parseInt(kh_id) } : {};

    const specificUserId = tokenData.id;
    const matchStage3 = specificUserId ? { 'users._id': specificUserId } : {};

    const aggregationPipeline = [
      {
        $match: { com_id: tokenData.id_congty }
      },
      {
        $match: matchStage
      },
      {
        $lookup: {
          from: 'Users',
          let: { dep_id: ['$dep_id'] },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$inForPerson.employee.dep_id", '$$dep_id']
                }
              }
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
                  { $unwind: '$phieu' }
                ],
                as: 'kh'
              }
            },
            { $unwind: '$kh' }
          ],
          as: 'users'
        }
      },
      { $unwind: '$users' },
      { $match: matchStage2 },
      { $skip: skip },
      { $limit: limit },
      { $match: matchStage3 },
      {
        $project: {
          _id: 0,
          dep_id: 1,
          dep_name: 1,
          'user_id': '$users._id',
          ke_hoach_danh_gia: '$users.kh.kh_ten',
          phieu: '$users.kh.kh_id',
          tong_diem
        }
      }
    ];

    if (locdiem !== null && (locdiem === 1 || locdiem === -1)) {
      // Chỉ thêm giai đoạn $sort khi locdiem là 1 hoặc -1
      aggregationPipeline.push({
        $sort: { tong_diem: sortDirection }
      });
    }

    const department = await QLC_Deparments.aggregate(aggregationPipeline);

    return functions.success(res, "success", department);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}



