import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        min:0,
        required:true
    },
    isFeatured:{
        type:Boolean,
        default:false
    },
    image:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true

    }
},
{timestamps:true})


const Product = mongoose.model('Product' , productSchema)

export default Product;