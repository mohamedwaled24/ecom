import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema({
    code:{
        type:String,
        unique:true,
        required:true
    },
    disccountPercentage:{
        type:Number,
        min:0,
        max:100,
        required:true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        unique:true
    },
    expirationDate:{
        type:Date,
        required:true
    },
    isActive:{
        type:Boolean,
        default:true
    }
},{
    timestamps:true
})

const Coupon = mongoose.model('Coupon' , couponSchema);
export default Coupon;