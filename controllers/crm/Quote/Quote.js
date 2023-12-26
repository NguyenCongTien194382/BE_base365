const Quote = require('../../../models/crm/Quote/Quote');
const functions = require('../../../services/functions');
const dayjs = require('dayjs')
const history = require('./QuoteHistory')
const Products = require('../../../models/crm/Products')
const ProductUnit = require('../../../models/crm/ProductUnit')
const Users = require('../../../models/Users')
const Chance = require('../../../models/crm/Customer/customer_chance')

// Hiện tại, mã báo giá quy ước đặt là "BG-XXXX", 
// "BG-" cố định, "XXXX" là số
// "XXXX" có độ dài tối thiểu 4, thêm số 0 nếu thiếu
// 
function createQuoteCode(num) {
    let numStr = num.toString();

    while (numStr.length < 4) {
        numStr = '0' + numStr;
    }

    return 'BG-' + numStr;
}

// Tìm số XXXX max
const findMaxCodeNum = async (comId) => {
    try {
        const result = await Quote.findOne({ is_delete: 0, com_id: comId })
            .sort({ quote_code: -1 })
        if (result) {
            // Extract the XXXX number from the quote_code and return it
            return result.quote_code;
        } else {
            // No documents found, return 0
            return 0;
        }
    } catch (error) {
        console.error('Error finding highest quote_code: ', error);
    }
}

const productCalculation = (amount = 0, price = 0, discountRate = 0, taxRate = 0) => {
    return Number((((amount * price) * (1 - discountRate * 1.0 / 100)) * (1 + taxRate * 1.0 / 100)).toFixed(2))
}

exports.create = async (req, res, next) => {
    try {
        const { date_quote,
            date_quote_end,
            status,
            customer_id,
            tax_code,
            address,
            phone_number,
            chance_id,
            introducer,
            product_list,
            discount_rate,
            // discount_money,
            // total_money, // Backend tính và lưu
            terms_and_conditions,
            note,
            creator_name,
            ceo_name,
            description,
            use_system_info,
            print_template_id } = req.body;

        let comId = 0, empId = 0;

        if (req.user.data.type == 1 || req.user.data.type == 2) {
            if (date_quote && date_quote_end && status && customer_id && creator_name && ceo_name) {
                comId = req.user.data.com_id;
                empId = req.user.data.idQLC;
                const maxId = await Quote.findOne({ com_id: comId }, { id: 1 }, { sort: { id: -1 } }).lean() || 0
                const id = Number(maxId.id) + 1 || 1
                const maxQuoteCodeNum = await Quote.findOne({ com_id: comId, is_delete: 0 }, { quote_code: 1 }, { sort: { quote_code: -1 } }).lean() || 0
                const quote_code = Number(maxQuoteCodeNum.quote_code) + 1 || 1;
                const quote_code_str = createQuoteCode(quote_code);
                let productArray = []
                let totalMoneyBeforeDiscount = 0;
                productArray = JSON.parse(product_list).map((productItem) => {
                    const productTotalMoney = productCalculation(Number(productItem.amount), Number(productItem.product_price), Number(productItem.product_discount_rate), Number(productItem.tax_rate))
                    totalMoneyBeforeDiscount += productTotalMoney
                    return {
                        ...productItem,
                        product_total_money: productTotalMoney
                    }
                })
                const discountRate = discount_rate ? Number(discount_rate) : 0;

                const newQuote = new Quote({
                    id: id,
                    com_id: comId,
                    quote_code: quote_code,
                    quote_code_str: quote_code_str,

                    date_quote: date_quote,
                    date_quote_end: date_quote_end,
                    status: status,
                    customer_id: customer_id,
                    tax_code: tax_code,
                    address: address,
                    phone_number: phone_number,
                    chance_id: chance_id,
                    introducer: introducer,
                    product_list: productArray, // product_id, amount, product_discount_rate, product_discount_money, tax_rate, tax_money, product_total_money, 
                    discount_rate: discountRate,
                    // discount_money: discount_money,
                    total_money: Number((totalMoneyBeforeDiscount * (1 - discountRate * 1.0 / 100)).toFixed(2)),
                    terms_and_conditions: terms_and_conditions,
                    note: note,
                    creator_name: creator_name,
                    ceo_name: ceo_name,
                    description: description,
                    use_system_info: Boolean(use_system_info),
                    print_template_id: print_template_id,

                    user_created_id: empId,
                    user_updated_id: empId,
                    is_delete: 0,
                    created_at: Math.floor(Date.now() / 1000),
                    updated_at: Math.floor(Date.now() / 1000),
                });

                let saveQuote = await newQuote.save();

                history.addHistory(comId, empId, id, 'Tạo')

                return functions.success(res, "Tạo thành công", { data: saveQuote })
            } else {
                return functions.setError(res, "Thiếu trường thuộc tính", 400);
            }
        } else {
            return functions.setError(res, "Bạn không có quyền", 400);
        }
    } catch (error) {
        console.log('Error: ', error);
        return functions.setError(res, error.message)
    }
}

// Trả danh sách báo giá, phục vụ cho trang chủ
exports.list = async (req, res, next) => {
    try {
        let { date_quote,
            date_quote_end,
            status,
            quote_code_str,
            chance_id,
            page,
            perPage } = req.body;

        page = Number(page) || 1;
        perPage = Number(perPage) || 10;
        let startIndex = (page - 1) * perPage;

        let comId = 0

        if (req.user.data.type == 1 || req.user.data.type == 2) {
            comId = req.user.data.com_id;

            // Tìm theo các giá trị...
            let conditions = { is_delete: 0, com_id: comId } // Mặc định 
            if (date_quote) conditions.date_quote = {
                $gte: dayjs(date_quote).startOf('day').toDate(),
                $lte: dayjs(date_quote).endOf('day').toDate()
            }
            if (date_quote_end) conditions.date_quote_end = {
                $gte: dayjs(date_quote_end).startOf('day').toDate(),
                $lte: dayjs(date_quote_end).endOf('day').toDate()
            }
            if (status) {
                if (Number(status) && Number(status) !== 0) {
                    conditions.status = Number(status)
                }
            }
            if (quote_code_str) {
                const quote_code_str_reg = RegExp(quote_code_str, 'i')
                conditions.quote_code_str = { $regex: quote_code_str_reg }
            }
            if (chance_id) {
                if (Number(chance_id)) {
                    conditions.chance_id = Number(chance_id)
                }
            }

            // const data = await Quote.find(conditions).sort({ updated_at: -1, date_quote_end: -1, date_quote: -1 })
            const data = await Quote.aggregate([
                { $match: conditions },
                {
                    $lookup: { // Lấy dữ liệu khách hàng 
                        from: 'CRM_customer',
                        localField: 'customer_id',
                        foreignField: 'cus_id',
                        as: 'customer_data'
                    }
                },
                { $unwind: { path: '$customer_data', preserveNullAndEmptyArrays: true } },
                {
                    $match: {
                        $or: [
                            {
                                'customer_data.company_id': comId,
                                'customer_data.is_delete': 0
                            },
                            {
                                'customer_data': { $exists: false }
                            }
                        ]

                    }
                },
                {
                    $project: {
                        id: 1,
                        _id: 0,
                        com_id: 1,
                        quote_code: 1,
                        quote_code_str: 1,
                        status: 1,
                        date_quote: 1,
                        date_quote_end: 1,
                        total_money: 1,
                        description: 1,
                        updated_at: 1,
                        customer_name: {
                            $ifNull: ['$customer_data.name', '']
                        }
                    }
                },
                {
                    $sort: { updated_at: -1, date_quote_end: -1, date_quote: -1 }
                },
                {
                    $skip: startIndex
                },
                {
                    $limit: perPage
                }
            ])

            const totalQuote = await Quote.countDocuments(conditions);

            return functions.success(res, "Danh sách báo giá", { data: data, current_page: page, total_pages: Math.ceil(totalQuote * 1.0 / perPage), total: totalQuote })
        } else {
            return functions.setError(res, "Bạn không có quyền", 400);
        }
    } catch (error) {
        console.log('Error: ', error);
        return functions.setError(res, error.message)
    }
}

// Lấy thông tin chi tiết, phục vụ cho thao tác sửa 
exports.getDetail = async (req, res, next) => {
    try {
        const { id } = req.body;
        let comId = 0
        if (req.user.data.type == 1 || req.user.data.type == 2) {
            if (id) {
                comId = req.user.data.com_id;

                // Tìm theo các giá trị...
                let conditions = { id: Number(id), is_delete: 0, com_id: comId } // Mặc định 

                // const data = await Quote.aggregate([
                //     { $match: conditions },
                //     {
                //         $sort: { updated_at: -1, date_quote_end: -1, date_quote: -1 }
                //     },
                //     {
                //         $limit: 1
                //     },
                //     {
                //         $lookup: { // Lấy dữ liệu hàng hóa 
                //             from: 'CRM_Product',
                //             localField: 'product_list.product_id',
                //             foreignField: '_id',
                //             as: 'product_data'
                //         }
                //     },
                //     // { $unwind: { path: '$product_data', preserveNullAndEmptyArrays: true } },
                //     {
                //         $match: {
                //             $or: [
                //                 {
                //                     'product_data.company_id': comId,
                //                     'product_data.is_delete': 0
                //                 },
                //                 {
                //                     'product_data': { $exists: false }
                //                 }
                //             ]
                //         }
                //     },
                //     {
                //         $project: {
                //             _id: 0,
                //             id: 1,
                //             com_id: 1,
                //             quote_code: 1,
                //             quote_code_str: 1,
                //             date_quote: 1,
                //             date_quote_end: 1,
                //             status: 1,
                //             id_customer: 1,
                //             tax_code: 1,
                //             address: 1,
                //             phone_number: 1,
                //             introducer: 1,
                //             // product_list: 1,
                //             discount_rate: 1,
                //             discount_money: 1,
                //             total_money: 1,
                //             terms_and_conditions: 1,
                //             note: 1,
                //             creator_name: 1,
                //             ceo_name: 1,
                //             description: 1,
                //             use_system_info: 1,
                //             updated_at: 1,
                //             product_list: {
                //                 $map: {
                //                     input: '$product_list',
                //                     as: 'productItem',
                //                     in: {
                //                         $mergeObjects: [
                //                             '$$productItem',
                //                             {
                //                                 product_name: {
                //                                     $reduce: {
                //                                         input: '$product_data',
                //                                         initialValue: "",
                //                                         in: {
                //                                             $cond: {
                //                                                 if: { $eq: ['$$productItem.product_id', '$$this._id'] },
                //                                                 then: '$$this.prod_name',
                //                                                 else: '$$value',
                //                                             },
                //                                         },
                //                                     }
                //                                 }
                //                             },
                //                             {
                //                                 product_price: {
                //                                     $reduce: {
                //                                         input: '$product_data',
                //                                         initialValue: 0,
                //                                         in: {
                //                                             $cond: {
                //                                                 if: { $eq: ['$$productItem.product_id', '$$this._id'] },
                //                                                 then: '$$this.price',
                //                                                 else: '$$value',
                //                                             },
                //                                         },
                //                                     }
                //                                 }
                //                             },
                //                             {
                //                                 product_dvt_id: {
                //                                     $reduce: {
                //                                         input: '$product_data',
                //                                         initialValue: 0,
                //                                         in: {
                //                                             $cond: {
                //                                                 if: { $eq: ['$$productItem.product_id', '$$this._id'] },
                //                                                 then: '$$this.dvt',
                //                                                 else: '$$value',
                //                                             },
                //                                         },
                //                                     }
                //                                 }
                //                             },
                //                         ]
                //                     }
                //                 }
                //             }
                //         }
                //     }
                // ])

                const data = await Quote.findOne(conditions)
                    .sort({ updated_at: -1, date_quote_end: -1, date_quote: -1 })
                    .populate({
                        path: 'product_list.product_id',
                        model: Products,
                        localField: 'product_list.product_id',
                        foreignField: '_id',
                        options: { lean: true },
                        select: 'prod_name dvt product_image logo',
                        populate: {
                            path: 'dvt',
                            model: ProductUnit,
                            localField: 'dvt',
                            foreignField: '_id',
                            options: { lean: true },
                            select: 'unit_name'
                        }
                    })
                    .populate({
                        path: 'user_created_id',
                        model: Users,
                        localField: 'user_created_id',
                        foreignField: 'idQLC',
                        options: { lean: true },
                        select: 'userName avatarUser'
                    })
                    .populate({
                        path: 'user_updated_id',
                        model: Users,
                        localField: 'user_updated_id',
                        foreignField: 'idQLC',
                        options: { lean: true },
                        select: 'userName avatarUser'
                    })
                    .populate({
                        path: 'chance_id',
                        model: Chance,
                        localField: 'chance_id',
                        foreignField: 'id',
                        options: {lean: true},
                    })

                // const newProductList = await Promise.all(data[0].product_list.map(async (productItem) => {
                //     if (productItem.product_dvt_id && productItem.product_dvt_id != 0) {
                //         const dvtData = await ProductUnit.findById(productItem.product_dvt_id)
                //         return {
                //             ...productItem,
                //             product_dvt: dvtData.unit_name
                //         }
                //     } else {
                //         return productItem
                //     }
                // }))
                // data[0].product_list = newProductList

                return functions.success(res, "Danh sách báo giá", { data: data })
            } else {
                return functions.setError(res, "Thiếu trường thuộc tính", 400);
            }
        } else {
            return functions.setError(res, "Bạn không có quyền", 400);
        }
    } catch (error) {
        console.log('Error: ', error);
        return functions.setError(res, error.message)
    }
}

exports.update = async (req, res, next) => {
    try {
        const {
            id,
            date_quote,
            date_quote_end,
            status,
            id_customer,
            tax_code,
            address,
            phone_number,
            chance_id,
            introducer,
            product_list,
            discount_rate,
            // discount_money,
            // total_money, // Back end tự tính
            terms_and_conditions,
            note,
            creator_name,
            ceo_name,
            description,
            use_system_info,
            print_template_id } = req.body;

        let comId = 0, empId = 0;

        if (req.user.data.type == 1 || req.user.data.type == 2) {
            if (id) {
                comId = req.user.data.com_id;
                empId = req.user.data.idQLC;

                const foundQuote = await Quote.findOne({ id: Number(id), com_id: comId, is_delete: 0 })
                if (!foundQuote) {
                    return functions.setError(res, "Báo giá không tồn tại", 400)
                }

                let update = {
                    updated_at: Math.floor(Date.now() / 1000),
                    user_updated_id: empId,
                    is_delete: 0,
                }
                let totalMoneyBeforeDiscount = 0;

                if (date_quote) update.date_quote = date_quote;
                if (date_quote_end) update.date_quote_end = date_quote_end;
                if (status) update.status = status;
                if (id_customer) update.id_customer = id_customer;
                if (tax_code) update.tax_code = tax_code;
                if (address) update.address = address;
                if (phone_number) update.phone_number = phone_number;
                if (chance_id) update.chance_id = chance_id;
                if (introducer) update.introducer = introducer;
                if (product_list) {
                    let productArray = []
                    productArray = JSON.parse(product_list).map((productItem) => {
                        const productTotalMoney = productCalculation(Number(productItem.amount), Number(productItem.product_price), Number(productItem.product_discount_rate), Number(productItem.tax_rate))
                        totalMoneyBeforeDiscount += productTotalMoney
                        return {
                            ...productItem,
                            product_total_money: productTotalMoney
                        }
                    })
                    update.product_list = productArray

                    const discountRate = discount_rate ? Number(discount_rate) : Number(foundQuote.discount_rate);

                    update.total_money = Number((totalMoneyBeforeDiscount * (1 - discountRate * 1.0 / 100)).toFixed(2))
                }
                if (discount_rate) update.discount_rate = discount_rate;
                // if (discount_money) update.discount_money = discount_money;
                // if (total_money) update.total_money = total_money;
                if (terms_and_conditions) update.terms_and_conditions = terms_and_conditions;
                if (note) update.note = note;
                if (creator_name) update.creator_name = creator_name;
                if (ceo_name) update.ceo_name = ceo_name;
                if (description) update.description = description;
                if (use_system_info) update.use_system_info = Boolean(use_system_info);
                if (print_template_id) update.print_template_id = print_template_id

                await Quote.updateOne({ id: id, com_id: comId, is_delete: 0 }, { $set: update })

                history.addHistory(comId, empId, id, 'Sửa')

                return functions.success(res, "Cập nhật thành công")
            } else {
                return functions.setError(res, "Thiếu trường thuộc tính", 400);
            }
        } else {
            return functions.setError(res, "Bạn không có quyền", 400);
        }
    } catch (error) {
        console.log('Error: ', error);
        return functions.setError(res, error.message)
    }
}

// Chỉ cập nhật status
exports.updateStatus = async (req, res, next) => {
    try {
        const {
            id,
            status
        } = req.body

        let comId = 0, empId = 0;

        if (req.user.data.type == 1 || req.user.data.type == 2) {
            if (id && status) {
                comId = req.user.data.com_id;
                empId = req.user.data.idQLC;

                const foundQuote = await Quote.findOne({ id: id, com_id: comId, is_delete: 0 })
                if (!foundQuote) {
                    return functions.setError(res, "Báo giá không tồn tại", 400)
                }

                let update = {
                    updated_at: Math.floor(Date.now() / 1000),
                    user_updated_id: empId,
                    is_delete: 0,
                    status: status
                }

                await Quote.updateOne({ id: id, com_id: comId, is_delete: 0 }, { $set: update })

                history.addHistory(comId, empId, id, 'Cập nhật trạng thái')

                return functions.success(res, "Cập nhật trạng thái thành công")
            } else {
                return functions.setError(res, "Thiếu trường thuộc tính", 400);
            }
        } else {
            return functions.setError(res, "Bạn không có quyền", 400);
        }
    } catch (error) {
        console.log('Error: ', error);
        return functions.setError(res, error.message)
    }
}

// Xóa mềm
exports.delete = async (req, res, next) => {
    try {
        const { id } = req.body;
        let comId = 0

        if (req.user.data.type == 1 || req.user.data.type == 2) {
            if (id) {
                comId = req.user.data.com_id;
                empId = req.user.data.idQLC;

                const foundQuote = await Quote.findOne({ id: id, com_id: comId, is_delete: 0 })
                if (!foundQuote) {
                    return functions.setError(res, "Báo giá không tồn tại", 400)
                }

                let update = {
                    updated_at: Math.floor(Date.now() / 1000),
                    user_updated_id: empId,
                    is_delete: 1
                }

                await Quote.updateOne({ id: id, com_id: comId, is_delete: 0 }, { $set: update })

                history.addHistory(comId, empId, id, 'Xóa')

                return functions.success(res, "Xóa thành công")
            } else {
                return functions.setError(res, "Thiếu trường thuộc tính", 400);
            }
        } else {
            return functions.setError(res, "Bạn không có quyền", 400);
        }
    } catch (error) {
        console.log('Error: ', error);
        return functions.setError(res, error.message)
    }
}