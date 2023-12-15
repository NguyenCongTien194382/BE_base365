var express = require('express');
var router = express.Router();
const kpi = require('../../controllers/tools/kpi')

//API CommentFilePath
router.post('/toolCommentFilePath', kpi.toolCommentFilePath);

//API TargetUnit
router.post('/toolTargetUnit', kpi.toolTargetUnit);

//API Settings
router.post('/toolSettings', kpi.toolSettings);

//API ResultHistory
router.post('/toolResultHistory', kpi.toolResultHistory);

//API Result
router.post('/toolResult', kpi.toolResult);

//API Notification
router.post('/toolNotification', kpi.toolNotification);

router.get("/toolActivityDiary", kpi.activityDiary);
router.get("/toolAssess", kpi.assess);
router.get("/toolBonus", kpi.bonus);
router.get("/toolBonusdetail", kpi.bonusdetail);
router.get("/toolComment", kpi.comment);
router.get("/toolConfigassess", kpi.configassess);
router.get("/toolConnectchannel", kpi.connectchannel);
router.get("/toolDecentralization", kpi.decentralization);
router.get("/toolDeleteddata", kpi.deleteddata);
router.get("/toolDepartment", kpi.department);
router.get("/toolGroup", kpi.group);
router.get("/toolKpi", kpi.kpi);
router.get("/toolNest", kpi.nest);
router.get("/toolNewgroup", kpi.newgroup);

module.exports = router;
