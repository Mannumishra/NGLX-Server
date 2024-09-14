const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
    },
    mainPrice: {
        type: Number,
        require: true
    },
    afterdiscount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    categories: {
        type: String,
        required: true
    },
    tags: {
        type: String
    },
    stockQuantity: {
        type: Number,
        required: true
    },
    images: {
        type: [String],
        required: true
    }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
