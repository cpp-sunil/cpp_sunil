const staticModel = require('../models/staticModel');
const { resetPassword } = require('./userController');
module.exports = {
    createStatic: async (req, res) => {
        staticModel.findOne({ type: req.body.type }, (err, result) => {
            if (err) {
                res.send({ responseCode: 500, responseMessage: "Something went wrong", result: err })
            } else if (result) {
                res.send({ responseCode: 409, responseMessage: "Data Already Exist", result: result })
            } else {
                new staticModel(req.body).save((saveErr, saveRes) => {
                    if (saveErr) {
                        res.send({ responseCode: 500, responseMessage: "Something went wrong", result: saveRes })
                    } else {
                        res.send({ responseCode: 200, responseMessage: "Model Created", result: saveRes })
                    }
                })
            }
        })
    },
    staticList: async (req, res) => {

        try {
            let statisDataList = await staticModel.find({ status: { $ne: "Delete" } });
            if (statisDataList.length != 0) {
                res.send({ responseCode: 200, responseMessage: "Static data fetched successfully.", responseResult: statisDataList });
            }
            else {
                res.send({ responseCode: 404, responseMessage: "Static data not found.", responseResult: [] });
            }
        } catch (error) {
            res.send({ responseCode: 501, responseMessage: "Something went wrong.", responseResult: error });
        }
    },
    viewStatic: async (req, res) => {
        try {
            let type = req.query.type
            if (type) {
                let allModels = await staticModel.find({ type })
                res.send(allModels)
            }
        }
        catch (error) {
            res.send(({ responseCode: 501, responseMessage: "Something went wrong!", responseResult: error }))
        }
    },
    editStatic: async (req, res) => {
        const schema = {
            title: joi.string().alphanum().min(3).optional(),
            description: joi.string().alphanum().min(3).optional(),
            type: joi.string().alphanum().min(3).max(30).optional(),
        }
        let id = req.params.id
        let validateBody = await joi.validate(req.body, schema);
        if (id) {
            try {
                if (userType == "Admin") {
                    let allModels = await staticModel.findByIdAndUpdate({ _id: id }, { $set: { validateBody } }, { new: true })
                    allModels.save()
                    res.send("Successfully Updated")
                }
                else {
                    res.send({ responseCode: 465, responseMessage: "Only Admin can Update", responseResult: allModels })
                }
            } catch (error) {
                res.send({ responseCode: 465, responseMessage: "Something went wrong", responseResult: allModels })
            }
        }
        else {
            res.send({ responseCode: 402, responseMessage: "Enter valid id", responseResult: error })
        }
    }
}