const RedirectCategory = require('../models/CategoryWhichShow');
const cloudinary = require("cloudinary").v2;
const fs = require('fs').promises;
const path = require('path');

// Config Of Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.RedirectCategoryMake = async (req, res) => {
    try {
        const { OneWhichCategoryRedirect, title } = req.body;

        if (!OneWhichCategoryRedirect || !title) {
            return res.status(403).json({
                success: false,
                msg: "Please provide all fields including image",
            });
        }
        const tempFilePath = path.join(__dirname, `temp_${req.file.originalname}`);
        // Write the buffer data to the temporary file
        await fs.writeFile(tempFilePath, req.file.buffer);
        // Upload image to Cloudinary
        const cloudinaryResponse = await cloudinary.uploader.upload(tempFilePath, {
            folder: "redirect",
            public_id: `${title}_${Date.now()}`, // You can customize the public_id as per your requirement
            filename: req.file.originalname, // Pass the original filename
        });

        const newData = new RedirectCategory({
            OneWhichCategoryRedirect,
            title,
            CatImg: cloudinaryResponse.secure_url
        })
        await newData.save()

        res.status(200).json({
            success: true,
            data: newData,
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(501).json({
            success: false,
            msg: "Internal Server Error",
        });
    }
};

exports.GetAllRedirectCat = async (req, res) => {
    try {
        const AllRedirect = await RedirectCategory.find();

        if (AllRedirect.length === 0) {
            return res.status(404).json({
                success: false,
                msg: 'No redirect categories found'
            });
        }

        res.status(200).json({
            success: true,
            data: AllRedirect,
            msg: 'Found Success'
        });
    } catch (error) {
        //console.log(error);
        res.status(500).json({
            success: false,
            msg: 'Internal Server Error'
        });
    }
};

exports.DeleteRedirectCategory = async (req, res) => {
    try {
        const categoryId = req.params.id; // Get the category ID from request parameters

        // Find the redirect category by ID
        const redirectCategory = await RedirectCategory.findById(categoryId);
        if (!redirectCategory) {
            return res.status(404).json({
                success: false,
                msg: 'Redirect category not found'
            });
        }

        // // Delete the category from Cloudinary
        // await cloudinary.uploader.destroy(redirectCategory.public_id);

        // Delete the category from the database
        await redirectCategory.deleteOne();

        res.status(200).json({
            success: true,
            msg: 'Redirect category deleted successfully'
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            success: false,
            msg: 'Internal Server Error'
        });
    }
};
