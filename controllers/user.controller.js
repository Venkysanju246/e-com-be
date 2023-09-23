/**
 * @swagger
 * components:
 *   schemas:
 *     users:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - phone
 *       properties:
 *         email:
 *           type: string
 *           description: The email of user
 *         password:
 *           type: string
 *           description: The password of user
 *         phone:
 *           type: number
 *           description: The phone number of user
 *     
 */
/**
* @swagger
 * tags:
*   name: Registration
*   description: The users Auth API
* /user/register:
*   post:
*     summary: Register a user
*     tags: [users]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/users'
*     responses:
*       200:
*         description: User Successfully Registered.
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/users'
*       500:
*         description: Some server error
* /user/login:
*   post:
*     summary: Login a user
*     tags: [users]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/users'
*     responses:
*       200:
*         description: Login Success.
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/users'
*       500:
*         description: Some server error

 */



const express = require('express')
const UserRoute = express.Router()
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const { createTransport } = require("nodemailer")
const UserModel = require('../models/user.model')
require("dotenv").config()

UserRoute.post("/register", async (req, res) => {
    try {
        const { email, password, phone } = req.body
        const userCheck = await UserModel.findOne({ email })
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).send({
                msg: "Invalid phone number format. It should be exactly 10 digits."
            });
        }

        if (userCheck) {
            return res.status(401).send({
                msg: "User Already Registered, Please Login !"
            })
        } else {
            bcrypt.hash(password, 5, async (err, hash) => {
                const newUser = new UserModel({ email, password: hash, phone })
                await newUser.save()

                const transporter = createTransport({
                    host: process.env.MAIL_HOST,
                    port: process.env.MAIL_PORT,
                    auth: {
                        user: process.env.MAIL_USER,
                        pass: process.env.MAIL_API_KEY
                    }
                })

                const mailOptions = {
                    from: process.env.MAIL_USER,
                    to: email,
                    subject: "Welcome Message",
                    text: "Registration Successful.",
                    html: "Congratulations! Your account registration has been successfully completed. Please proceed to login:"
                }
                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        return res.status(500).send({
                            msg: err.message
                        })
                    } else {
                        return res.status(200).send({
                            msg: "Email sent successfully"
                        })
                    }
                })

                res.status(201).send({
                    msg: `User Successfully Registered`
                })
            })
        }
    } catch (error) {
        res.status(400).send({
            msg: error.message
        })
    }
})

UserRoute.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body
        const userCheck = await UserModel.findOne({ email })
        if (userCheck) {
            bcrypt.compare(password, userCheck.password, (err, result) => {
                if (result) {
                    const token = jwt.sign({ userID: userCheck._id }, process.env.JWT_SECRET, { expiresIn: "7d" })
                    res.cookie("AccessToken", token, { maxAge: 1000 * 60 * 17 })
                    return res.status(200).send({
                        msg: "Login Success",
                        token: token
                    })
                } else {
                    return res.status(401).send({
                        msg: "Invalid password"
                    })
                }
            })
        } else {
            return res.status(401).send({
                msg: "No User Found, Please Register First!"
            })
        }
    } catch (error) {
        return res.status(401).send({
            msg: error.message
        })
    }
})

module.exports = UserRoute