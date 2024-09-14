const Product = require("../models/ProductModel");
const fs = require('fs');
const { uploadImage } = require("../utils/cloudinary");


// Create Product 
exports.createProducts = async (req, res) => {
    console.log(req.body)
    console.log(req.files)
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                error: "No files uploaded"
            });
        }
        const { productName, afterdiscount, mainPrice, description, categories, tags, stockQuantity, discount } = req.body;
        // Validate required fields
        const missingFields = [];
        if (!productName) missingFields.push('productName');
        if (!description) missingFields.push('description');
        if (!mainPrice) missingFields.push('mainPrice');
        if (!afterdiscount) missingFields.push('afterdiscount');
        if (!categories) missingFields.push('categories');
        if (!stockQuantity) missingFields.push('stockQuantity');

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: "Please provide all required fields",
                missingFields
            });
        }

        // Upload images to Cloudinary
        const uploadedImages = [];
        for (let index = 0; index < files.length; index++) {
            const file = files[index].path;
            const imageUrl = await uploadImage(file)
            uploadedImages.push(imageUrl)
        }
        const newProduct = new Product({
            productName,
            discount,
            mainPrice,
            afterdiscount,
            description,
            categories,
            tags,
            stockQuantity,
            images: uploadedImages
        });
        await newProduct.save();
        return res.status(200).json({
            success: true,
            msg: "Product created successfully",
            data: newProduct
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

// Get All Products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

// Delete Product by ID
exports.deleteProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({
                success: false,
                error: "Product not found"
            });
        }
        res.status(200).json({
            success: true,
            data: deletedProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

// Get Single Product by Product Name
exports.getProductByName = async (req, res) => {
    try {
        const { productName, id } = req.params;
        let product;
        if (id) {
            product = await Product.findById(id);
        } else if (productName) {
            product = await Product.findOne({ productName });
        } else {
            return res.status(400).json({
                success: false,
                error: "Please provide either product name or ID"
            });
        }

        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

// Filter Products According to Tags
exports.filterProductsByTags = async (req, res) => {
    try {
        const { tags } = req.query;
        const filteredProducts = await Product.find({ tags: { $in: tags } });
        res.status(200).json({
            success: true,
            data: filteredProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

// Update Product
exports.makeUpdate = async (req, res) => {
    try {
        console.log(req.body)
        res.status(201).json({
            success: true,
            data: req.body
        });
    } catch (error) {
        res.status(501).json({
            success: false,
            error: "Product not found"
        });
    }
}
// Update Product
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { productName, afterdiscount, mainPrice, description, availability, categories, tags } = req.body;
        const updateFields = {};

        // Assign values to updateFields if provided in the request
        if (productName) updateFields.productName = productName;
        if (afterdiscount) updateFields.afterdiscount = afterdiscount;
        if (mainPrice) updateFields.mainPrice = mainPrice;
        if (description) updateFields.description = description;
        if (categories) updateFields.categories = categories;
        if (tags) updateFields.tags = tags;

        // Find the existing product
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                error: "Product not found"
            });
        }

        // Check if new images are uploaded
        const files = req.files;
        if (files && files.length > 0) {
            // Delete old images from Cloudinary
            for (let oldImage of existingProduct.images) {
                await deleteImageFromCloudinary(oldImage);
            }

            // Upload new images to Cloudinary
            const uploadedImages = [];
            for (let index = 0; index < files.length; index++) {
                const file = files[index].path;
                const imageUrl = await uploadImage(file); // Assume uploadImage is your function to upload to Cloudinary
                uploadedImages.push(imageUrl);
            }
            updateFields.images = uploadedImages; // Update with new images
        }

        // Update the product in the database
        const updatedProduct = await Product.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                error: "Product not found"
            });
        }

        // Return the updated product
        return res.status(200).json({
            success: true,
            msg: "Product updated successfully",
            data: updatedProduct
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

// Get Products by Category
exports.getProductsByCategory = async (req, res) => {
    try {
        const category = req.params.category;
        const products = await Product.find({ categories: category });
        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                msg: "No Product Found"
            });
        }
        res.status(200).json({
            success: true,
            msg: "Found Successfully",
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};
