const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
    orders:Array,
    userID:String,
})

const Ordermodel = mongoose.model("OrderModel", OrderSchema)

module.exports = Ordermodel