import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        unique:true
    },
    products:[
        {
         product:{
          type:mongoose.Schema.Types.ObjectId,
          required:true,
          unique:true
    },
    amount:{
        type:Number,
        required:true,
    },
    quantity:{
        type:Number,
        required:true,
        min:0
    }
        }
    ],
    totalAmount:{
        type:Number,
        required:true,
        min:0
    },
    stripeSessionId:{
        type:String,
        unique:true
    }
})

const Order = mongoose.model("Order" , orderSchema)

export default Order;