import express, { json } from "express";
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import cors from 'cors'

import connection from "./lib/db.js";

import userRoute from './routes/auth.route.js'
import productRoute from "./routes/product.route.js"
import cartRoute from "./routes/cart.route.js"
import couponRoute from "./routes/coupon.route.js"
import paymentRoute from "./routes/payment.route.js"
import analyticsRoute from "./routes/analytics.route.js"

dotenv.config()

const app = express();
const port =process.env.PORT || 5000

app.use(cors({origin:'http://localhost:5173' ,credentials:true}))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', userRoute)
app.use('/api/products', productRoute)
app.use('/api/cart', cartRoute)
app.use('/api/coupon', couponRoute)
app.use('/api/payment', paymentRoute)
app.use('/api/analytics', analyticsRoute)

app.listen(port ,()=>{
   console.log('server running on port 5000')
   connection()
})