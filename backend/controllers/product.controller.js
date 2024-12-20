import { json } from 'express'
import {redis} from '../lib/redis.js'
import Product from "../model/product.model.js"
import cloudinary from '../lib/cloudinary.js'



async function updateFeaturedProductsCash() {
    try {
        const featuredProducts = await Product.find({isFeatured:true}).lean()
        await redis.set('featured-products' ,JSON.stringify(featuredProducts))
    } catch (error) {
        console.log('error in updating featured products in cash memroy')
        
    }
    
}

export const GetAllProducts = async (req , res) => {
    try {
        const products = await Product.find({})

        if(products){
            return res.status(200).json({products})
        }else{
            return res.status(404).json({message : "No Products Found"})
        }
        
        
    } catch (error) {
        console.log('Error from Get All Products Function')
        res.status(500).json("couldn't fetch products")
        
    }

}

export const featuredProducts = async (req , res) => {
    try {
        // let featuredProducts = await redis.get('featured-products')

        // if(!featuredProducts){
        //     console.log('no featured 1')
        //     featuredProducts= await Product.find({isFeatured:true})
        //     console.log(featuredProducts)
        //     if(!featuredProducts){
        //         console.log('no featured 2')
        //         return res.status(404).json({message:'no featured products found'})
        //     }else{
        //         console.log(' featured 1')
        //         await redis.set('featured-products' , JSON.stringify(featuredProducts))
        //         res.json(featuredProducts)

        //     }
        // }else{
        //     console.log(' featured 2')
        //     res.status(200).json(JSON.parse(featuredProducts))
        // }


        // ######## Main FUnction #########
        console.log('hello')
        
        let featuredProducts = await redis.get("featured-products")
        if(featuredProducts){
            console.log('first')
            return res.status(200).json(JSON.parse(featuredProducts))
           

        }
        console.log('second')
        featuredProducts = await Product.find({isFeatured:true}).lean()
       

        if(!featuredProducts){
            console.log('third')
            return res.status(404).json({message : "No Featured Products Found"})

            
        }

        await redis.set('featured-products' , JSON.stringify(featuredProducts))
        res.status(200).json({featuredProducts})
    } catch (error) {
        console.log('Error in FeaturedProducts Function')
        res.status(500).json({Message : error.message})
    }
}

export const createProduct = async (req , res) => {
    try {
        const { name , description , price , image , category} = req.body
        let cloudinaryResponse = null
        if(image){
             cloudinaryResponse = await cloudinary.uploader.upload(image,{folder:'products'})
        }
        const product =await  Product.create({
            name,
            description,
            price,
            image:cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : '',
            category 
        })
        await product.save()

        res.status(200).json(product)
       
        
    } catch (error) {
        console.log('error in createProduct Function Controller' , error.message)
        res.status(500).json({message:error.message})
    }
}

export const deleteProduct = async (req , res) => {
    try {
        const produtcId = req.params.id
        const product = await Product.findById(produtcId)
        if(!product){
            return res.status(404).json({message:'Product Not Found'})
        }
        if(product.image){
            const publicId = product.image.split('/').pop().splite('.')[0]
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`)
                console.log('Image Deleted Successfully')
                
            } catch (error) {
                console.log('error deleteing image from cloudinary')
                
            }
        }
        await Product.findByIdAndDelete(produtcId)
        res.status(201).json({message:'Product Deleted Successfully'})
    } catch (error) {
        console.log('Error from delteing product controller')
        res.status(500).json({message:"Error from deleting product controller"})
    }
} 

export const getRecommendedProducts = async (req,res) => {
    try {
        const products = await Product.aggregate([
            {
                $sample:{size:3}
            },
            {
                $project:{
                    _id:1,
                    name:1,
                    image:1,
                    description:1,
                    price
                }
            }
        ])
        res.status(200).json(products)
    } catch (error) {
        console.log('Error from get recommendation function controller')
        res.status(500).json({message:'Error from fetching recommended products'})
        
    }
}

export const getProductsByCategory= async (req,res) =>{
    try {
        const {category} = req.params
        const products = await Product.find({category})
        res.status(200).json(products)
    } catch (error) {
        console.log('Error from Get products by category controller')
        res.status(500).json({message:'Error During fetching products by category'})
        
    }

}

export const toggleFeaturedProducts = async (req,res) => {
    try {
        const product = await Product.findById(req.params.id)
        if(product){
            product.isFeatured = !product.isFeatured
            const updateProduct = await Product.save()
            await updateFeaturedProductsCash()
            res.status(200).json(updateProduct)
        }else{
            res.status(404).json({message:'Product Not Found'})
        }
    } catch (error) {
        console.log('Error From Toggle featured products controller')
        res.status(500).json({message:'Server error from toggle featured products'})
        
    }
}