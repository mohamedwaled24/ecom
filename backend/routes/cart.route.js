import express from 'express'
import { protectRoute } from '../middleware/protectRoute.js'
import { addToCart, 
         getAllCartItems, 
         removeAllFromCart, 
         updateCartItems } from '../controllers/cart.route.js'
         

const router = express.Router()



router.get('/' , protectRoute , getAllCartItems)

router.post('/' , protectRoute , addToCart)

router.put('/:id' , protectRoute , updateCartItems)

router.delete('/' , protectRoute , removeAllFromCart)



export default router