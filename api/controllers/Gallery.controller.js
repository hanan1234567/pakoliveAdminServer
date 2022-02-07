const { Class, Subject, User,Quiz, Content,Gallery } = require('../models')
const { niv, } = require('../utils')
const cloudinary=require("../utils/cloudinary")
class GalleryController {
    constructor() {
    }

    async Create(req, res) {

        var form_data = req.body;
        const validator = new niv.Validator(form_data, {
            title: 'required|string',
            description: 'required',
            thumbnail: 'mime:jpg,jpeg,png'
        });

        validator.niceNames({
            title: "Gallery Title",
            description: 'Description',
            thumbnail: 'Thumbnail'
        })

        let isValid = await validator.check()
        if (!isValid) {
            return res.status(400).json({ error: validator.errors, message: 'Form validation error' });
        }
        let uploadFile=await cloudinary.uploader.upload(req.file.path,{ resource_type: "auto",folder:'gallery',quality: 60})
        new Gallery({
            title: form_data.title,
            description: form_data.description,
            thumbnail:{
                fileName:uploadFile.original_filename,
                url:uploadFile.secure_url,
                cloudinaryID:uploadFile.public_id
            }
        })
            .save()
            .then((gallery) => {
                return res.status(200).json({ gallery, message: 'Gallery created successfully' })
            })
            .catch((error) => {
                return res.status(400).json({ error: error, message: 'Form validation error' });
            })


    }
    async GalleryImage(req, res) {
        try{
            var galleryID=req.params.galleryID
            console.log("saf",req.body._id)
            let thumbnail=await cloudinary.uploader.upload(req.file.path,{ resource_type: "auto",folder:'gallery',quality: 60})
            let original=await cloudinary.uploader.upload(req.file.path,{ resource_type: "auto",folder:'gallery',quality: 60})
            let gallery=await Gallery.findOne({_id:galleryID})
            if(req.body._id!='undefined')
            {
                console.log("yes id")
                for(let i=0;i<gallery.images.length;i++)
                {
                    if(gallery.images[i]._id.toString()===req.body._id)
                    {
                        console.log("id match")
                        await cloudinary.uploader.destroy(gallery.images[i].thumbnail.cloudinaryID)
                        await cloudinary.uploader.destroy(gallery.images[i].original.cloudinaryID)
                        gallery.images[i]=  {
                            ...gallery.images[i],
                            thumbnail:{
                                fileName:thumbnail.original_filename,
                                url:thumbnail.secure_url,
                                cloudinaryID:thumbnail.public_id
                            },
                            original:{
                                fileName:original.original_filename,
                                url:original.secure_url,
                                cloudinaryID:original.public_id
                            }        
                        }
                    }
                }
            }
            else 
            {
                console.log("no id")
                gallery.images.push(
                    {
                        thumbnail:{
                            fileName:thumbnail.original_filename,
                            url:thumbnail.secure_url,
                            cloudinaryID:thumbnail.public_id
                        },
                        original:{
                            fileName:original.original_filename,
                            url:original.secure_url,
                            cloudinaryID:original.public_id
                        },
                })
            }
            gallery=await gallery.save()
            return res.status(200).json({gallery,message: 'Image Save successfully' })
        }
        catch(error)
        {
            console.log(error)
            return res.status(400).json({ error, message: 'Form validation error' });
        }
    }


    async Update(req, res) {

        var form_data = req.body;
        const validator = new niv.Validator(form_data, {
            title: 'required|string',
            description: 'required',
        });

        validator.niceNames({
            title: "Gallery Title",
            description: 'Description',
        })

        let isValid = await validator.check()
        if (!isValid) {
            return res.status(400).json({ error: validator.errors, message: 'Form validation error' });
        }

        try {
            if(req.file)
            {
                let del=await Gallery.findOne({_id:req.body._id},{thumbnail:1})
                await cloudinary.uploader.destroy(del.thumbnail.cloudinaryID)
                let uploadFile=await cloudinary.uploader.upload(req.file.path,{ resource_type: "auto",folder:'gallery',quality: 60})
                req.body.thumbnail={
                    fileName:uploadFile.original_filename,
                    url:uploadFile.secure_url,
                    cloudinaryID:uploadFile.public_id
                }
            }
            else 
             delete req.body.thumbnail
            delete req.body.created_at;
            await Gallery.updateOne({_id:req.body._id},{...req.body,updated_at:new Date()})
            let gallery=await Gallery.findOne({_id:req.body._id})
            return res.status(200).json({ gallery, message: 'Gallery Updated Successfully' })
        }
        catch (error) {
            console.log("Error", error)
            return res.status(400).json({ error: 'Error Updating Gallery', message: 'Error ocurred' });
        }

    }

    async Get(req, res) {
        try {
            const {limit}=req.params;
            var gallerys;
            if(limit)
            gallerys = await Gallery.find().limit(limit);
            else
             gallerys = await Gallery.find();
             console.log(gallerys)
            return res.status(200).json({ gallerys});

        } catch (e) {
            return res.status(400).json({ error: 'Error occured' });
        }

    }
    async Delete(req, res) {
        var { galleryID } = req.params
        try {
            let del=await Gallery.findOne({_id:galleryID},{thumbnail:1,images:1})
            await cloudinary.uploader.destroy(del.thumbnail.cloudinaryID)
            for(let i=0;i<del.images.length;i++)
            {
                await cloudinary.uploader.destroy(del.images[i].thumbnail.cloudinaryID)
                await cloudinary.uploader.destroy(del.images[i].original.cloudinaryID)
            }
            await Gallery.deleteOne({_id:galleryID})
            return res.status(200).json({galleryID, message: 'Gallery removed successfully' })

        }
        catch (e) {
            console.log(e)
            return res.status(400).json({ error: e || 'Invalid Request' });
        }

    }
}

module.exports = new GalleryController();