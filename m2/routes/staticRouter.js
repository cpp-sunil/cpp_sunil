const staticRouter = require("express").Router();
const auth = require("../middleware/auth");
const staticController = require("../controllers/staticController");
 staticRouter.post('/save', staticController.createStatic);
 staticRouter.get('/staticList', staticController.staticList);
 staticRouter.get('/viewStatic', staticController.viewStatic);
 staticRouter.put('/editStatic/:id',auth.verifyToken, staticController.editStatic);

module.exports = staticRouter;
