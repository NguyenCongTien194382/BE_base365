const functions = require("../../../services/functions");
const Notification = require("../../../models/crm/notify");
exports.createNotification = async (req, res) => {
  try {
    console.log('tesst')
    let createDate = functions.getTimeNow();
    const { notify_type, target_id, link, message } = req.body;
    let _id = await functions.getMaxIdByField(Notification, "_id");
    const createNotifi = new Notification({
      _id: _id,
      notify_type: notify_type,
      target_id: target_id,
      link: link,
      message: message,
      created_at: createDate,
    });
    await createNotifi.save();
    return functions.success(res, "create notification success:", {
      data: null,
    });
  } catch (err) {
    return functions.setError(res, err.message);
  }
};
exports.listNotification = async (req, res) => {
  try {
    const idQLC = req.user.data.idQLC;
    let { page, pageSize, notify_type } = req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 20;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;
    const condition = {
      target_id: idQLC,
      ...(notify_type && { notify_type: notify_type }),
    };
    console.log(condition);
    const listNotification = await Notification.find(condition)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(pageSize);
    const countUnread = await Notification.countDocuments({
      target_id: idQLC,
      read: false,
    });
    return functions.success(res, "get list notification success:", {
      countUnread: countUnread,
      data: listNotification,
    });
  } catch (err) {
    console.log(err);
    return functions.setError(res, err.message);
  }
};
exports.readOneNotification = async (req, res) => {
  try {
    const { idNotification } = req.body;
    if (!idNotification) {
      return functions.setError(res, "Missing value idNotication");
    }
    const updateRead = await Notification.findOneAndUpdate(
      { _id: idNotification },
      { $set: { read: true } }
    );
    return functions.success(res, "Read notification successfully!", {
      data: null,
    });
  } catch (err) {
    return functions.setError(res, err.message);
  }
};
exports.readAllNotification = async (req, res) => {
  try {
    const updateAllRead = await Notification.updateMany(
      { target_id: req.user.data.idQLC, read: false },
      { $set: { read: true } }
    );
    return functions.success(res, "Read all notification successfully!", {
      data: null,
    });
  } catch (err) {
    return functions.setError(res, err.message);
  }
};
exports.deleteNotification = async (req, res) => {
  try {
    const { idNotication } = req.body;

    if (!idNotication) {
      return functions.setError(res, "Missing input value", 400);
    }

    const deleteNotification = await Notification.findOneAndDelete({
      _id: Number(idNotication),
    });

    if (!deleteNotification) {
      return functions.setError(res, "Product not found", 404);
    }

    return functions.success(res, "Delete product successfully!", {
      data: null,
    });
  } catch (error) {
    return functions.setError(res, error.message);
  }
};
