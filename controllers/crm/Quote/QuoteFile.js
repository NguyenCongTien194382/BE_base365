const QuoteFile = require('../../../models/crm/Quote/QuoteFile')
const functions = require('../../../services/functions');
const crmService = require("../../../services/CRM/CRMservice");
const Users = require('../../../models/Users')

exports.createQuoteFile = async (req, res) => {
    try {
        let { quote_id } = req.body;
        let user_id = req.user.data.idQLC;
        if (quote_id) {
            if (req.files && req.files.document) {
                let file = req.files.document;
                let check_file = await crmService.checkFile(file.path);
                if (check_file) {
                    let time = functions.convertTimestamp(Date.now());
                    let file_size = file.size;
                    let file_name = await crmService.uploadFile("quote_file", time, file);
                    let original_name = file.originalFilename
                    let new_id = await functions.getMaxIdByField(QuoteFile, "id");
                    let new_file = new QuoteFile({
                        id: new_id,
                        file_name: file_name,
                        original_name: original_name,
                        quote_id: quote_id,
                        user_created_id: user_id,
                        file_size: file_size,
                        created_at: time,
                    })
                    await new_file.save();
                    return functions.success(res, "Create attachment success!");
                }
                return functions.setError(res, "Invalid file!", 400);
            }
            return functions.setError(res, "Missing input file!", 400);
        }
        return functions.setError(res, "Missing input quote_id!", 400);
    } catch (error) {
        console.log('Error: ', error);
        return functions.setError(res, error.message)
    }
}

exports.listQuoteFile = async (req, res) => {
    try {
        let {
            quote_id,
            fromDate,
            toDate,
            file_name,
            page,
            pageSize = 10,
        } = req.body;
        if (quote_id) {
            quote_id = Number(quote_id);
            if (!page) page = 1;
            if (!pageSize) pageSize = 10;
            page = Number(page);
            pageSize = Number(pageSize);
            const skip = (page - 1) * pageSize;

            let condition = { quote_id: quote_id };
            // tu ngay den ngay
            fromDate = functions.convertTimestamp(fromDate);
            toDate = functions.convertTimestamp(toDate);
            if (fromDate && !toDate) condition.created_at = { $gte: fromDate };
            if (toDate && !fromDate) condition.created_at = { $lte: toDate };
            if (toDate && fromDate)
                condition.created_at = { $gte: fromDate, $lte: toDate };

            if (file_name) condition.file_name = new RegExp(file_name, "i");

            let data = await QuoteFile.find(condition)
                .sort({ created_at: -1, file_name: 1 })
                .populate({
                    path: 'user_created_id',
                    model: Users,
                    localField: 'user_created_id',
                    foreignField: 'idQLC',
                    options: { lean: true },
                    select: 'userName avatarUser'
                })

            const total = await QuoteFile.countDocuments(condition);

            // for (let i = 0; i < data.length; i++) {
            //     data[i].linkFile = crmService.getLinkFile(
            //         "quote_file",
            //         data[i].created_at,
            //         data[i].file_name
            //     );
            // }
            data = data.map((item) => ({
                ...item._doc,
                linkFile: crmService.getLinkFile(
                    "quote_file",
                    item.created_at,
                    item.file_name
                )
            }))

            return functions.success(res, "List attachments",
                {
                    data: data,
                    current_page: page,
                    total_pages: Math.ceil(total * 1.0 / pageSize),
                    total: total
                })
        }
        return functions.setError(res, "Missing input quote_id!", 400);
    } catch (error) {
        console.log('Error: ', error);
        return functions.setError(res, error.message)
    }
}

exports.deleteQuoteFile = async (req, res) => {
    try {
        let { id } = req.body;
        if (id) {
            id = Number(id);
            let attachment = await QuoteFile.findOne({ id: id });
            if (attachment) {
                await crmService.deleteFile(
                    "quote_file",
                    attachment.created_at,
                    attachment.file_name
                );
                await QuoteFile.findOneAndDelete({ id: id });
                return functions.success(res, "Delete doc for quote success!");
            }
            return functions.setError(res, "Attachment not found!", 404);
        }
        return functions.setError(res, "Missing input id!", 400);
    } catch (error) {
        console.log('Error: ', error);
        return functions.setError(res, error.message)
    }
}