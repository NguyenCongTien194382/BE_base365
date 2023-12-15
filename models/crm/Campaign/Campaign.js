//Bảnh mô tả chiến dịch
const mongoose = require('mongoose')

const Campaign = new mongoose.Schema({
    _id : {
        type : Number,
        require : true
    },
    groupID : {
        type : Number,
        default: 0
    },
    nameCampaign : {
        type : String,
        default: null
    },
    typeCampaign : {
        type : Number,
        default: 1
    },
    timeStart : {
        type : Number,
        default: 0
    },
    timeEnd : {
        type : Number,
        default: 0
    },
    money : {
        type : Number,
        default: 0
    },
    expectedSales : { // dự kiến bán hàng 
        type : Number,
        default: 0
    },
    chanelCampaign : {// kênh bán 
        type : Number,
        default: 1
    },
    investment : {
        type : Number,
        default: 0
    },
    empID : {
        type : Number,
        default: 0
    },
    description : {
        type : String,
        default: null
    },
    shareAll : {
        type : Number,
        default: 0
    },
    companyID : {
        type : Number,
        default: 0
    },
    countEmail : {
        type : Number,
        default: null
    },
    status : {
        type : Number,
        default: 1
    },
    type : {
        type : Number,
        default: 1
    },
    userIdCreate : {
        type : Number,
        default: 0
    },
    userIdUpdate : {
        type : Number,
        default: 0
    },
    site : {
        type : Number,
        default: null
    },
    is_delete : {
        type : Number,
        default : 0,
    },

    hidden_null : {//chưa rõ
        type : Number,
        default: null
    },
    createdAt : {
        type : Number,
        default: null
    },
    updatedAt : {
        type : Number,
        default: null
    },

},
{
    collection: 'CRM_Campaign',
    versionKey: false,
    timestamp: true
})
module.exports = mongoose.model("CRM_Campaign" , Campaign)

