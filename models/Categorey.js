const mongoose = require("mongoose")

const CategoreySchema = mongoose.Schema({
    MainCategory:{
        type:String
    },
  
    image:{
        type:String
    }
},{timeStamps:true})

const Category = mongoose.model("Category",CategoreySchema)

module.exports = Category