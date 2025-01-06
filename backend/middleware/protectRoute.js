import jwt from "jsonwebtoken"
import User from "../model/user.model.js"

export const protectRoute= async(req , res ,next)=>{
    try {
        const accessToken = req.cookies.accessToken

        if(!accessToken){
            console.log('hello from prtotected routee no token ')
            return res.status(401).json('UnAuthorized Access denied - No Token Provided')
        }
        try {
            const decoded = jwt.verify(accessToken , process.env.ACCESS_TOKEN_SECRET)
            const user = await User.findById(decoded.userId).select('-password')
            console.log(user)
            if(!user){
                res.status(40).json({message:'User Not Found'})
                console.log('hello from no user')
            }
            req.user= user

            next()
            
        } catch (error) {
            if(error.name === "TokenExpiredError"){
                res.status(401).json({message: "Unauthorized Access Token Expired"})
            }
            
        }
    } catch (error) {
        return res.status(401).json({message: "Unauthorized - Invalid Access Token"})
        
    }

}

export const adminRoute = async (req,res,next)=>{

    try {
        if(req.user && req.user.role === 'Admin'){
            next()
        }else{
            res.status(401).json({message:'Unauthorized - Admin Only'})
        }
    } catch (error) {
        res.sttaus(401).json({message:'Unauthorized - Admin Only'})
    }
}