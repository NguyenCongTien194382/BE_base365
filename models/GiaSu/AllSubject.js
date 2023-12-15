const mongoose = require("mongoose");
const all_subject = new mongoose.Schema({
   // môn học
    as_id : {
        type : Number, 
        required: true,
        unique: true,
        autoIncrement: true
    },
    as_name : {
        type : String, 
        
    },
    as_alias : {
        type : String, 
        
    },
    as_parent : {
        type : Number, 
        default : 0
        
    },
    ls_parent1 : {
        type : Number, 
        default : 0
        
    },
    ls_parent2 : {
        type : Number, 
        default : 0
        
    },
    active_class : {
        type : Number, 
        default : 0
        
    },
    active_teach : {
        type : Number, 
        default : 0
        
    },

}, {
    collection: "GS_all_subject",
    versionKey: false,
}
);
module.exports = mongoose.model("GS_all_subject", all_subject);