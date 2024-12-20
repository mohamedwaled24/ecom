import Coupon from '../model/coupon.model.js';
import Order from '../model/order.model.js'
import stripe from '../lib/stripe.js'


export const  createCheckoutSession =  async ( req , res ) =>{
    try {
        const {products , couponCode} = req.body;

        if(!Array.isArray(products) || products.length === 0){
            return res.status(404).json({message:'Products Array Not Found Or Is Empty'})
        }

        let totalAmount =0

        const lineItems = products.map(product =>{
            const amount = Math.round(product.price * 100)
            totalAmount += amount * product.quantity

            return {
                price_data:{
                    currency:'usd',
                    product_data:{
                        name:product.name,
                        image:[product.image]
                    },
                    unit_amount:amount
                }
            }
        })

        let coupon = null
        if(couponCode){
            coupon = await Coupon.findOne({code:couponCode , userId:req.user._id , isActive:true})
            if(coupon){
                totalAmount -= Math.round( amount * coupon.disccountPercentage / 100)
            }
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types:['card'],
            line_items:lineItems,
            mode:'payment',
            success_url:`${process.env.BASE_URL}/purhase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url:`${process.env.BASE_URL}/purhase-cacel`,
            discounts: coupon 
            ? [
                {
                    coupon : await createStripeCoupon(coupon.disccountPercentage)
                }

            ]
            : [],
            metadata:{
                userId:req.user._id.toString(),
                couponCode:couponCode || ""
            }

        })
        if(totalAmount >= 20000){
            await createNewCoupon(req.user._id)
        }
        res.status(200).json({
            id:session.id,
            totalAmount:totalAmount / 100
        })
        
    } catch (error) {
        res.status(500).json({mesage:"Server Error at create checkout session" , error:error.message})
        
    }
} 


export const checkoutSuccess =  async (req , res )=>{
    try {
        const{sessionId} =req.body;

        const session = await stripe.checkout.sessions.retrieve(sessionId)

        if(session.payment_status === 'paid'){
            
            if(session.metadata.couponCode){
                await Coupon.findOneAndUpdate({
                    code:session.metadata.couponCode , userId:req.user._id
                },{
                    isActive:false
                })
            }

            const products = JSON.parse(session.metadata.products)
            const newOrder = new Order({
                user:session.metadata.userId,
                products: products.map(product => ({
                    product:product.id,
                    quantity:product.quantity,
                    price:product.price
                })),
                totalAmount :session.amount_total / 100 ,
                stripeSessionId:sessionId
            })

            await newOrder.save()

            res.status(200).json({
                success:true,
                message:'Payment successfull , order created , and coupon deactivated if used',
                orderId:newOrder._id
            })
        }
    } catch (error) {
        console.log('error from checkout success controll')

        res.status(500).json({message:'Server Error from checkout success controller ' , error:error.message})
        
    }
}

async function createStripeCoupon(disccountPercentage){
    const coupon = await stripe.coupons.create({
        percent_off:disccountPercentage,
        duration:'once'
    });
    return coupon.id
}

async function createNewCoupon(userId){
    const newCoupon = new Coupon({
        code: 'GIFT' + Math.random().toString(36).substring(2,8).toUpperCase(),
        disccountPercentage:10,
        expirationDate:new Date(Date.now() + 30 * 24 * 60 *60 * 1000),
        userId:userId
    })
    await newCoupon.save()
    return newCoupon
}
