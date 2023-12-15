const functions = require("../../../services/functions");
const crmService = require("../../../services/CRM/CRMservice");
const Potential = require("../../../models/crm/Potential/potentials");
const Customer = require("../../../models/crm/Customer/customer");
const PotentialCampaign = require("../../../models/crm/campaign_customer");
const EmailSms = require("../../../models/crm/EmailSms");
const FormEmail = require("../../../models/crm/FormEmail");
const EmailPersonal = require("../../../models/crm/EmailPersonal");
const EmailSystem = require("../../../models/crm/EmailSystem");

exports.createEmail = async(req, res) => {
  try{
    let {supplier, name, all_receiver, list_receiver, email_reply, campaign_id, email_id, title, content, info_system, date_send_email, time_send_email} = req.body;
    let com_id = req.user.data.com_id;
    let user_id = req.user.data.idQLC;
    let type = req.user.data.type;
    let time = functions.convertTimestamp(Date.now());
    //1 -> ca nhan 2-> he thong
    if(supplier && title && content) {
      let email_supplier;
      if(supplier==1) {
        email_supplier = await EmailPersonal.findOne({com_id: com_id});
      }else if(supplier==2) {
        email_supplier = await  EmailSystem.findOne({com_id: com_id});
      }
      if(email_supplier) {
        // return functions.setError(res, "Chua cai dat email ca nhan gui!");
        let server_mail = email_supplier.server_mail;
        let port_number = email_supplier.port_number;
        let method_security = email_supplier.method_security ? true: false;
        let address_send_mail = email_supplier.address_send_mail;
        let name_mail = email_supplier.name_mail;
        let name_login = email_supplier.name_login;
        let password = email_supplier.password;

        let email_sample = await FormEmail.findOne({_id: Number(email_id)});
        if(email_sample) {
          title = email_sample.title_form_email;
          content = email_sample.content_form_email;
        }

        //lay ra danh sach nguoi nhan
        let list_customer = await Customer.find({company_id: com_id}, {cus_id: 1, email: 1});
        let arr_email_receiver = [];
        if(all_receiver==1) {
          if(list_customer && list_customer.length>0) {
            for(let i=0; i<list_customer.length; i++) {
              let email_customer = list_customer[i].email;
              if(email_customer && !arr_email_receiver.includes(email_customer)) arr_email_receiver.push(email_customer);
            }
          }
        }
        if(list_receiver && list_receiver.length>0) {
          for(let i=0; i<list_receiver.length; i++) {
            for(let j=0; j<list_customer.length; j++) {
              let email_customer = list_customer[j].email;
              if(list_customer[j].cus_id == list_receiver[i] && email_customer && !arr_email_receiver.includes(email_customer)) {
                arr_email_receiver.push(email_customer);
                break;
              }
            }
          }
        }
        let checkEmail = functions.checkEmail(email_reply);
        if(checkEmail) arr_email_receiver.push(email_reply);

        let time_send = new Date(Date.now());
        let status = 0;
        //mac dinh gui luon, info_system==2 -> gui theo ke hoach
        if(info_system==2) {
          time_send = crmService.createDateWithDateAndTime(date_send_email, time_send_email);
          crmService.cronJobSendEmail(server_mail, port_number, method_security, name_login, password);
        }else {
          status = 1;
          let send_email = await crmService.sendEmail(server_mail, port_number, method_security, name_login, password, arr_email_receiver, title, content);
        }
        // host, port, secure, user, pass, email_receiver, title, content

        list_receiver = list_receiver.join(", ");
        let new_id = await functions.getMaxIdByField(EmailSms, '_id');
        let new_email = new EmailSms({
          _id: new_id,
          company_id: com_id,
          type: 1,
          name: name,
          supplier: supplier,
          all_receiver: all_receiver,
          list_receiver: list_receiver,
          email_reply: email_reply,
          email_send: name_login,
          campaign_id: campaign_id,
          email_id: email_id,
          title: title,
          content: content,
          info_system: info_system,
          date_send_email: functions.convertTimestamp(date_send_email),
          time_send_email: time_send_email,
          created_at: time,
          user_create_id: user_id,
          user_create_type: type,
          status: status,
          send_time: functions.convertTimestamp(time_send),
          list_email_receiver: arr_email_receiver.join(", ")
        });
        await new_email.save();
        
        return functions.success(res, "Create email success!");
      }
      return functions.success(res, "Chua cai dat email de gui!", 400);
    }
    return functions.success(res, "Missing input value!", 400);
  }catch(error) {
    return functions.setError(res, error.message);
  }
}

//------------------------------mau sms

exports.createSampleEmail = async(req, res, next) => {
  try{
    let {name_form_email, title_form_email, content_form_email} = req.body;
    if(name_form_email && title_form_email && content_form_email) {
      let com_id = req.user.data.com_id;
      let user_id = req.user.data.idQLC;
      let user_type = req.user.data.type;
      let time = functions.convertTimestamp(Date.now());
      let new_id = await functions.getMaxIdByField(FormEmail, '_id');
      let new_sample_email = new FormEmail({
        _id: new_id,
        com_id: com_id,
        name_form_email: name_form_email,
        title_form_email: title_form_email,
        content_form_email: content_form_email,
        user_create_id: user_id,
        user_create_type: user_type,
        created_at: time,
        updated_at: time
      });
      new_sample_email = await new_sample_email.save();
      if(new_sample_email) {
        return functions.success(res, "Create sample email success");
      }
      return functions.setError(res, "Create sample email fail!");
    }
    return functions.setError(res, "Missing input value!", 400);
  }catch(error) {
    return functions.setError(res, error.message);
  }
}

exports.updateSampleEmail = async(req, res, next) => {
  try{
    let {id_email, name_form_email, title_form_email, content_form_email} = req.body;
    if(id_email && name_form_email && title_form_email && content_form_email) {
      let com_id = req.user.data.com_id;
      let user_id = req.user.data.idQLC;
      let user_type = req.user.data.type;
      let time = functions.convertTimestamp(Date.now());

      let update_email = await FormEmail.findOneAndUpdate({_id: Number(id_email), com_id: com_id}, {
        name_form_email: name_form_email,
        title_form_email: title_form_email,
        content_form_email: content_form_email,
        user_edit_id: user_id,
        user_edit_type: user_type,
        updated_at: time
      }, {new: true});
      
      if(update_email) {
        return functions.success(res, "Update sample email success");
      }
      return functions.setError(res, "Sample email not found!");
    }
    return functions.setError(res, "Missing input value!", 400);
  }catch(error) {
    return functions.setError(res, error.message);
  }
}

exports.listSampleEmail = async(req, res, next) => {
  try{
    let {id_email, name_form_email, page, pageSize} = req.body;
    if(!page) page = 1;
    if(!pageSize) pageSize = 10;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page-1)*pageSize;

    let com_id = req.user.data.com_id;
    let condition = {com_id: com_id, is_delete: 0};
    if(id_email) condition._id = Number(id_email);
    if(name_form_email) condition.name_form_email = new RegExp(name_form_email, 'i');

    let listSampleEmail = await FormEmail.aggregate([
      {$match: condition},
      {$sort: {created_at: -1}},
      {$skip: skip},
      {$limit: pageSize},
      {
        $lookup: {
          from: "Users",
          localField: 'user_create_id',
          foreignField: 'idQLC',
          let: { userTypeId: "$user_create_type" },
          pipeline: [
            { 
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$idQLC", 0] },
                    { $ne: ["$idQLC", null] },
                    { $eq: ["$type", "$$userTypeId"] }
                  ]
                }
              },
            },
            {$project: {_id: 0, userName: 1}}
          ],
          as: 'Creator'
        }
      },
      {$unwind: { path: "$Creator", preserveNullAndEmptyArrays: true }},

      {
        $lookup: {
          from: "Users",
          localField: 'user_edit_id',
          foreignField: 'idQLC',
          let: { userTypeId: "$user_edit_type" },
          pipeline: [
            { 
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$idQLC", 0] },
                    { $ne: ["$idQLC", null] },
                    { $eq: ["$type", "$$userTypeId"] }
                  ]
                }
              },
            },
            {$project: {_id: 0, userName: 1}}
          ],
          as: 'Editor'
        }
      },
      {$unwind: { path: "$Editor", preserveNullAndEmptyArrays: true }},
      {
        $project: {
          "_id": "$_id", 
          "com_id": "$com_id", 
          "name_form_email": "$name_form_email", 
          "title_form_email": "$title_form_email", 
          "content_form_email": "$content_form_email", 
          "user_create_id": "$user_create_id", 
          "user_create_type": "$user_create_type", 
          "user_edit_id": "$user_edit_id", 
          "user_edit_type": "$user_edit_type", 
          "is_delete": "$is_delete", 
          "created_at": "$created_at", 
          "updated_at": "$updated_at", 
          "name_user_create": "$Creator.userName",
          "name_user_edit": "$Editor.userName",
        }
      },
    ]); 
    let total = await functions.findCount(FormEmail, condition);
    return functions.success(res, "get list sample email success: ", {total, data: listSampleEmail});
  }catch(error) {
    return functions.setError(res, error.message);
  }
}