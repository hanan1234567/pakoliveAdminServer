const { Videos } = require('../models')
const { niv, } = require('../utils')
const cloudinary=require("../utils/cloudinary")
class VideosController {
    constructor() {
    }

    async Create(req, res) {

        var form_data = req.body;
        const validator = new niv.Validator(form_data, {
            title: 'required|string',
            link: 'required|string',
            thumbnail: 'mime:jpg,jpeg,png',
        });

        validator.niceNames({
            title: "Title", 
            link: 'Link',
            thumbnail: 'Thumbnail',
        })

        let isValid = await validator.check()
        if (!isValid) {
            return res.status(400).json({ error: validator.errors, message: 'Form validation error' });
        }
        let uploadFile=await cloudinary.uploader.upload(req.file.path,{ resource_type: "auto",folder:'videos'})
        new Videos({
            title: form_data.title,
            link: form_data.link,
            thumbnail: {
                fileName:uploadFile.original_filename,
                url:uploadFile.secure_url,
                cloudinaryID:uploadFile.public_id
            },
        })
            .save()
            .then((video) => {
                return res.status(200).json({ video, message: 'Video added successfully' })
            })
            .catch((error) => {
                return res.status(400).json({ error: error, message: 'Form validation error' });
            })


    }
    async Update(req, res) {
        var form_data = req.body;
        const validator = new niv.Validator(form_data, {
            title: 'required|string',
            link: 'required|string'
        });

        validator.niceNames({
            title: "Title",
            link: 'Link',
        })

        let isValid = await validator.check()
        if (!isValid) {
            return res.status(400).json({ error: validator.errors, message: 'Form validation error' });
        }

        try {
            if(req.file)
            {
                let del=await Videos.findOne({_id:req.body._id},{thumbnail:1})
                await cloudinary.uploader.destroy(del.thumbnail.cloudinaryID)
                let uploadFile=await cloudinary.uploader.upload(req.file.path,{ resource_type: "auto",folder:'videos'})
                req.body.thumbnail={
                    fileName:uploadFile.original_filename,
                    url:uploadFile.secure_url,
                    cloudinaryID:uploadFile.public_id
                }
                await Videos.updateOne({_id:req.body._id},{title:req.body.title,link:req.body.link,thumbnail:req.body.thumbnail,updated_at:new Date()})
                return res.status(200).json({ video:req.body, message: 'Video Updated Successfully' })
            }
            await Videos.updateOne({_id:req.body._id},{title:req.body.title,link:req.body.link,updated_at:new Date()})
            let video=await Videos.find({_id:req.body._id})
            return res.status(200).json({ video, message: 'Video Updated Successfully' })
        }
        catch (error) {
            console.log("Error", error)
            return res.status(400).json({ error: 'Error Updating Video', message: 'Error ocurred' });
        }

    }

    async Get(req, res) {
        try {
            var videos = await Videos.find();
            return res.status(200).json({ videos});

        } catch (e) {
            return res.status(400).json({ error: 'Error occured' });
        }

    }
    async Delete(req, res) {
        var { videoID } = req.params
        try {
            let del=await Videos.findOne({_id:videoID},{thumbnail:1})
            del =await cloudinary.uploader.destroy(del.thumbnail.cloudinaryID)
            await Videos.deleteOne({_id:videoID})
            return res.status(200).json({videoID, message: 'Video removed successfully' })

        }
        catch (e) {
            return res.status(400).json({ error: e || 'Invalid Request' });
        }

    }
}

module.exports = new VideosController();