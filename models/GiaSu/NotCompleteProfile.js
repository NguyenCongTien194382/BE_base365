const mongoose = require("mongoose");
const not_complete_profile = new mongoose.Schema({

    profile_id :{
        type : Number, 
        required: true,
        unique: true,
        autoIncrement: true
    },
    user_name :{
        type : String, 
        default : null
    },
    user_phone :{
        type : String, 
        default : null
    },
    user_email :{
        type : String, 
        default : null
    },
    user_address :{
        type : String, 
        default : null
    },
    user_type :{
        type : Number, 
    },
    ugs_gender :{
        type : Number, 
        default : null
    },
    ugs_brithday :{
        type : Date, 
        default : null
    },
    ugs_marriage :{
        type : Number, 
        default : null
    },
    ugs_tutor_style :{
        type : String, 
        default : null
    },
    ugs_class_teach :{
        type : String, 
        default : null
    },
    ugs_school :{
        type : String, 
    },
    ugs_graduation_year :{
        type : Number, 
        default : null
    },
    ugs_specialized :{
        type : String, 
        default : null
    },
    ugs_city_gs :{
        type : Number, 
        default : null
    },
    ugs_county_gs :{
        type : Number, 
        default : null
    },
    ugs_workplace :{
        type : String, 
    },
    ugs_about_us :{
        type : String, 
    },
    ugs_experience_year :{
        type : Number, 
        default : null
    },
    ugs_achievements :{
        type : String, 
    },
    ugs_city :{
        type : String, 
        default : null
    },
    ugs_county :{
        type : String, 
        default : null
    },
    as_id :{
        type : String, 
        default : null
    },
    as_detail :{
        type : String, 
        default : null
    },
    created_at :{
        type : String, 
        default : null
    },
    source :{
        //1: web. 2: app'
        type : Number, 
        default : 1
    },

}, {
    collection: "GS_not_complete_profile",
    versionKey: false,
}
);
module.exports = mongoose.model("GS_not_complete_profile", not_complete_profile);