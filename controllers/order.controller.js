/**
 * @swagger
 * components:
 *   schemas:
 *     Cart:
 *       type: array
 *       required:
 *         - orders
 *       properties:
 *         orders:
 *           type: array
 *           description: The total ordered products
 *     
 */
/**
* @swagger
 * tags:
*   name: Order  products
*   description: Ordering all the products present in the cart
  * /cartorder/order/{userid}:
*   post:
*     summary: Ordering all the products present in the cart
*     tags: [order]
 *     parameters:
 *       - in: path
 *         name: userid
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     responses:
 *       200:
 *         description: Order Placed succesfully
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/products'
 *       404:
 *         description: No Product found in the cart
   * /cartorder/order-history/{userid}:
 *   get:
 *     summary: Get the product details by its id
 *     tags: [order]
 *     parameters:
 *       - in: path
 *         name: userid
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     responses:
 *       200:
 *         description: Order History fetched successfully
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/products'
 *       404:
 *         description: No Order History Found
 */



const express = require('express');
const CartModel = require('../models/cart.model');
const Ordermodel = require('../models/order.model');
const orderRoute = express.Router();

orderRoute.post("/order/:userid", async (req, res) =>{
    try {
        const {userid} = req.params;
        const getCartProducts = await CartModel.find({userID: userid})
        const addToOrders = await Ordermodel({orders:getCartProducts})
        addToOrders.userID = req.body.userID;
        await addToOrders.save();

        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
        
        const formattedTime = now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
        res.status(200).send({
            msg: "Order Placed successfully",
            totalOrders: getCartProducts.length,
            at: `Order Placed at ${formattedDate} at ${formattedTime}`,
        })

    } catch (error) {
        res.status(500).send({
            msg:error.message
        });
    }
})

orderRoute.get("/order-history/:userid", async (req, res) => {
try {
    const {userid} = req.params;
    const orderHistory = await Ordermodel.find({userID:userid})
    if(orderHistory.length===0){
        return res.status(404).send({
            msg:"No Order History found!!"
        })
    }
    res.status(200).send({
        msg:orderHistory
    })
} catch (error) {
    
}

})

module.exports = orderRoute