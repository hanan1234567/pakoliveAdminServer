const {Tenders } = require('../models')
const { niv, } = require('../utils')
const cloudinary=require("../utils/cloudinary")
class TendersController {
    constructor() {
    }

    async Create(req, res) {

        var form_data = req.body;
        const validator = new niv.Validator(form_data, {
            title: 'required|string',
            release:'required|string',
            closing:'required|string',
            file: 'mime:pdf',
        });

        validator.niceNames({
            title: "Title",
            release: "Releasing ",
            closing: "Closing",
            file: "File",
        })

        let isValid = await validator.check()
        if (!isValid) {
            return res.status(400).json({ error: validator.errors, message: 'Form validation error' });
        }
        let uploadFile=await cloudinary.uploader.upload(req.file.path,{folder:'tenders'})
        new Tenders({
            ...req.body,
            file: {
                fileName:uploadFile.original_filename,
                url:uploadFile.secure_url,
                cloudinaryID:uploadFile.public_id
            },
        })
        .save()
        .then((tender) => {
            return res.status(200).json({tender, message: 'Tender added successfully' })
        })
        .catch((error) => {
            return res.status(400).json({ error: error, message: 'Form validation error' });
        })
    }
    async Update(req, res) {
        var form_data = req.body;
        const validator = new niv.Validator(form_data, {
            title: 'required|string',
            release:'required|string',
            closing:'required|string',
        });

        validator.niceNames({
            title: "Title",
            release: "Releasing ",
            closing: "Closing",
        })
        let isValid = await validator.check()
        if (!isValid) {
            return res.status(400).json({ error: validator.errors, message: 'Form validation error' });
        }

        try {
            if(req.file)
            {
                let del=await Tenders.findOne({_id:req.body._id},{file:1})
                await cloudinary.uploader.destroy(del.file.cloudinaryID)
                let uploadFile=await cloudinary.uploader.upload(req.file.path,{folder:'tenders'})
                req.body.file={
                    fileName:uploadFile.original_filename,
                    url:uploadFile.secure_url,
                    cloudinaryID:uploadFile.public_id
                }
            }
            else 
            delete req.body.file
            delete req.body.created_at;
            await Tenders.findOneAndUpdate({_id:req.body._id},{...req.body,updated_at:new Date()})
            let tender=await Tenders.findOne({_id:req.body._id})
            return res.status(200).json({ tender, message: 'Tender Updated Successfully' })
        }
        catch (error) {
            console.log("Error", error)
            return res.status(400).json({ error: 'Error Updating Tender', message: 'Error ocurred' });
        }

    }

    async Get(req, res) {
        try {
            var tenders = await Tenders.find();
            return res.status(200).json({ tenders});

        } catch (e) {
            return res.status(400).json({ error: 'Error occured' });
        }

    }
    async Delete(req, res) {
        var { tenderID } = req.params
        try {
            let del=await Tenders.findOne({_id:tenderID},{file:1})
            del =await cloudinary.uploader.destroy(del.file.cloudinaryID)
            await Tenders.deleteOne({_id:tenderID})
            return res.status(200).json({tenderID, message: 'Tender removed successfully' })
        }
        catch (e) {
            return res.status(400).json({ error: e || 'Invalid Request' });
        }

    }
}

module.exports = new TendersController();