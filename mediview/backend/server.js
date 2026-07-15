import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import { userRouter } from './routes/userRoute.js'
import path from 'path'   

const app = express()
connectDB()
connectCloudinary()

const port = process.env.PORT || 4000

// middlewares
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }))

// ✅ Serve uploads folder statically
const __dirname = path.resolve()
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// api endpoints
app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)

app.get('/', (req, res) => {
  res.send("API working")
})

app.listen(port, () => {
  console.log("Backend server running on port", port)
})
