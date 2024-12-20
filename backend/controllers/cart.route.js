import Product from '../model/product.model.js'

export const getAllCartItems = async (req,res) => {
    try {
       const products = await Product.find({_id:{$in:req.user.cartItems}})

       const cartItems = products.map(product => {
        const item = req.user.cartItems.find(cartItem => cartItem.id === product.id)
        return {...product.toJSON() , quantity:item.quantity}
       })
       res.status(200).json(cartItems)

    } catch (error) {
        console.log('error from get all cart items controller')
        res.status(500).json({message:'server error' , error:error.message})
        
    }
}

export const addToCart = async(req , res) => {
    try {
        const {productId} = req.body;
        const user = req.user

        const existingItem = user.cartItems.find(item => item.id === productId)

        if(existingItem){
            existingItem.quantity += 1;
        }else{
            user.cartItems.push(productId)
        }
        await user.save()
        res.status(201).json(user.cartItems)
    } catch (error) {
        console.log('error from add to cart controller')
        res.status(500).json({message:'server error' , error:error.message})
        
    }
}

export const removeAllFromCart = async ( req , res ) => {
    try {
        const {productId} = req.body;
        const user = req.user;

        if(!productId){
            user.cartItems =[]
        }else{
            user.cartItems = user.cartItems.filter((item)=> item !== productId)
        }
        await user.save()

        res.status(200).json(user.cartItems)


    } catch (error) {
        console.log('error from remove all from cart controller')
        res.status(500).json({message:'server error' , error:error.message})
        
    }
}

export const updateCartItems = async (req , res ) => {
    try {
        const {id:productId} = req.params;
        const {quantity} = req.body
        const user = req.user

        const existingItem = user.cartItems.find(item=> item.id === productId)

        if(existingItem){
            if(quantity === 0){
              user,cartitems=  user.cartItems.filter(item=>item.id !== productId)
                await user.save()
                res.status(200).json(user.cartitems)
            }
            existingItem.quantity = quantity
            await user.save()
            res.status(200).json(user.cartitems)
        }else{
            res.status(404).json({message:'Product Not Found to add'})
        }
        
    } catch (error) {
        console.log('error from update cart items controller')
        res.status(500).json({message:'server error' , error:error.message})
        
    }
}