const jwt = require("jsonwebtoken")
require("dotenv").config()


  const auth = (req, res, next)=>{
    const {AccessToken} = req.cookies
    if(AccessToken){
        const tokenVerify = jwt.verify(AccessToken,process.env.JWT_SECRET, (err, decoded)=>{
            if(decoded){
                req.body.userID = decoded.userID
                next()
            }else{
                res.status(401).send({
                    msg :"Toekn verification failed!!"
                })
            }
        } )
      
    }else{
        res.status(403).send({
            msg :"No Token Found!!"
        })
    }
  }

  module.exports = auth