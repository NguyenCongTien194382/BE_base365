const functions = require("../../../services/functions");
const customerService = require("../../../services/CRM/CRMservice");
const Potential = require("../../../models/crm/Potential/potentials");
const Customer = require("../../../models/crm/Customer/customer");
const diary_potential = require("../../../models/crm/Diary/diary_potential");
const exceljs = require("exceljs");
const {
  LIST_CITY,
  LIST_DISTRICT,
} = require("../../../services/CRM/data_address");
const Users = require("../../../models/Users");

const LIST_BUSINESS_TYPE = [
  { value: 1, label: "Công ty TNHH" },
  { value: 2, label: "Công ty Cổ phần " },
  { value: 3, label: "Công ty có vốn đầu tư nước ngoài" },
  { value: 4, label: "Doanh nghiệp tư nhân" },
  { value: 5, label: "Tổ chức chính phủ" },
  { value: 6, label: "Cửa hàng, trung tâm" },
  { value: 7, label: "Hợp tác xã" },
  { value: 8, label: "Công ty hợp danh" },
  { value: 9, label: "Đơn vị HCSN cấp trung ương" },
  { value: 10, label: "Đơn vị HCSN cấp Quận/Huyện" },
  { value: 11, label: "Khác" },
];

const getVocative = [
  { value: 1, label: "Anh" },
  { value: 2, label: "Chị" },
  { value: 3, label: "Ông" },
  { value: 4, label: "Bà" },
];

const getPotentialPosition = [
  { value: 1, label: "Chủ tịch" },
  { value: 2, label: "Phó chủ tịch" },
  { value: 3, label: "Tổng giám đốc" },
  { value: 4, label: "Phó tổng giám đốc" },
  { value: 5, label: "Giám đốc" },
  { value: 6, label: "kế toán trưởng" },
  { value: 7, label: "Trưởng phòng" },
  { value: 8, label: "Trợ lý" },
  { value: 9, label: "Nhân viên" },
];

const getPotentialResource = [
  { value: 1, label: "Facebook" },
  { value: 2, label: "Zalo" },
  { value: 3, label: "Website" },
  { value: 4, label: "Dữ liệu bên thứ 3" },
  { value: 5, label: "Khách hàng giới thiệu" },
  { value: 6, label: "Giới thiệu" },
  { value: 7, label: "Chăm sóc khách hàng" },
  { value: 8, label: "Email" },
];

const LIST_SECTOR = [
  { value: 1, label: "Thương mại" },
  { value: 2, label: "Dịch vụ" },
  { value: 3, label: "Sản xuất" },
  { value: 4, label: "Xây lắp" },
  { value: 5, label: "Công nghệ nhẹ" },
];

exports.addNewPotential = async (req, res) => {
  try {
    let {
      logo,
      vocative,
      stand_name,
      name,
      pos_id,
      department,
      private_phone,
      office_phone,
      office_email,
      private_email,
      resource,
      tax_code,
      classify,
      Facebook,
      Zalo,
      Twitter,
      Instagram,
      Telegram,
      Tiktok,
      Skype,
      Youtube,
      Linkedn,
      emp_id,

      gender,
      birthday,

      office,
      bank_account,
      bank_id,
      founding_date,
      business_type,
      sector,
      category,
      revenue,

      cit_id,
      district_id,
      ward,
      address,
      area_code,

      description,

      status,

      share_all,
      is_delete,
    } = req.body;
    let comId = "";
    let empId = "";

    let createDate = functions.getTimeNow();
    if (birthday) {
      birthday = functions.convertTimestamp(birthday);
    }
    if (founding_date) {
      founding_date = functions.convertTimestamp(founding_date);
    }
    if (req.user.data.type == 1 || req.user.data.type == 2) {
      comId = req.user.data.com_id;
      empId = req.user.data.idQLC;
      let linkDL = "";

      let potential_id = await functions.getMaxIdByField(
        Potential,
        "potential_id"
      );
      let cus_id = await functions.getMaxIdByField(Customer, "cus_id");

      if (logo) {
        const imageValidationResult = await customerService.validateImage(logo);
        if (imageValidationResult === true) {
          customerService.uploadFileCRM(cus_id, logo);
          linkDL = logo.name;
        } else {
          return functions.setError(
            res,
            "Định dạng ảnh không hợp lệ. Chỉ hỗ trợ định dạng JPEG, JPG, PNG, GIF và BMP.",
            400
          );
        }
      }
      const validationResult = customerService.validateCustomerInput(
        name,
        comId
      );

      if (validationResult) {
        const newSocial = {
          Facebook: Facebook ? Facebook : null,
          Instagram: Instagram ? Instagram : null,
          Zalo: Zalo ? Zalo : null,
          Telegram: Telegram ? Telegram : null,
          Twitter: Twitter ? Twitter : null,
          Tiktok: Tiktok ? Tiktok : null,
          Skype: Skype ? Skype : null,
          Youtube: Youtube ? Youtube : null,
          Linkedn: Linkedn ? Linkedn : null,
        };
        const data = new Potential({
          potential_id,
          pos_id,
          vocative,
          office,
          social: newSocial,
          office_email,
          private_email,
          private_phone,
          office_phone,
          status,
          category,
          classify,
          department,
          sector,
          user_create_id: req.user.data.idQLC,
          user_create_name: req.user.data.userName,
          cus_id,
        });

        let createCustomer = new Customer({
          cus_id: cus_id,
          email: private_email,
          name: name,
          stand_name: stand_name,
          phone_number: private_phone,
          birthday,
          cit_id: cit_id,
          logo: linkDL,
          district_id: district_id,
          ward: ward,
          address: address,
          resource: resource,
          description: description,
          tax_code: tax_code,
          status: status,
          business_type: business_type,
          classify: classify,
          company_id: comId,
          user_create_id: empId,
          bank_id: bank_id,
          bank_account: bank_account,
          founding_date: founding_date,
          revenue: revenue,
          gender: gender,
          share_all: share_all,
          type: 3,
          is_delete: is_delete || 0,
          created_at: createDate,
          emp_id,
          bill_area_code: area_code,
          potential_id,
        });

        const saveData = await data.save();
        await createCustomer.save();

        const idDiary = await diary_potential
          .find()
          .sort({ _id: -1 })
          .limit(1)
          .lean();
        const currentDate = new Date();
        const dateAsNumber = currentDate.getTime();
        const newDiary = new diary_potential({
          emp_id: req.user.data.idQLC,
          action: 3,
          id_action: saveData.potential_id,
          _id: idDiary?.length !== 0 ? Number(idDiary[0]?._id) + 1 : 1,
          create_at: dateAsNumber,
        });

        await newDiary.save();

        return functions.success(res, "Thêm mới tiềm năng thành công", {
          data: createCustomer,
        });
      }
      return functions.setError(res, "Không được bỏ trống trường 'name'", 400);
    } else {
      return functions.setError(res, "không có quyền truy cập", 400);
    }
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.updatePotential = async (req, res) => {
  try {
    let {
      cus_id,
      logo, //anh logo
      vocative, //xung ho
      stand_name, //ho ten dem
      name, //ten
      pos_id, //chuc danh
      department, //phong ban
      office_phone,
      private_phone,
      office_email, //email co quan
      private_email, //email ca nhan
      resource, //nguyen goc
      tax_code, //ma so thue
      classify, //loai tien nang
      //mang xa hoi
      facebook,
      zalo,
      twitter,
      instagram,
      telegram,
      tiktok,
      skype,
      youtube,
      linkedn,
      emp_id, //nhan vien phu trach
      gender, //gioi tinh
      birthday, //sn
      office, //to chuc
      bank_account, //tai khaong ngan hang
      bank_id, //id ngan hang
      founding_date, //ngay thanh lap
      business_type, //loai hinh
      sector, //linh vuc
      category, //nhanh nghe
      revenue, //doanh thu
      country, //quoc gia
      city_id, //tinh thanh
      district_id, //quan huyen
      ward, //xa phuong
      street, //so nha
      area_code, //ma vung
      address, //dia chi
      description, //mo ta
      status,
      share_all, //dung chung
    } = req.body;
    let time = functions.getTimeNow();
    birthday = functions.convertTimestamp(birthday);
    if (founding_date) {
      founding_date = functions.convertTimestamp(founding_date);
    }

    let comId = req.user.data.com_id;
    let empId = req.user.data.idQLC;
    let linkDL = "";
    const validationResult = customerService.validateCustomerInput(name, comId);
    if (validationResult && cus_id) {
      const newSocial = {
        Facebook: facebook ? facebook : null,
        Instagram: instagram ? instagram : null,
        Zalo: zalo ? zalo : null,
        Telegram: telegram ? telegram : null,
        Twitter: twitter ? twitter : null,
        Tiktok: tiktok ? tiktok : null,
        Skype: skype ? skype : null,
        Youtube: youtube ? youtube : null,
        Linkedn: linkedn ? linkedn : null,
      };
      let update_customer = await Customer.findOneAndUpdate(
        { company_id: comId, cus_id: cus_id },
        {
          email: private_email,
          name: name,
          stand_name: stand_name,
          phone_number: private_phone,
          birthday,
          cit_id: city_id,
          logo: linkDL,
          district_id: district_id,
          ward: ward,
          address: address,
          resource: resource,
          description: description,
          tax_code: tax_code,
          status: status,
          category: category,
          business_type: business_type,
          classify: classify,
          company_id: comId,
          user_create_id: empId,
          bank_id: bank_id,
          bank_account: bank_account,
          revenue: revenue,
          gender: gender,
          share_all: share_all,
          updated_at: time,
          emp_id,
          bill_area_code: area_code,
        },
        { new: true }
      );
      if (update_customer) {
        //cap nhat logo
        if (logo) {
          const imageValidationResult = await customerService.validateImage(
            logo
          );
          if (imageValidationResult === true) {
            customerService.uploadFileCRM(cus_id, logo);
            linkDL = logo.name;
          } else {
            return functions.setError(
              res,
              "Định dạng ảnh không hợp lệ. Chỉ hỗ trợ định dạng JPEG, JPG, PNG, GIF và BMP.",
              400
            );
          }
        }
        //cap nhat thong tin tiem nang
        let update_potential = await Potential.findOneAndUpdate(
          { potential_id: update_customer.potential_id },
          {
            category: category,
            pos_id,
            vocative,
            office,
            social: newSocial,
            office_email,
            private_email,
            private_phone,
            office_phone,
            status,
            classify,
            department,
            sector,
          },
          { new: true }
        );

        const idDiary = await diary_potential
          .find()
          .sort({ _id: -1 })
          .limit(1)
          .lean();
        const currentDate = new Date();
        const dateAsNumber = currentDate.getTime();
        const newDiary = new diary_potential({
          emp_id: req.user.data.idQLC,
          action: 0,
          id_action: update_potential.potential_id,
          _id: idDiary?.length !== 0 ? Number(idDiary[0]?._id) + 1 : 1,
          create_at: dateAsNumber,
        });

        await newDiary.save();

        return functions.success(res, "Chỉnh sửa tiềm năng thành công");
      }
      return functions.setError(res, "Missing input value!");
    }
    return functions.setError(res, "Missing input value", 400);
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.convertToCustomer = async (req, res) => {
  try {
    if (req.user.data.type == 1 || req.user.data.type == 2) {
      const { type_customer, cus_id } = req.body;
      if (!type_customer || !cus_id) {
        return functions.setError(res, "Điền thiếu trường", 400);
      } else {
        const checkType = await Customer.findOne({ cus_id: Number(cus_id) });
        if (checkType) {
          if (checkType?.type === 3) {
            const dataConverted = await Customer.findOneAndUpdate(
              {
                cus_id: Number(cus_id),
              },
              {
                type: Number(type_customer),
              }
            );
            return functions.success(
              res,
              "Convert potential to customer successfully"
            );
          } else {
            return functions.setError(res, "Không tồn tại tiềm năng này", 400);
          }
        }
        return functions.setError(
          res,
          "Không có khách hàng tiềm năng này",
          404
        );
      }
    } else {
      return functions.setError(res, "Không có quyền truy cập", 400);
    }
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.listPotential = async (req, res) => {
  try {
    let {
      page,
      pageSize,
      fromDate,
      toDate,
      name,
      business_type,
      sector,
      resource,
      user_create_id,
    } = req.body;
    let com_id = req.user.data.com_id;
    let idQLC = req.user.data.idQLC;
    let user_type = req.user.data.type;

    if (!page) page = 1;
    if (!pageSize) pageSize = 10;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;

    let condition = { company_id: com_id, type: 3, emp_id: { $ne: 0 } };
    let condition2 = {};

    // tu ngay den ngay
    fromDate = functions.convertTimestamp(fromDate);
    toDate = functions.convertTimestamp(toDate);
    if (fromDate && !toDate) condition.created_at = { $gte: fromDate };
    if (toDate && !fromDate) condition.created_at = { $lte: toDate };
    if (toDate && fromDate)
      condition.created_at = { $gte: fromDate, $lte: toDate };

    if (business_type) condition.business_type = Number(business_type);
    if (sector) condition2.sector = Number(sector);
    if (resource) condition.resource = Number(resource);
    if (name) condition.name = new RegExp(name, "i");
    if (user_create_id) condition.user_create_id = Number(user_create_id);
    let listPotential = await Customer.aggregate([
      { $match: { type: 3 } },
      { $match: condition },
      {
        $lookup: {
          from: "CRM_potential",
          localField: "potential_id",
          foreignField: "potential_id",
          as: "Potential",
        },
      },
      { $unwind: { path: "$Potential", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "City",
          localField: "cit_id",
          foreignField: "_id",
          as: "City",
        },
      },
      { $unwind: { path: "$City", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "District",
          localField: "district_id",
          foreignField: "_id",
          as: "District",
        },
      },
      { $unwind: { path: "$District", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "Users",
          localField: "emp_id",
          foreignField: "idQLC",
          as: "empDetails",
        },
      },
      { $unwind: { path: "$empDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          cus_id: "$cus_id",
          email: "$email",
          name: "$name",
          empName: "$empDetails.userName",
          stand_name: "$stand_name",
          phone_number: "$phone_number",
          birthday: "$birthday",
          cit_id: "$cit_id",
          logo: "$logo",
          district_id: "$district_id",
          ward: "$ward",
          address: "$address",
          resource: "$resource",
          description: "$description",
          tax_code: "$tax_code",
          status: "$status",
          category: "$category",
          business_type: "$business_type",
          classify: "$classify",
          company_id: "$company_id",
          user_create_id: "$user_create_id",
          bank_id: "$bank_id",
          bank_account: "$bank_account",
          revenue: "$revenue",
          gender: "$gender",
          share_all: "$share_all",
          type: "$type",
          is_delete: "$is_delete",
          created_at: "$created_at",
          emp_id: "$emp_id",
          bill_area_code: "$bill_area_code",
          potential_id: "$potential_id",

          pos_id: "$Potential.pos_id",
          vocative: "$Potential.vocative",
          office: "$Potential.office",
          social: "$Potential.social",
          office_email: "$Potential.office_email",
          private_email: "$Potential.private_email",
          private_phone: "$Potential.private_phone",
          office_phone: "$Potential.office_phone",
          status: "$Potential.status",
          classify: "$Potential.classify",
          department: "$Potential.department",
          sector: "$Potential.sector",
          user_create_name: "$Potential.user_create_name",
          city_name: "$City.name",
          district_name: "$District.name",
        },
      },
      { $match: condition2 },
      { $sort: { updatedAt: -1 } },
      { $skip: skip },
      { $limit: pageSize },
    ]);
    // let total = await functions.findCount(Customer, condition);

    let total = await Customer.aggregate([
      { $match: condition },
      {
        $lookup: {
          from: "CRM_potential",
          localField: "potential_id",
          foreignField: "potential_id",
          as: "Potential",
        },
      },
      { $unwind: { path: "$Potential", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          sector: "$Potential.sector",
        },
      },
      { $match: condition2 },
      {
        $count: "count",
      },
    ]);
    total = total.length != 0 ? total[0].count : 0;

    let data = await customerService.getListCanAccess(
      user_type,
      idQLC,
      listPotential
    );
    return functions.success(res, "get list potential success:", {
      total: total - data[0],
      data: data[1],
    });
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.deletePotential = async (req, res) => {
  try {
    const { cus_id } = req.body;
    let com_id = req.user.data.com_id;
    let idQLC = req.user.data.idQLC;

    if (!cus_id) {
      return functions.setError(res, "Missing value cus_id");
    }

    const dataDel = await Customer.findOneAndUpdate(
      { cus_id, type: 3, company_id: com_id },
      { $set: { is_delete: 1 } },
      { new: true }
    );

    if (!dataDel) {
      return functions.setError(res, "Customer not found or unable to delete");
    }

    const idDiary = await diary_potential
      .find()
      .sort({ _id: -1 })
      .limit(1)
      .lean();
    const currentDate = new Date();
    const dateAsNumber = currentDate.getTime();
    const newDiary = new diary_potential({
      emp_id: req.user.data.idQLC,
      action: 1,
      id_action: dataDel.potential_id,
      _id: idDiary?.length !== 0 ? Number(idDiary[0]?._id) + 1 : 1,
      create_at: dateAsNumber,
    });

    await newDiary.save();

    return res
      .status(200)
      .json({ success: true, message: "Customer deleted successfully" });
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.addPotentialFromFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const { type = 1, is_update_empty = false, emp_id = 0 } = req.body;

  const getIdCity = (value) => {
    return LIST_CITY.filter((item) => item.label === value)?.[0]?.value || null;
  };

  const getIdDistric = (value) => {
    return (
      LIST_DISTRICT.filter((item) => item.label === value)?.[0]?.value || null
    );
  };

  let potential_id = await functions.getMaxIdByField(Potential, "potential_id");
  let cus_id = await functions.getMaxIdByField(Customer, "cus_id");

  const buffer = req.file.buffer;

  const workbook = new exceljs.Workbook();
  workbook.xlsx
    .load(buffer)
    .then(async (workbook) => {
      const result = [];

      workbook.eachSheet((worksheet) => {
        const sheetData = [];
        const headerRow = worksheet.getRow(1).values;

        worksheet.eachRow((row, rowNumber) => {
          // Skip the header row
          if (rowNumber === 1) return;

          const rowData = {};
          row.values.forEach((value, index) => {
            rowData[headerRow[index]] = !value ? null : value;
          });

          sheetData.push(rowData);
        });

        result.push({ sheetName: worksheet.name, data: sheetData });
      });

      const getUpdatePotentialData =
        result[0]?.data?.map((item, i) => {
          return {
            office_email: item?.["Email cá nhân"] || null,
            private_email: item?.["Email cá nhân"] || null,
            private_phone: item?.["Điện thoại cá nhân"] || null,
            office_phone: item?.["Điện thoại cơ quan"] || null,
            sector: item?.["Lĩnh vực"],
            pos_id:
              getPotentialPosition?.filter(
                (el) => el.label === item?.["Chức danh"]
              )[0]?.value || 0,
            vocative:
              getVocative?.filter((el) => el.label === item?.["Xưng hô"])[0]
                ?.value || 0,
          };
        }) || {};

      const updatedCustomerData =
        result[0]?.data?.map(async (item, i) => {
          let listEmp = [];
          if (!emp_id) {
            listEmp = await Users.find(
              { userName: item?.["Nhân viên phụ trách"] },
              { idQLC: 1, _id: 0, userName: 1 }
            ).lean();
          }
          return {
            email: item?.["Email cá nhân"] || null,
            phone_number: item?.["Điện thoại cá nhân"] || null,
            address: item?.["Địa chỉ"] || null,
            business_type:
              LIST_BUSINESS_TYPE?.filter(
                (item) => item.label === item?.["Loại hình"]
              )?.[0] || 0,
            name: item?.["Họ và tên"],
            cit_id: getIdCity(item?.["Tỉnh/Thành phố"]?.trim()),
            district_id: getIdDistric(item?.["Quận/Huyện"]?.trim()),
            ward: item?.["Phường xã"] || null,
            description: item?.["Mô tả"],
            resource:
              getPotentialResource?.filter(
                (el) => el?.label === item?.["Nguồn gốc"]
              )[0]?.value || 0,
            emp_id: emp_id
              ? emp_id
              : listEmp?.filter(
                (item) => item?.userName === item?.["Nhân viên phụ trách"]
              )[0]?.userName || null,
          };
        }) || {};

      const getUpdateCustomerlData = await Promise.all(updatedCustomerData);

      if (type == 1) {
        const newDataPotential = result[0]?.data?.map((item, i) => {
          const data = new Potential({
            potential_id: potential_id + i,
            cus_id: cus_id + i,
            ...getUpdatePotentialData[i],
          });

          return data.save();
        });

        const newDataCus = result[0]?.data?.map((item, i) => {
          const data = new Customer({
            cus_id: cus_id + i,
            potential_id: potential_id + i,
            ...getUpdateCustomerlData[i],
          });
          return data.save();
        });

        await Promise.all(newDataPotential);
        await Promise.all(newDataCus);
      } else if (type == 2) {
        // Update
        if (is_update_empty == true) {
          const newDataPotential = result[0]?.data?.map((item, i) => {
            return Potential.findOneAndUpdate(
              { potential_id: Number(item?.["Mã tiềm năng"]) },
              {
                $set: getUpdatePotentialData[i],
              }
            );
          });

          const newDataCus = result[0]?.data?.map((item, i) => {
            return Customer.findOneAndUpdate(
              {
                potential_id: Number(item?.["Mã tiềm năng"]),
                company_id: req.user.data.com_id,
              },
              {
                $set: getUpdateCustomerlData[i],
              }
            );
          });

          await Promise.all(newDataPotential);
          await Promise.all(newDataCus);
        } else {
          const newDataPotential = result[0]?.data?.map((item, i) => {
            const updateObject = getUpdatePotentialData[i];

            Object.keys(updateObject).forEach(
              (key) =>
                updateObject[key] === null &&
                updateObject[key] === 0 &&
                delete updateObject[key]
            );

            return Potential.findOneAndUpdate(
              { potential_id: Number(item?.["Mã tiềm năng"]) },
              {
                $set: updateObject,
              }
            );
          });

          const newDataCus = result[0]?.data?.map((item, i) => {
            const updateObject = getUpdateCustomerlData[i];

            Object.keys(updateObject).forEach(
              (key) =>
                updateObject[key] === null &&
                updateObject[key] === 0 &&
                delete updateObject[key]
            );

            return Customer.findOneAndUpdate(
              {
                potential_id: Number(item?.["Mã tiềm năng"]),
                company_id: req.user.data.com_id,
              },
              {
                $set: updateObject,
              }
            );
          });
          await Promise.all(newDataPotential);
          await Promise.all(newDataCus);
        }
      } else if (type == 3) {
        // Both
        if (is_update_empty == true) {
          const newDataPotential = result[0]?.data?.map((item, i) => {
            return {
              updateOne: {
                filter: { potential_id: Number(item?.["Mã tiềm năng"]) },
                update: {
                  $set: getUpdatePotentialData[i],
                  $setOnInsert: {
                    potential_id: potential_id + i,
                    cus_id: cus_id + i,
                  },
                },
                upsert: true,
              },
            };
          });

          const newDataCus = result[0]?.data?.map((item, i) => {
            return {
              updateOne: {
                filter: { potential_id: Number(item?.["Mã tiềm năng"]) },
                update: {
                  $set: getUpdateCustomerlData[i],
                  $setOnInsert: {
                    cus_id: cus_id + i,
                    company_id: req.user.data.com_id,
                    potential_id: potential_id + i,
                  },
                },
                upsert: true,
              },
            };
          });

          await Potential.bulkWrite(newDataPotential);
          await Customer.bulkWrite(newDataCus);
        } else {
          const newDataPotential = result[0]?.data?.map((item, i) => {
            const updateObject = getUpdatePotentialData[i];

            // Remove properties with null values
            Object.keys(updateObject).forEach(
              (key) =>
                updateObject[key] === null &&
                updateObject[key] === 0 &&
                delete updateObject[key]
            );

            return {
              updateOne: {
                filter: { potential_id: Number(item?.["Mã tiềm năng"]) },
                update: {
                  $set: updateObject,
                  $setOnInsert: {
                    potential_id: potential_id + i,
                    cus_id: cus_id + i,
                  },
                },
                upsert: true,
              },
            };
          });

          const newDataCus = result[0]?.data?.map((item, i) => {
            const updateObject = getUpdatePotentialData[i];
            // Remove properties with null values
            Object.keys(updateObject).forEach(
              (key) =>
                updateObject[key] === null &&
                updateObject[key] === 0 &&
                delete updateObject[key]
            );
            return {
              updateOne: {
                filter: {
                  potential_id: Number(item?.["Mã tiềm năng"]),
                  company_id: req.user.data.com_id,
                },
                update: {
                  $set: updateObject,
                  $setOnInsert: {
                    cus_id: cus_id + i,
                    company_id: req.user.data.com_id,
                    potential_id: potential_id + i,
                  },
                },
                upsert: true,
              },
            };
          });

          await Potential.bulkWrite(newDataPotential);
          await Customer.bulkWrite(newDataCus);
        }
      }

      res.status(200).json({ result });
    })
    .catch((error) => {
      console.error("Error reading Excel file:", error);
      res.status(500).send("Internal Server Error");
    });
};
