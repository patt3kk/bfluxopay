const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// import {v2 as cloudinary} from 'cloudinary';
          
// cloudinary.config({ 
//   cloud_name: 'dm50ttmzg', 
//   api_key: '513632519272537', 
//   api_secret: 'U-jNTJ4deJcmJY-SLNHUBgO-saQ' 
// });


// cloudinary.config({ 
//   cloud_name: process.env.CLOUD_NAME, 
//   api_key: process.env.CLOUD_KEY, 
//   api_secret: process.env.CLOUD_KEY_SECRET 
// });


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = {
  cloudinary
};