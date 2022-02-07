const cloudinary=require("cloudinary").v2;
var path = require('path')

cloudinary.config({ 
    cloud_name: 'pakolive', 
    api_key: '298128328529786', 
    api_secret: 'ayDTmuq7kP5URz_J6bkgEC3OIwg' 
  });

module.exports=cloudinary;