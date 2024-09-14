const mongoose = require('mongoose');

const SalesBannerSchema = new mongoose.Schema({
   
    BtnTitle: { type: String, required: true },

    image: { type: String, required: true },
    active: { type: Boolean, default:true },

}, { timestamps: true });

module.exports = mongoose.model('SalesBanner', SalesBannerSchema);