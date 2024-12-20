import mongoose from "mongoose";
import bcrypt from "bcrypt"

const userSchema =new mongoose.Schema({
    name:{
        type:String,
        required:[true , 'Name is required']
    },
    email:{
        type:String,
        required:[true,'Email is required'],
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:[true,'PAssword is required'],
        minlength:[6,'Password must be at least 6 characters']
    },
    cartItems:{
        quantity:{
            type:Number,
            defualt:1
        },
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product'
        }
    },
    role:{
        type:String,
        enum:['Customer','Admin'],
        default:'Customer'
    }
} , {
    timestamps:true
})

userSchema.pre('save',async function (next){
    if(!this.isModified('password')) return next();
        try {
         
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password,salt)
            next()
        } catch (error) {
            next(error)
            
        }
});


userSchema.methods.comparePassword = async function (password ){
  return await  bcrypt.compare(password,this.password)
}


const User = mongoose.model('User',userSchema)

export default User