const express = require('express')
const authRouter = require("./routes/authRouter.js")
const productRouter = require("./routes/productRouter")
const cartRouter = require("./routes/cartRouter")
const orderRouter = require("./routes/orderRouter")
const PORT = process.env.PORT || 8000

const app = express()

app.use(express.json())
app.use("/auth", authRouter)
app.use("/products", productRouter)
app.use("/cart", cartRouter)
app.use("/order", orderRouter)
const start = () => {
    try {
        app.listen(PORT, () => console.log('Сервер запущен'))
    } catch (e) {
        console.log(e)
    }
}

start()