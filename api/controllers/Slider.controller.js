const { Slider } = require('../models')
const { niv, } = require('../utils')
const cloudinary=require("../utils/cloudinary")
const fs = require('fs')
class SliderController {
    constructor() {
    }

    async Create(req, res) {

        var form_data = req.body;
        const validator = new niv.Validator(form_data, {
            title: 'required|string',
            description: 'required|string',
            image: 'mime:jpg,jpeg,png',
        });

        validator.niceNames({
            title: "Title",
            description: 'Description',
            image: 'Image',
        })

        let isValid = await validator.check()
        if (!isValid) {
            return res.status(400).json({ error: validator.errors, message: 'Form validation error' });
        }
        let uploadFile=await cloudinary.uploader.upload(req.file.path,{ resource_type: "auto",folder:'slider',quality: 60})
        new Slider({
            title: form_data.title,
            description: form_data.description,
            image: {
                fileName:uploadFile.original_filename,
                url:uploadFile.secure_url,
                cloudinaryID:uploadFile.public_id
            }
        })
            .save()
            .then((slide) => {
                return res.status(200).json({ slide, message: 'Slide added successfully' })
            })
            .catch((error) => {
                return res.status(400).json({ error: error, message: 'Form validation error' });
            })


    }
    async Update(req, res) {
        var form_data = req.body;
        console.log(req.body)
        const validator = new niv.Validator(form_data, {
            title: 'required|string',
            description: 'required|string',
        });

        validator.niceNames({
            title: "Title",
            description: 'Description',
        })

        let isValid = await validator.check()
        if (!isValid) {
            return res.status(400).json({ error: validator.errors, message: 'Form validation error' });
        }

        try {
            if(req.file)
            {
                let del=await Slider.findOne({_id:req.body._id},{file:1})
                await cloudinary.uploader.destroy(del.file.cloudinaryID)
                let uploadFile=await cloudinary.uploader.upload(req.file.path,{ resource_type: "auto",folder:'slider',quality: 60})
                req.body.image={
                    fileName:uploadFile.original_filename,
                    url:uploadFile.secure_url,
                    cloudinaryID:uploadFile.public_id
                }
            }
            let slide=await Slider.updateOne({_id:req.body._id},{title:req.body.title,description:req.body.description,image:req.body.image,updated_at:new Date()})
            return res.status(200).json({ slide:req.body, message: 'Slide Updated Successfully' })
        }
        catch (error) {
            console.log("Error", error)
            return res.status(400).json({ error: 'Error Updating Slide', message: 'Error ocurred' });
        }

    }

    async Get(req, res) {
        try {
            var slider = await Slider.find();
            console.log("slider:",slider)
            return res.status(200).json({ slider});

        } catch (e) {
            return res.status(400).json({ error: 'Error occured' });
        }

    }
    async Delete(req, res) {
        var { slideID } = req.params
        try {
            let del=await Slider.findOne({_id:slideID},{image:1})
            del =await cloudinary.uploader.destroy(del.image.cloudinaryID)
            await Slider.deleteOne({_id:slideID})
            return res.status(200).json({slideID, message: 'Slide Image removed successfully' })

        }
        catch (e) {
            console.log(e)
            return res.status(400).json({ error: e || 'Invalid Request' });
        }

    }
}

module.exports = new SliderController();