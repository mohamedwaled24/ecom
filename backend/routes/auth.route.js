import express from 'express'
import { forgotPassword, login, logout, refreshToken, signup, verifyEmail , resetPassword , checkAuth} from '../controllers/user.controller.js'
import { protectRoute } from '../middleware/protectRoute.js'
const router = express.Router()

router.post('/signup', signup)

router.post('/login', login)

router.post('/logout', logout)

router.post('/refresh-token', refreshToken)

router.post('/verify-email' , verifyEmail)

router.post('/forgot-password' , forgotPassword)

router.post('/reset-password/:token' , resetPassword)

router.get('/check-auth' ,protectRoute , checkAuth)

export default router
