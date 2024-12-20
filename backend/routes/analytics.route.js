import express from 'express'
import { adminRoute, protectRoute } from '../middleware/protectRoute.js'
import { getAllAnalyticsData, getDailySalesData } from '../controllers/analytics.controller.js'

const router = express.Router()


router.get('/' , protectRoute , adminRoute , async ( req , res ) => {
    try {

        const analyticsData = await getAllAnalyticsData()
        const endDate = new Date()
        const startDate= new Date(endDate.getTime() - 7*24*60*60*1000)

        const dailySalesData = await getDailySalesData(startDate , endDate)

        res.status(200).json({
            analyticsData,
            dailySalesData
        })
        
    } catch (error) {
        console.log('error from analytics controller')
        res.status(500).json({
            message:'Server Error',
            error:error.message
        })
        
    }
})

export default router