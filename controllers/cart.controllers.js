/**
 * @swagger
 * components:
 *   schemas:
 *     Cart:
 *       type: object
 *       required:
 *         - title
 *         - price
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the product
 *         price:
 *           type: number
 *           description: The price of the product
 *         description:
 *           type: string
 *           description: The description of the product
 *     
 */
/**
* @swagger
 * tags:
*   name: Add Products to Cart
*   description: Adding a product to Cart
  * /cart/add-to-cart/{id}:
*   post:
*     summary: Adding Product into cart
*     tags: [cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product id
 *     responses:
 *       200:
 *         description: Product Added to cart succesfully
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/products'
 *       404:
 *         description: No Product found to add to cart
  * /cart/view-cart:
 *   get:
 *     summary: view all products in cart
 *     tags: [cart]
 *     responses:
 *       200:
 *         description: Viewing products in cart
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/products'
 * /cart/updateQuantity/{id}:
*   patch:
 *    summary: Update the quantity of the product by its id
 *    tags: [cart]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: The product id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/products'
 *    responses:
 *      200:
 *        description: The product quantity was updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/products'
 *      404:
 *        description: Cart item not found
 *      500:
 *        description: Some error happened
 * /cart/deleteproduct/{id}:
 *   delete:
 *     summary: Remove the product by its id
 *     tags: [cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product id
 *
 *     responses:
 *       200:
 *         description: The product was deleted
 *       500:
 *         description: something went wrong
*/




const express = require('express');
const ProductModel = require('../models/Product.model');
const CartModel = require('../models/cart.model');
const cartRoute = express.Router();

//for adding products into the cart
cartRoute.post("/add-to-cart/:id", async (req, res)=>{
    try {
        const {id} = req.params
        const findProduct = await ProductModel.findOne({_id:id}) 
        if(findProduct.avaliability==="No"){
            return res.status(404).send({
                msg:"Product is not Avaliable"
            })
        }
        if(!findProduct){
            return res.status(404).send({
                msg:"No Product found to add to cart"
            })
        }
        const addProduct = await CartModel({title: findProduct.title, price: findProduct.price})
        addProduct.userID = req.body.userID
        await addProduct.save()

        res.status(200).send({
            msg:`${findProduct.title} Add to cart successfully`
        })
    } catch (error) {
        res.status(500).send({
            msg: `${error.message} Product not found`
        })
    }
})

//for viewing the cart items
cartRoute.get("/view-cart", async (req, res) => {
    try {
      const view_cart = await CartModel.find({userID: req.body.userID})
       if(view_cart.length===0){
        return res.status(404).send({
            msg :"Cart is empty"
        })
       } 
       res.status(200).send({
        msg: view_cart
       })
    } catch (error) {
        res.status(500).send({
            msg:`error getting Car ${error.message}`
        })
    }

})

//for updating quantity
cartRoute.patch("/updateQuantity/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({
                msg: "Quantity must be a positive number"
            });
        }

        const existingCart = await CartModel.findById(id);
        if (!existingCart) {
            return res.status(404).json({
                msg: "Cart item not found"
            });
        }

        existingCart.quantity = quantity;
        await existingCart.save();

        res.status(200).json({
            msg: `Your updated quantity is: ${quantity}`,
            data: existingCart
        });
    } catch (error) {
        res.status(500).json({
            msg: error.message
        });
    }
});


//for deleting product from cart
cartRoute.delete("/deleteproduct/:id", async (req, res) => {
    try {
        const {id} = req.params
        const deleteItemInCart = await CartModel.findByIdAndDelete({_id:id})
        res.status(200).send({
            msg:"Product removed successfully from your cart"
        })
    } catch (error) {
        res.status(500).send({
            msg:error.message
        })
    }
   
})

module.exports = cartRoute