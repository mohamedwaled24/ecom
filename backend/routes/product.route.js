import express from "express"
import { createProduct, 
         deleteProduct, 
         featuredProducts, 
         GetAllProducts, 
         getProductsByCategory, 
         getRecommendedProducts, 
         toggleFeaturedProducts } from "../controllers/product.controller.js"
import { adminRoute, protectRoute } from "../middleware/protectRoute.js"


const router = express.Router()


router.get('/' , protectRoute , adminRoute ,GetAllProducts)

router.get('/featured'  ,featuredProducts)

router.get('/recommendations' , protectRoute , getRecommendedProducts)

router.get('/category/:category' , getProductsByCategory)

router.post('/' , protectRoute , adminRoute , createProduct)

router.delete('/:id' , protectRoute , adminRoute , deleteProduct)

router.patch('/:id' , protectRoute , adminRoute , toggleFeaturedProducts)

export default router