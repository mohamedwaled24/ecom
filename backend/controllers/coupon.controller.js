import Coupon from '../model/coupon.model.js'

export const getCoupon = async (req , res) => {
    try {
        const coupon = await Coupon.findOne({ userId:req.user._id , isActive:true})

         res.status(200).json(coupon || null)
        
    } catch (error) {
        console.log('Error from get Coupon controller')

        res.status(500).json({message:'Server Error from get coupon' , error:error.message})
        
    }
}

export const validateCoupon = async (req , res ) => {
    try {
        const {code} = req.body
        const coupon = await Coupon.findOne({code:code , userId:req.user._id , isActive:true})

        if(!coupon){
            return res.status(404).json({message: 'Invalid or Expired Coupon'})
        }

        if(coupon.expirationDate < new Date()){
            coupon.isActive = false

            await coupon.save()

            return res.status(404).json({message: 'Invalid or Expired Coupon'})
        }

        res.status(200).json({
            message:'Coupon is valid',
            code:coupon.code,
            disccountPercentage:coupon.disccountPercentage
        })

        
    } catch (error) {
        console.log('Error from get Coupon controller')

        res.status(500).json({message:'Server Error from validate coupon' ,error:error.message})
        
    }
} 