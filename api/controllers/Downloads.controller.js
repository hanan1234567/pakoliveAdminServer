const {Downloads } = require('../models')
const { niv, } = require('../utils')
const cloudinary=require("../utils/cloudinary")
class DownloadsController {
    constructor() {
    }

    async Create(req, res) {

        var form_data = req.body;
        const validator = new niv.Validator(form_data, {
            title: 'required|string',
            file: 'mime:pdf',
        });

        validator.niceNames({
            title: "Title",
            file: "File",
        })
        let isValid = await validator.check()
        if (!isValid) {
           
            return res.status(400).json({ error: validator.errors, message: 'Form validation error' });
        }
        let uploadFile=await cloudinary.uploader.upload(req.file.path,{ resource_type: "auto",folder:'downloads'})
        new Downloads({
            title: form_data.title,
            file: {
                fileName:uploadFile.original_filename,
                url:uploadFile.secure_url,
                cloudinaryID:uploadFile.public_id
            },
        })
            .save()
            .then((download) => {
                return res.status(200).json({download, message: 'Downloaded Material added successfully' })
            })
            .catch((error) => {
                return res.status(400).json({ error: error, message: 'Form validation error' });
            })


    }
    async Update(req, res) {
        var form_data = req.body;
        const validator = new niv.Validator(form_data, {
            title: 'required|string',
        });

        validator.niceNames({
            title: "Title",
        })
        let isValid = await validator.check()
        if (!isValid) {
            return res.status(400).json({ error: validator.errors, message: 'Form validation error' });
        }

        try {
            if(req.file)
            {
                let del=await Downloads.findOne({_id:req.body._id},{file:1})
                await cloudinary.uploader.destroy(del.file.cloudinaryID)
                let uploadFile=await cloudinary.uploader.upload(req.file.path,{ resource_type: "auto",folder:'downloads'})
                req.body.file={
                    fileName:uploadFile.original_filename,
                    url:uploadFile.secure_url,
                    cloudinaryID:uploadFile.public_id
                }
                await Downloads.updateOne({_id:req.body._id},{title:req.body.title,file:req.body.file,updated_at:new Date()})
                return res.status(200).json({ download:req.body, message: 'Downloaded Material Updated Successfully' })
            }
            await Downloads.updateOne({_id:req.body._id},{title:req.body.title,updated_at:new Date()})
            let download=await Downloads.findOne({_id:req.body._id})
            return res.status(200).json({ download, message: 'Downloaded Material Updated Successfully' })
        }
        catch (error) {
            console.log("Error", error)
            return res.status(400).json({ error: 'Error Updating Downloaded Material', message: 'Error ocurred' });
        }

    }

    async Get(req, res) {
        try {
            var downloads = await Downloads.find();
            return res.status(200).json({ downloads});

        } catch (e) {
            return res.status(400).json({ error: 'Error occured' });
        }

    }
    async Delete(req, res) {
        var { downloadID } = req.params
        try {
            let del=await Downloads.findOne({_id:downloadID},{file:1})
            del =await cloudinary.uploader.destroy(del.file.cloudinaryID)
            await Downloads.deleteOne({_id:downloadID})
            return res.status(200).json({downloadID, message: 'Downloaded Material removed successfully' })
        }
        catch (e) {
            return res.status(400).json({ error: e || 'Invalid Request' });
        }

    }
}

module.exports = new DownloadsController();