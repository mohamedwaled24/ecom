import User from '../model/user.model.js'
import jwt from 'jsonwebtoken'
import {redis} from "../lib/redis.js"

// generate both acces/refresh-token by using jwt
const generateTokens = (userId)=>{
    const accessToken = jwt.sign({userId} , process.env.ACCESS_TOKEN_SECRET , {
        expiresIn:'15m'
    })

    const refreshToken = jwt.sign({userId} , process.env.REFRESH_TOKEN_SECRET , {
        expiresIn:'7d'
    })
     return {accessToken , refreshToken}
    
};
// store refresh token in redis database
const storeRefreshToken = async(userId , refreshToken)=>{
   await redis.set(`refresh_token:${userId}` , refreshToken , "EX" ,7*24*60*60);
}
// set refresh-token and access-token to cookies
const setCookies = (res, accessToken , refreshToken)=>{
    res.cookie("accessToken" , accessToken , {
        httpOnly:true,
        secure:process.env.NODE_ENV ==='production',
        sameSite:'strict',
        maxAge:15*60*1000
    })
    res.cookie("refreshToken" , refreshToken , {
        httpOnly:true,
        secure:process.env.NODE_ENV ==='production',
        sameSite:'strict',
        maxAge:7*24*60*60*1000
    })
}
export const signup = async (req , res) => {
try {
    // parse the data sent from req 
    const {name , password , email} = req.body

    //check befor saving whether email is exists and used befor or no
    const checkEmail = await User.findOne({email})
    
    if(checkEmail){
        return res.status(400).json('Email Already Exists')
    }
    //save user to the database
    const user = await User.create({
        name,
        email,
        password
    })

    // authentication
    // distribute both acces and refresh token from generateToken function
    const {accessToken , refreshToken } = generateTokens(User._id)
    // store the  refresh-tpken to the database
    await storeRefreshToken(user._id , refreshToken)

    // set cookies ( both access and refresh token )
    setCookies(res,accessToken , refreshToken)

    res.status(200).json({
        id:user._id,
        name:user.name,
        email:user.email,
        role:user.role
    })
} catch (error) {
   res.status(400).json({message: error.message})
    
}
}
export const  login = async (req , res) => {
 try {
    const {email , password} = req.body
    // check and get user from db
    const user= await User.findOne({email})
    //check whether user exsits and passsword is correct or no
    if(user && (await user.comparePassword(password))){
        //generate access and refresh tokens
        const {accessToken , refreshToken} = generateTokens(user._id)
        // store refresh token to redis db
        await storeRefreshToken(user._id , refreshToken)
        // set token to the cookie
        setCookies(res , accessToken , refreshToken )
        res.status(200).json({
            message:'user logged in successfully',
            _id:user._id,
            name:user.name,
            email:user.email,
            role:user.role
        })


    }else{

        res.status(400).json({error:'invalid email or password'})
    }

    
 } catch (error) {
    console.log(error.message)
    res.status(500).json({message:error.message})
    
 }
}
export const logout = async ( req , res ) =>{

    try {
        const refreshToken = req.cookies.refreshToken

        if(refreshToken){
            const decoded = jwt.verify(refreshToken , process.env.REFRESH_TOKEN_SECRET)
            await redis.del(`refresh_token:${decoded.userId}`)
        }

        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')
        res.json({
            message:'Logged Out Successfully '
        })
        
    } catch (error) {
        res.status(500).json({
            message:"Server Error " , error :error.message
        })
        
    }

}
export const refreshToken =  async (req , res ) => {
    try {
        const refreshToken = req.cookies.refreshToken

        if(!refreshToken){
            return res.status(401).json({message : ' No refresh token provided'})
        }
        
        const decoded = jwt.verify(refreshToken , process.env.REFRESH_TOKEN_SECRET)

        const storedToken = await redis.get(`refresh_token:${decoded.userId}`)

        if(refreshToken !== storedToken){
            return res.status(400).json('Invalid refresh Token')
        }

        const accessToken = jwt.sign({userId:decoded.userId} , process.env.ACCESS_TOKEN_SECRET , {
            expiresIn:'15m'
        })
        res.cookie('accessToken' , accessToken , {
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            sameSite:"strict",
            maxAge:15*60*1000
        })
        res.status(200).json({message: ' Token Refreshed Successfully'})
        
    } catch (error) {
        console.log('Error in refresh token controller' , error.message)
        res.status(500).json('Error while refresing token from server')
    }
}