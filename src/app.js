import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    // origin: process.env.CORS_ORIGIN,
    origin: '*',
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from './routes/user.routes.js'
import adminRouter from './routes/admin.routes .js'

import consumerRouter from './routes/consumer.routes.js'
import vspRouter from './routes/vsp.routes.js'
import uploadRouter from './routes/upload.routes.js'


//routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/admin", adminRouter)

app.use("/api/v1/visitor", consumerRouter)
app.use("/api/v1/vsp", vspRouter)
app.use("/api", uploadRouter)

app.get("/api/getkey", (req, res) =>
    res.status(200).json({ key: process.env.RAZORPAY_API_KEY })
);

app.get("/api/getkey", (req, res) =>
    res.status(200).json({ key: process.env.RAZORPAY_API_KEY })
);
export { app }