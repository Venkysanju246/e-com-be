const express = require('express')
const connectionToDb = require('./config/connection')
const UserRoute = require('./controllers/user.controller')
const cokkies = require("cookie-parser")
const productRoute = require('./controllers/products.controllers')
const auth = require('./middleware/Auth.middleware')
const cartRoute = require('./controllers/cart.controllers')
const orderRoute = require('./controllers/order.controller')
const swaggerjsdoc = require("swagger-jsdoc")
const swaggerui = require("swagger-ui-express")
const app = express()
app.use(express.json())
require("dotenv").config()
app.use(cokkies())

app.use("/user", UserRoute)
app.use("/product", auth, productRoute)
app.use("/cart",auth, cartRoute)
app.use("/cartorder", auth, orderRoute)

const options = {
    definition:{
        openapi:"3.0.0",
        servers:[
            {
                url:"http://localhost:8080/"
            }
        ]
    },
    apis:["./controllers/*.js"]
}

const spacs = swaggerjsdoc(options)
app.use(
    "/api-docs",
    swaggerui.serve,
    swaggerui.setup(spacs)
)

app.listen(process.env.PORT, async()=>{
    try {
        await connectionToDb
        console.log("Connected to database")
    console.log(`listening on port ${process.env.PORT}`)

    } catch (error) {
        console.log(`Error connecting to database ${error.message}`)
    }
})