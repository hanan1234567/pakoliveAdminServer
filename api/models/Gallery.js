const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const GallerySchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: Object,
        default: '',
    },
    images:[
        {
            thumbnail:{type:Object,default: ''},
            original:{type:Object,default: ''},
        }
    ],
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },

});

module.exports = Gallery = mongoose.model("gallery", GallerySchema);