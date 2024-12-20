import mongoose from "mongoose";

 const connection = async()=>{
    try {
      const conn =  await mongoose.connect(process.env.MONGO_URI)
      console.log('Database connected :' , conn.connection.host)
    } catch (error) {
        console.log('database connection error : ' , error.message)
        process.exit(1)
        
    }
}

export default connection