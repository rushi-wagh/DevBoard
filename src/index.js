import app from "./app.js";
import dotenv from "dotenv"
import connectdb from "./db/index.js";

dotenv.config({
    path: "./.env",
})

const PORT = process.env.PORT||8000

connectdb()
   .then(() => {
    app.listen(PORT,() => {
        console.log(`Server is running at ${PORT}`)
    })
   })
   .catch((err) => {
    console.error("Error",err)
   })
