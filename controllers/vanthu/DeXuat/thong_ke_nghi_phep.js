const De_Xuat = require("../../../models/Vanthu/de_xuat");
const functions = require('../../../services/vanthu');
const User = require('../../../models/Users');

exports.thong_ke_nghi_phep = async(req, res) => {
    try {
        let {
            listOrganizeDetailId,
            id_nhan_vien,
            nghi_nhieu_nhat, //3-nghỉ nhiều nhất 2- nghỉ đột xuất nhiều nhất 1- nghỉ có kế hoạch nhiều nhất 
            thang,
            page,
            perPage,
        } = req.body;
        const com_id = req.user.data.com_id;
        if (!page) {
            page = 1;
        }
        if (!perPage) {
            perPage = 10
        }
        let conditions = {
            'inForPerson.employee.com_id': com_id,
            type: 2,
        }
        let conditions_dx = {
            type_dx: 1,
            type_duyet: 5,
            com_id: com_id,
        }
        if (id_nhan_vien) {
            conditions['idQLC'] = Number(id_nhan_vien);
        }
        if (listOrganizeDetailId) {
            conditions["inForPerson.employee.listOrganizeDetailId"] = { $all: listOrganizeDetailId }
        }
        if (thang) {
            const choosen_month = new Date(thang).getMonth() + 1;
            const choosen_year = new Date(thang).getFullYear();
            conditions_dx.time_create = {
                $gte: new Date(thang).getTime() / 1000,
                $lte: new Date(`${choosen_year}-${choosen_month+1}`).getTime() / 1000
            }
        }
        let fetch_data = await User.aggregate([{
                $match: conditions
            }, {
                $lookup: {
                    from: 'QLC_OrganizeDetail',
                    localField: 'inForPerson.employee.organizeDetailId',
                    foreignField: 'id',
                    pipeline: [{
                        $match: {
                            comId: com_id,
                        },
                    }, ],
                    as: 'organizeDetail',
                },
            }, {
                $unwind: {
                    path: '$organizeDetail',
                    preserveNullAndEmptyArrays: true,
                },
            }, {
                $lookup: {
                    from: 'vanthu_de_xuats',
                    localField: 'idQLC',
                    foreignField: 'id_user',
                    pipeline: [{
                        $match: conditions_dx
                    }, {
                        $project: {
                            _id: '$_id',
                            nd_nghi: '$noi_dung.nghi_phep'
                        }
                    }],
                    as: 'dxNghi',
                },
            }, {
                $sort: {
                    idQLC: -1,
                }
            }, {
                $facet: {
                    totalRecords: [{ $count: "count" }],
                    data: [
                        { $skip: (page - 1) * perPage },
                        { $limit: perPage },
                        {
                            $project: {
                                idQLC: '$idQLC',
                                userName: '$userName',
                                organizeDetailName: '$organizeDetail.organizeDetailName',
                                dxNghi: '$dxNghi'
                            }
                        }
                    ]
                }
            },
            {
                $unwind: "$totalRecords"
            },
        ])
        const real_data = fetch_data[0]
        let data = real_data.data
        data = data.map(d => {
            if (d.dxNghi.length > 0) {
                const dxNghi = d.dxNghi
                let absentDate = [];
                for (let i = 0; i < dxNghi.length; i++) {
                    const nd_nghi = dxNghi[i].nd_nghi;
                    for (let j = 0; j < nd_nghi.nd.length; j++) {
                        const nd = {
                            date: nd_nghi.nd[j].bd_nghi,
                            shift: nd_nghi.nd[j].ca_nghi,
                            loai_np: nd_nghi.loai_np,
                        }
                        absentDate.push(nd)
                    }
                }
                const distinctAbsentDate = new Map();
                // Iterate through the array and add records to the Map
                absentDate.forEach((record) => {
                    const key = `${record.date}-${record.shift}-${record.loai_np}`;
                    if (!distinctAbsentDate.has(key)) {
                        distinctAbsentDate.set(key, record);
                    }
                });
                // Convert the Map values back to an array
                const distinctAbsentDateArray = Array.from(distinctAbsentDate.values());
                console.log(distinctAbsentDateArray);
                return {
                    ...d,
                    so_ngay_co_nghi_phep: distinctAbsentDateArray.length
                }
            }
            return d
        })
        return res.status(200).json({ data: data, totalPages: Math.ceil(real_data.totalRecords.count / perPage) })
    } catch (error) {
        console.error('Failed ', error);
        return functions.setError(res, error);
    }
}