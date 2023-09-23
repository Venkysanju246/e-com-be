/**
 * @swagger
 * components:
 *   schemas:
 *     products:
 *       type: object
 *       required:
 *         - title
 *         - price
 *         - description
 *         - category
 *         - avaliability
 *         - stockCount
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
 *         category:
 *           type: string
 *           description: The category of the product
 *         avaliability:
 *           type: string
 *           description: The availiablity of the product (Yes/No)
 *         stockCount:
 *           type: number
 *           description: The stock count of the product
 *     
 */
/**
* @swagger
 * tags:
*   name: Add Product
*   description: Adding a product
* /product/add:
*   post:
*     summary: Add Product
*     tags: [products]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/products'
*     responses:
*       200:
*         description: Product added successfully.
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/products'
*       500:
*         description: Some server error
 * /product/all:
 *   get:
 *     summary: Retrive all the prodiucts added by particular user
 *     tags: [products]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/products'
  * /product/singleproduct/{id}:
 *   get:
 *     summary: Get the product details by its id
 *     tags: [products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product id
 *     responses:
 *       200:
 *         description: Single product details
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/products'
 *       404:
 *         description: The product was not found
   * /product/singleproductbycategory?category={category}:
 *   get:
 *     summary: Get all the product by its category name
 *     tags: [products]
 *     parameters:
 *       - in: path
 *         name: category
 *         schema:
 *           type: string
 *         required: true
 *         description: The product category
 *     responses:
 *       200:
 *         description: All product details based on the category
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/products'
 *       404:
 *         description: The product was not found
*/




const express = require('express');
const ProductModel = require('../models/Product.model');
const productRoute = express.Router();
const  OpenAI  = require('openai').OpenAI;
require("dotenv").config();



async function correctProductDetails(productDetails) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAPIKEY,
    });

    const prompt = `I want you to act as a spell-checker for a given JSON object. Your job is to scan through the given object and identify any spelling mistakes and returns the corrected JSON object in the same format.

    JSON Object:
    ${JSON.stringify(productDetails)}`;

    const response = await openai.completions.create({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 300,
    });

    const responseData = response.choices[0].text.trim();

    const firstBraceIndex = responseData.indexOf('{');

    if (firstBraceIndex !== -1) {
        const trimmedJSON = responseData.substring(firstBraceIndex);
        try {
            const correctedProductDetails = JSON.parse(trimmedJSON);

            return correctedProductDetails;
        } catch (error) {
            console.error("Error parsing corrected JSON:", error);
        }
    } else {
        console.error("No JSON object found in response data:", responseData);
    }

    return null;
}


//for adding products
productRoute.post("/add", async (req, res) => {
    try {
        const payload = req.body;
        payload.userID = req.body.userID;

        const correctedProductDetails = await correctProductDetails(payload);

        if (!correctedProductDetails) {
            throw new Error("Error correcting product details.");
        }

        const addProduct = await ProductModel(correctedProductDetails);
        await addProduct.save();

        res.status(201).send({
            msg: 'Product added successfully'
        });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).send({
            msg: error.message
        });
    }
});

//for getting all products
productRoute.get("/all", async(req, res) => {
    try {
    const allProducts = await ProductModel.find({userID: req.body.userID})
        res.status(200).send({
            msg:allProducts
        })
    } catch (error) {
        res.status(404).send({
            msg: `${error.message} Product not found`
        })
    }

})

//for getting product details by specific id
productRoute.get("/singleproduct/:id", async (req, res) => {
    try {
        const { id } = req.params
        const findProduct = await ProductModel.findOne({ _id: id })
        if (!findProduct) {
            return res.status(404).send({ 
                msg: 'Product not found'
             });
        }
        res.status(200).send({
            msg: findProduct
        })
    } catch (error) {
        res.status(500).send({
            msg: `${error.message} Product not found`
        })
    }
})

//getting all the products quered by category
productRoute.get("/singleproductbycategory", async (req, res) => {
    try {
        const category = req.query.category;
        if (!category) {
            return res.status(400).send({ msg: 'Category parameter is missing' });
        }

        const findProductbyCategory = await ProductModel.find({ category, userID : req.body.userID });
        if (findProductbyCategory.length === 0) {
            return res.status(404).json({ msg: `No products found for category: ${category}` });
        }
        if (!findProductbyCategory) {
            return res.status(404).send({ msg: `Product not found for category: ${category}` });
        }

        res.status(200).send({ msg: findProductbyCategory });
    } catch (error) {
        res.status(500).send({
             msg: `${error.message} Product not found`
            });
    }
});


module.exports = productRoute