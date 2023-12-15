const functions = require('../../../services/functions');
const crmServices = require('../../../services/CRM/CRMservice');
const EmailPersonal = require('../../../models/crm/EmailPersonal');
const SmsSetting = require('../../../models/crm/SmsSetting');
const md5 = require('md5');

exports.settingEmail = async(req, res, next) => {
  try{
    let {host, port, email, name, user, pass, secure, number_email_sent, time_send_mail} = req.body;
    if(host && port && email && name && user && pass) {
      if(!secure) secure = false;
      else secure = true;
      let com_id = req.user.data.com_id;
      let time = functions.convertTimestamp(Date.now());
      let checkConnectEmail = await crmServices.checkConnectEmail(host, port, email, user, pass, secure);
      if(checkConnectEmail) {
        let new_id = await functions.getMaxIdByField(EmailPersonal, '_id');
        let new_email = new EmailPersonal({
          _id:new_id,
          com_id: com_id,
          server_mail: host,
          port_number: port,
          address_send_mail: email,
          name_mail: name,
          name_login: user,
          password: pass,
          method_security: secure,
          number_email_sent: number_email_sent,
          time_send_mail: time_send_mail,
          created_at: time,
          updated_at: time,
          is_delete: 0,
        });
        await new_email.save();
        return functions.success(res, "Connect email success");
      }
      return functions.setError(res, "Connect email fail");
    }
    return functions.setError(res, "Missing input value!", 400);
  }catch(error) {
    return functions.setError(res, error.message);
  }
}

exports.settingSms = async(req, res, next) => {
  try{
    let {account, password, brand_name, cp_code, so_du} = req.body;
    if(account && password && brand_name) {
      let com_id = req.user.data.com_id;
      let time = functions.convertTimestamp(Date.now());

      let checkConnectEmail = true;
      // let checkConnectEmail = await crmServices.checkConnectEmail(host, port, email, user, pass, secure);
      if(checkConnectEmail) {
        let new_id = await functions.getMaxIdByField(SmsSetting, '_id');
        let new_sms_setting = new SmsSetting({
          _id:new_id,
          com_id: com_id,
          type: 1,
          account: account,
          password: password,
          brand_name: brand_name,
          cp_code: cp_code,
          so_du: so_du,
          created_at: time,
          updated_at: time,
          is_delete: 0
        });
        await new_sms_setting.save();
        return functions.success(res, "Connect sms server success");
      }
      return functions.setError(res, "Connect sms server fail");
    }
    return functions.setError(res, "Missing input value!", 400);
  }catch(error) {
    return functions.setError(res, error.message);
  }
}