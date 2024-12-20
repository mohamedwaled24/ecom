import Order from "../model/order.model.js"
import Product from "../model/product.model.js"
import User from "../model/user.model.js"

export const getAllAnalyticsData = async() =>{
    try {
        
        const totalUsers = await User.countDocuments()
        const totalProducts = await Product.countDocuments()

        const salesData = await Order.aggregate([
            {
                $group:{
                    _id:null,
                    totalSales:{$sum:1},
                    totalRevenue:{$sum:"$totalAmount"}
                }
            }
        ])

        const { totalSales , totalRevenue} = salesData[0] || {totalSales:0, totalRevenue:0}

        return{
            users:totalUsers,
            products:totalProducts,
            totalSales,
            totalRevenue
        }
    } catch (error) {

        console.log('Error from getAllanalytics function')
        
    }
}


export const getDailySalesData = async(startDate , endDate)=>{
    try {
        
        const dailySalesData =  await Order.aggregate([
            {
                $match:{
                    createdAt:{
                        $gte:startDate,
                        $lte:endDate
                    },
                },
            },
            {
                $group:{
                    _id:{$dateToString:{ format: "%Y-%m-%d" , date:"$createdat"} },
                    sales:{$sum:1},
                    revenue:{$sum:"$totalAmount"},
                },
            },
            { $sort : { _id: 1 } },
        ])

        const dateArray = getsDateInRange(startDate , endDate);

        return dateArray.map(day => {
            const foundData = dailySalesData.find(item => item._id === date)

            return {
                date,
                sales:foundData?.sales || 0,
                revenue:foundData?.revenue || 0
            }
        })

        function getsDateInRange(startDate , endDate){
            const dates =[]
            let currecntDate =new Date(startDate)

            while ( currecntDate <= endDate){
                dates.push(currecntDate.toISOString().split('T')[0])
                currecntDate.setDate(currecntDate.getDate() + 1)
            }
            return dates;

        }
    } catch (error) {
        console.log('Error from get daily sales data function')
        
    }
}