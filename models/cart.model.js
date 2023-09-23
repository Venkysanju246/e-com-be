const mongoose = require('mongoose')

const CartSchema = mongoose.Schema({
    title: String,
    price: Number,
    avaliability: {
        type: String,
        enum: ['Yes', 'No'],
        default: 'Yes',
    },
    quantity:{
        type: Number,
        default: 1,
    },
    userID:String
})

const CartModel = mongoose.model("cart", CartSchema)

module.exports = CartModel