const VanBan = require('../../../models/Vanthu365/van_ban');
const functions = require("../../../services/functions");

exports.getTotalVanBan = async(req, res, next) => {
    try {
        let infoUser = req.user.data;
        let id = infoUser.idQLC;
        let _id = infoUser._id;
        let vanbanden = await VanBan.countDocuments({
            $and: [{
                $or: [{
                        $and: [{
                                $or: [{
                                        user_nhan: new RegExp(String(id)),
                                        gui_ngoai_cty: 0,
                                    },
                                    {
                                        user_nhan: new RegExp(String(id)),
                                        gui_ngoai_cty: { $exists: false }
                                    },
                                    {
                                        user_nhan: new RegExp(String(_id)),
                                        gui_ngoai_cty: 1,
                                    },
                                ]
                            },
                            {
                                trang_thai_vb: 6,
                                $or: [{
                                    type_thu_hoi: 0,
                                }, {
                                    type_thu_hoi: { $exists: false }
                                }]
                            }
                        ]
                    },
                    {
                        $and: [{
                                $or: [{
                                        nguoi_xet_duyet: new RegExp(String(id)),
                                        gui_ngoai_cty: 0,
                                    },
                                    {
                                        nguoi_xet_duyet: new RegExp(String(id)),
                                        gui_ngoai_cty: { $exists: false }
                                    },
                                    {
                                        nguoi_xet_duyet: new RegExp(String(_id)),
                                        gui_ngoai_cty: 1,
                                    },
                                ]
                            }
                            // { type_duyet: 1 }
                        ]
                    },
                    {
                        nguoi_ky: new RegExp(String(id)),
                    },
                    {
                        user_forward: new RegExp(String(id))
                    },
                    {
                        $or: [{
                                nguoi_theo_doi: new RegExp(String(id)),
                                gui_ngoai_cty: 0,
                            },
                            {
                                nguoi_theo_doi: new RegExp(String(id)),
                                gui_ngoai_cty: { $exists: false }
                            },
                            {
                                nguoi_theo_doi: new RegExp(String(_id)),
                                gui_ngoai_cty: 1,
                            },
                        ]
                    },
                ],
            }, ]
        });
        let vanbandi = await VanBan.countDocuments({
            $or: [{
                    user_send: id,
                    gui_ngoai_cty: 0,
                },
                {
                    user_send: id,
                    gui_ngoai_cty: { $exists: false }
                },
                {
                    user_send: _id,
                    gui_ngoai_cty: 1,
                },
            ]
        });
        // let tong_so_vb = await VanBan.countDocuments({$or: [{user_nhan: id}, {user_send: id}]});
        let tong_so_vb = vanbanden + vanbandi;

        let vanbanchoduyet = await VanBan.countDocuments({
            $and: [{
                $or: [{
                        user_send: id,
                        gui_ngoai_cty: 0,
                    },
                    {
                        user_send: id,
                        gui_ngoai_cty: { $exists: false }
                    },
                    {
                        user_send: _id,
                        gui_ngoai_cty: 1,
                    },
                ]
            }, {
                trang_thai_vb: {
                    $in: [0, 10]
                }
            }]
        });
        let vanbancanduyet = await VanBan.countDocuments({
            $and: [{
                    $or: [{
                            nguoi_xet_duyet: new RegExp(String(id)),
                            gui_ngoai_cty: 0,
                        },
                        {
                            nguoi_xet_duyet: new RegExp(String(id)),
                            gui_ngoai_cty: { $exists: false }
                        },
                        {
                            nguoi_xet_duyet: new RegExp(String(_id)),
                            gui_ngoai_cty: 1,
                        },
                    ]
                },
                // {
                //     trang_thai_vb: {
                //         $in: [0, 10]
                //     },
                // }
            ]
        });
        let vanbandenbandaduyet = await VanBan.countDocuments({
            $and: [{
                    $or: [{
                            nguoi_xet_duyet: new RegExp(String(id)),
                            gui_ngoai_cty: 0,
                        },
                        {
                            nguoi_xet_duyet: new RegExp(String(id)),
                            gui_ngoai_cty: { $exists: false }
                        },
                        {
                            nguoi_xet_duyet: new RegExp(String(_id)),
                            gui_ngoai_cty: 1,
                        },
                    ]
                },
                {
                    trang_thai_vb: {
                        $in: [3, 6]
                    }
                }
            ]
        });
        let vanbandidaduyet = await VanBan.countDocuments({
            $and: [{
                $or: [{
                        user_send: id,
                        gui_ngoai_cty: 0,
                    },
                    {
                        user_send: id,
                        gui_ngoai_cty: { $exists: false }
                    },
                    {
                        user_send: _id,
                        gui_ngoai_cty: 1,
                    },
                ]
            }, {
                trang_thai_vb: {
                    $in: [3, 6]
                }
            }]
        });
        let vanbandendaduyet = await VanBan.countDocuments({
            $and: [{
                $or: [{
                        $and: [{
                                $or: [{
                                        user_nhan: new RegExp(String(id)),
                                        gui_ngoai_cty: 0,
                                    },
                                    {
                                        user_nhan: new RegExp(String(id)),
                                        gui_ngoai_cty: { $exists: false }
                                    },
                                    {
                                        user_nhan: new RegExp(String(_id)),
                                        gui_ngoai_cty: 1,
                                    },
                                ]
                            },
                            {
                                trang_thai_vb: 6,
                                $or: [{
                                    type_thu_hoi: 0,
                                }, {
                                    type_thu_hoi: { $exists: false }
                                }]
                            }
                        ]
                    },
                    {
                        $and: [{
                                $or: [{
                                        nguoi_xet_duyet: new RegExp(String(id)),
                                        gui_ngoai_cty: 0,
                                    },
                                    {
                                        nguoi_xet_duyet: new RegExp(String(id)),
                                        gui_ngoai_cty: { $exists: false }
                                    },
                                    {
                                        nguoi_xet_duyet: new RegExp(String(_id)),
                                        gui_ngoai_cty: 1,
                                    },
                                ]
                            }
                            // { type_duyet: 1 }
                        ]
                    },
                    {
                        nguoi_ky: new RegExp(String(id)),
                    },
                    {
                        user_forward: new RegExp(String(id))
                    },
                    {
                        $or: [{
                                nguoi_theo_doi: new RegExp(String(id)),
                                gui_ngoai_cty: 0,
                            },
                            {
                                nguoi_theo_doi: new RegExp(String(id)),
                                gui_ngoai_cty: { $exists: false }
                            },
                            {
                                nguoi_theo_doi: new RegExp(String(_id)),
                                gui_ngoai_cty: 1,
                            },
                        ]
                    },
                ],
            }, {
                trang_thai_vb: 6
            }]
        });
        let ht_tongvb = Math.round(((vanbandidaduyet + vanbandendaduyet) / tong_so_vb) * 100);
        let ht_vbdi = Math.round(((vanbandidaduyet) / vanbandi) * 100);
        let ht_vbden = Math.round(((vanbandendaduyet) / vanbanden) * 100);
        let ht_vbcanduyet = Math.round(((vanbandenbandaduyet) / vanbancanduyet) * 100);
        let cong_van_gan_day = await VanBan.find({
            $and: [{
                    $or: [{
                            $and: [{
                                    $or: [{
                                            user_nhan: new RegExp(String(id)),
                                            gui_ngoai_cty: 0,
                                        },
                                        {
                                            user_nhan: new RegExp(String(id)),
                                            gui_ngoai_cty: { $exists: false }
                                        },
                                        {
                                            user_nhan: new RegExp(String(_id)),
                                            gui_ngoai_cty: 1,
                                        },
                                    ]
                                },
                                {
                                    trang_thai_vb: 6,
                                    $or: [{
                                        type_thu_hoi: 0,
                                    }, {
                                        type_thu_hoi: { $exists: false }
                                    }]
                                }
                            ]
                        },
                        {
                            $and: [{
                                    $or: [{
                                            nguoi_xet_duyet: new RegExp(String(id)),
                                            gui_ngoai_cty: 0,
                                        },
                                        {
                                            nguoi_xet_duyet: new RegExp(String(id)),
                                            gui_ngoai_cty: { $exists: false }
                                        },
                                        {
                                            nguoi_xet_duyet: new RegExp(String(_id)),
                                            gui_ngoai_cty: 1,
                                        },
                                    ]
                                }
                                // { type_duyet: 1 }
                            ]
                        },
                        {
                            nguoi_ky: new RegExp(String(id)),
                        },
                        {
                            user_forward: new RegExp(String(id))
                        },
                        {
                            $or: [{
                                    nguoi_theo_doi: new RegExp(String(id)),
                                    gui_ngoai_cty: 0,
                                },
                                {
                                    nguoi_theo_doi: new RegExp(String(id)),
                                    gui_ngoai_cty: { $exists: false }
                                },
                                {
                                    nguoi_theo_doi: new RegExp(String(_id)),
                                    gui_ngoai_cty: 1,
                                },
                            ]
                        },
                        {
                            $or: [{
                                    user_send: id,
                                    gui_ngoai_cty: 0,
                                },
                                {
                                    user_send: id,
                                    gui_ngoai_cty: { $exists: false }
                                },
                                {
                                    user_send: _id,
                                    gui_ngoai_cty: 1,
                                },
                            ]
                        }
                    ],
                },
                // { created_date: { $gt: minTime } }
            ]
        }).sort({ _id: -1 }).limit(3);
        return functions.success(res, "Get home page success!", { tong_so_vb, vanbanden, vanbandi, vanbanchoduyet, vanbancanduyet, ht_tongvb, ht_vbdi, ht_vbden, ht_vbcanduyet, cong_van_gan_day });
    } catch (err) {
        console.log(err)
        return functions.setError(res, err.message);
    }
}