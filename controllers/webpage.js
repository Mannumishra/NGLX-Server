const banner = require('../models/BannerModel');
const tags = require('../models/TagModel');
const Category = require('../models/Categorey'); // Corrected typo in 'Category'
const path = require('path')
const fs = require('fs');
const { uploadImage, deleteImageFromCloudnary } = require('../utils/cloudinary');



// ==================Banner =====================//
exports.createBanner = async (req, res) => {
    try {
        const { title, active } = req.body;
        if (!title || active === undefined) {
            return res.status(400).json({
                success: false,
                msg: "Please provide all required fields"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Image is must required"
            })
        }
        const imageurl = await uploadImage(req.file.path)
        // Creating the banner object
        const newBanner = new banner({
            title: title,
            active: active,
            image: imageurl
        });
        await newBanner.save();
        return res.status(201).json({
            success: true,
            msg: "Banner created successfully",
            data: newBanner
        });
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};
exports.getAllBanners = async (req, res) => {
    try {
        const banners = await banner.find();
        return res.status(200).json({
            success: true,
            data: banners
        });
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};
exports.updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, active } = req.body;

        // Find the existing record
        const existingBanner = await banner.findById(id);
        if (!existingBanner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });
        }

        let imageUrl = existingBanner.image; // Default to existing image URL
        if (req.file) {
            const oldImagePublicId = imageUrl.split('/').pop().split('.')[0];
            await deleteImageFromCloudnary(oldImagePublicId);
            imageUrl = await uploadImage(req.file.path);
        }
        const updatedBanner = await banner.findByIdAndUpdate(id, { title, active, image: imageUrl }, { new: true });
        if (!updatedBanner) {
            return res.status(404).json({
                success: false,
                msg: "Banner not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: updatedBanner
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};

exports.deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBanner = await banner.findById(id);
        if (!deletedBanner) {
            return res.status(404).json({
                success: false,
                msg: "Banner not found"
            });
        }
        if (deletedBanner.image) {
            const imageUrl = deletedBanner.image;
            const publicId = imageUrl.split('/').pop().split('.')[0];
            await deleteImageFromCloudnary(publicId)
        }
        await banner.findByIdAndDelete(id);
        return res.status(200).json({
            success: true,
            msg: "Banner deleted successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};

// =============== Category Controllar =====================//
exports.createCategory = async (req, res) => {
    try {
        console.log("i am hit")
        const { MainCategory } = req.body;
        if (!MainCategory) {
            return res.status(400).json({
                success: false,
                msg: "Please provide all required fields"
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Category Image is must Required"
            })
        }
        const imgurl = await uploadImage(req.file.path)
        const newCategory = new Category({
            MainCategory: MainCategory,
            image: imgurl
        });
        await newCategory.save()
        return res.status(201).json({
            success: true,
            msg: "Category created successfully",
            data: newCategory
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        return res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
}




exports.updateCategory = async (req, res) => {
    try {
        console.log("I am not hit ")
        const { id } = req.params;
        const { MainCategory } = req.body;
        const exitRecord = await Category.findById(id);
        
        if (!exitRecord) {
            return res.status(404).json({
                success: false,
                message: "Record Not Found"
            });
        }
        let imageUrl = exitRecord.image; 
        if (req.file) {
            if (exitRecord.image) {
                const oldImage = exitRecord.image.split("/").pop().split(".")[0];
                await deleteImageFromCloudnary(oldImage); // Delete the old image from Cloudinary
            }
            // Upload the new image to Cloudinary
            imageUrl = await uploadImage(req.file.path);
        }

        // Update the category with new MainCategory and image URL
        const updatedCategory = await Category.findByIdAndUpdate(
            id, 
            { MainCategory, image: imageUrl }, 
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                msg: "Category not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: updatedCategory
        });

    } catch (error) {
        console.error(error); // Log the error to the console for debugging
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const exitRecord = await Category.findById(id)
        if (!exitRecord) {
            return res.status(404).json({
                success: false,
                message: "REcord Not Found"
            })
        }
        if (exitRecord.image) {
            const oldImage = exitRecord.image.split("/").pop().split(".")[0]
            await deleteImageFromCloudnary(oldImage)
        }
        await Category.findByIdAndDelete(id)
        return res.status(200).json({
            success: true,
            msg: "Category deleted successfully"
        });
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};

// ============ Tag Section ============= //
exports.getAllTags = async (req, res) => {
    try {
        const tagss = await tags.find();
        return res.status(200).json({
            success: true,
            data: tagss
        });
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};

exports.makeTag = async (req, res) => {
    try {
        const { title, TagColour } = req.body;

        if (!title || !TagColour) {
            return res.status(400).json({
                success: false,
                msg: "Please provide all required fields"
            });
        }

        const newTag = new tags({
            title: title,
            TagColour: TagColour
        });

        await newTag.save();

        return res.status(201).json({
            success: true,
            msg: "Tag created successfully",
            data: newTag
        });
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};

exports.updateTag = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, TagColour } = req.body;

        const updatedTag = await tags.findByIdAndUpdate(id, { title, TagColour }, { new: true });

        if (!updatedTag) {
            return res.status(404).json({
                success: false,
                msg: "Tag not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: updatedTag
        });
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};

exports.deleteTag = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedTag = await tags.findByIdAndDelete(id);

        if (!deletedTag) {
            return res.status(404).json({
                success: false,
                msg: "Tag not found"
            });
        }

        return res.status(200).json({
            success: true,
            msg: "Tag deleted successfully"
        });
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};
