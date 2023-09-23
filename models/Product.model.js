const mongoose = require('mongoose');
 
const ProductSchema = mongoose.Schema({
    title:String,
    price:Number,
    description:String,
    category:String,
    avaliability:{
        type: String,
        enum: ['Yes', 'No'],
        default: 'Yes', 
    },
    stockCount:Number,
    userID: String
})

const ProductModel = mongoose.model("Product", ProductSchema)

module.exports = ProductModel