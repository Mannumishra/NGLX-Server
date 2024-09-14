const mongoose = require("mongoose")

const CategoryWhichSchema = new mongoose.Schema({
    OneWhichCategoryRedirect:{
        type:String
    },
    title:{
        type:String
    },
    CatImg:{
        type:String
    }
},{timeStamps:true})

const Category = mongoose.model("Redirect",CategoryWhichSchema)

module.exports = Category