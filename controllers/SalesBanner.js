const SalesBanner = require('../models/SalesBannerModel');
const fs = require('fs');
const { uploadImage } = require('../utils/cloudinary');

exports.createSalesBanner = async (req, res) => {
    try {
        const { active, BtnTitle } = req.body;
        console.log('body', req.body)
        if (active === undefined) { // Checking if active is defined
            return res.status(400).json({
                success: false,
                msg: "Please provide all required fields"
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Shop Banner is must Required"
            })
        }
        const imageurl = await uploadImage(req.file.path)
        const newBanner = new SalesBanner({
            active: active,
            BtnTitle: BtnTitle,
            image: imageurl
        });
        await newBanner.save();
        return res.status(201).json({
            success: true,
            msg: "Banner created successfully",
            data: newBanner
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};
exports.getAllSalesBanners = async (req, res) => {
    try {
        const banners = await SalesBanner.find();
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


exports.deleteSalesBanner = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedBanner = await SalesBanner.findByIdAndDelete(id);

        if (!deletedBanner) {
            return res.status(404).json({
                success: false,
                msg: "Banner not found"
            });
        }

        return res.status(200).json({
            success: true,
            msg: "Banner deleted successfully"
        });
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};


exports.updateSaleBanner = async (req, res) => {
    try {
        const { id } = req.params;
        // const {}
        const updatedSaleBanner = await SalesBanner.findByIdAndUpdate(id, { new: true });
        if (!updatedSaleBanner) {
            return res.status(404).json({
                success: false,
                msg: "Sale Banner Not Found"
            })
        }
        return res.status(200).json({
            success: true,
            data: updatedSaleBanner
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        })
    }
}