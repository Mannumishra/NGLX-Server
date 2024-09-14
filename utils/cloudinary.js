const cloudinary = require("cloudinary").v2;

cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_NAME,
})
console.log(cloudinary.config())

const uploadImage = async (file) => {
    try {
        const ImageUrl = await cloudinary.uploader.upload(file)
        return ImageUrl.secure_url
    } catch (error) {
        console.log(error)
    }
}

const deleteImageFromCloudnary = async (file) => {
    try {
        await cloudinary.uploader.destroy(file)
        console.log("Image Delete Successfully")
    } catch (error) {
        console.log(error)
    }
}


module.exports = {  
    uploadImage, deleteImageFromCloudnary
}