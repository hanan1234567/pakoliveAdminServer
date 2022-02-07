const {Components } = require('../models')
const { niv, } = require('../utils')
const mongoose = require('mongoose')
class ComponentsController {
    constructor() {
    }

    async Create(req, res) {

        var form_data = req.body;
        const validator = new niv.Validator(form_data, {
            name: 'required|string',
            address: 'required|string',
            email: 'required|email',
            phone:'required|string',
        });

        validator.niceNames({
            name: 'Name',
            address: 'Address',
            email: 'Email',
            phone:'Phone',
        })

        let isValid = await validator.check()
        if (!isValid) {
            return res.status(400).json({ error: validator.errors, message: 'Form validation error' });
        }
        new Components(form_data)
            .save()
            .then((component) => {
                return res.status(200).json({component, message: 'Component added successfully' })
            })
            .catch((error) => {
                return res.status(400).json({ error: error, message: 'Form validation error' });
            })


    }
    async Update(req, res) {
        var form_data = req.body;
        const validator = new niv.Validator(form_data, {
            name: 'required|string',
            address: 'required|string',
            email: 'required|email',
            phone:'required|string',
        });

        validator.niceNames({
            name: 'Name',
            address: 'Address',
            email: 'Email',
            phone:'Phone',
        })
        let isValid = await validator.check()
        if (!isValid) {
            return res.status(400).json({ error: validator.errors, message: 'Form validation error' });
        }

        try {
            await Components.updateOne({_id:req.body._id},{name:req.body.name,address:req.body.address,email:req.body.email,phone:req.body.phone,updated_at:new Date()})
            return res.status(200).json({ component:req.body, message: 'Component Updated Successfully' })
        }
        catch (error) {
            console.log("Error", error)
            return res.status(400).json({ error: 'Error Updating Team Member', message: 'Error ocurred' });
        }

    }

    async Get(req, res) {
        try {
            var components = await Components.find();
            return res.status(200).json({ components});

        } catch (e) {
            return res.status(400).json({ error: 'Error occured' });
        }

    }
    async Delete(req, res) {
        var {_id} = req.params
        try {
            await Components.deleteOne({_id})
            return res.status(200).json({_id, message: 'Component removed successfully' })
        }
        catch (e) {
            return res.status(400).json({ error: e || 'Invalid Request' });
        }

    }
}

module.exports = new ComponentsController();