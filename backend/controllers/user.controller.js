import User from '../model/user.model.js'
import jwt from 'jsonwebtoken'
import {redis} from "../lib/redis.js"
import crypto from 'crypto'
import { sendVerificationEmail, sendWelcomEmail, sendPasswordResetEmail , sendResetPasswordEmail} from '../mailtrap/emails.js';

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
        return res.status(400).json({message:'Email Already Exists'})
    }
    //save user to the database
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString()
    const user = await User.create({
        name,
        email,
        password,
        verificationToken,
        verificationTokenExpiresAt:Date.now() + 24 * 60 *60 *1000
    })

    sendVerificationEmail(user.email , user.name, verificationToken)
    // authentication
    // distribute both acces and refresh token from generateToken function
    const {accessToken , refreshToken } = generateTokens(User._id)
    // store the  refresh-tpken to the database
    await storeRefreshToken(user._id , refreshToken)

    // set cookies ( both access and refresh token )
    setCookies(res,accessToken , refreshToken)

    res.status(200).json({
        user:{
            ...user._doc,
            password:undefined
        }
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
        user.lastLogin= new Date()
        await user.save()
        // set token to the cookie
        setCookies(res , accessToken , refreshToken )
        res.status(200).json({
            message:'user logged in successfully',
            user:{
                ...user._doc,
                password:undefined
            }
        })


    }else{

        res.status(400).json({message:'invalid email or password'})
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
        console.log('refresh token is created successfully')
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

export const verifyEmail = async (req , res)=>{
    const {code} = req.body
    try {
        const user = await User.findOne({verificationToken:code ,
            verificationTokenExpiresAt:{$gt:Date.now()}
        })
        if(!user){
          return  res.status(404).json({message:'Invalid or expired code'})
        }
        user.isVerified=true
        user.verificationToken=undefined
        user.verificationTokenExpiresAt=undefined
        await sendWelcomEmail(user.email , user.name)
        await user.save()
        res.status(200).json({message:'Email Verified Successfully'})
        
    } catch (error) {
        console.log('Error from verifying email')
        res.status(500).json({message:'Error while verifying email'})
        
    }
}

export const forgotPassword = async (req,res)=>{
    const {email} = req.body
    console.log('hello from email')
    try {
        const user = await User.findOne({email})
        console.log('hello from user')

        if(!user){
            return res.status(404).json({message:"Invalid Email Address"})
        }

        const resetToken = crypto.randomBytes(20).toString("hex")
        const resetTokenExpiresAt = Date.now(0) +1*60*60*1000

        user.resetPasswordToken = resetToken
        user.resetPasswordTokenExpiresAt = resetTokenExpiresAt

        await user.save()
        console.log('saving user')

        await sendPasswordResetEmail(user.email , `${process.env.BASE_URL}/reset-password/${resetToken}`)
        res.status(200).json({message:'Please check your email'})
        
    } catch (error) {
        console.log('Error from verifying email')
        res.status(500).json({message:'Error from forgot password'})
        
    }
}

export const resetPassword = async (req,res)=>{
    const {token} = req.params
    const {password} = req.body
    try {
       const user = await User.findOne({
        resetPasswordToken:token,
        resetPasswordTokenExpiresAt:{$gt:Date.now()}
       }) 

       if(!user){
        return res.status(404).json({message:"Invalid or expired reset password link"})
    }
      user.password=password
      user.resetPasswordToken=undefined
      user.resetPasswordTokenExpiresAt=undefined
      await user.save()
      await sendResetPasswordEmail(user.email)
      res.status(200).json({message:'Password has changed successfully'})
      

    } catch (error) {
        console.log('Error from verifying email')
        res.status(500).json({message:'Error from reset password'})
        
    }
        
    }

 export const checkAuth = async(req,res)=>{
    try {
        const user = await User.findById(req.user._id).select("-password")
        console.log('bla bla bla')
        if(!user){
            return res.status(404).json({message:'User Not Found'})
        }
         res.status(200).json({user})
        
    } catch (error) {
        console.log('Error from checking auth')
        console.log(error.message)
        res.status(500).json({message:error.message})
        
        
    }
 }
