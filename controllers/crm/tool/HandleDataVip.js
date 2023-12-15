const News = require('../../../models/Timviec365/UserOnSite/Company/New');
const PointCompany = require('../../../models/Timviec365/UserOnSite/Company/ManagerPoint/PointCompany');
const Customer = require("../../../models/crm/Customer/customer");
const functions = require("../../../services/functions");

const ToolHandleUserVip = async() => {
    try {
        while (true) {
            let skip = 0;
            let flag = true;
            let limit = 100;
            while (flag) {
                let listUser = await Customer.find({
                    cus_from: "tv365",
                    type: 2,
                    fromVip: { $gt: 0 }
                }).sort({ id: 1 }).skip(skip).limit(limit).lean();
                if (listUser.length) {
                    skip = skip + 100;
                    for (let i = 0; i < listUser.length; i++) {
                        let customer = listUser[i];
                        let flagvip = false;
                        let checkNew = await News.find({
                            new_user_id: Number(customer.id_cus_from),
                            $or: [{
                                    new_hot: 1
                                },
                                {
                                    new_gap: 1
                                },
                                {
                                    new_cao: 1
                                },
                                {
                                    new_ghim: 1
                                }
                            ]
                        });
                        if (checkNew.length) {
                            flagvip = true;
                        }
                        const is_buy = await PointCompany.findOne({ usc_id: Number(customer.id_cus_from) });
                        if (!is_buy || (is_buy && is_buy.point_usc == 0 && (is_buy.ngay_reset_diem_ve_0 == 0))) {
                            flagvip = true;
                        };
                        if (flagvip) {
                            console.log("Cập nhật vip cho khách hàng", customer.cus_id)
                            await Customer.updateOne({
                                cus_id: customer.cus_id
                            }, {
                                $set: {
                                    fromVip: Number(customer.emp_id)
                                }
                            });
                        }
                    }
                } else {
                    flag = false;
                }
            };
            await functions.sleep(60000);
        }
    } catch (e) {
        console.log("ToolHandleUserVip", e);
        await ToolHandleUserVip();
        return false;
    }
}

ToolHandleUserVip()