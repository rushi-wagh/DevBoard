import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

//import all routes
import Healthcheck from "./routes/healthCheck.routes.js";
import Auth from "./routes/auth.routes.js"
import Project from "./routes/project.routes.js"
import Task from "./routes/Task.routes.js"
import Note from "./routes/note.routes.js"

const app = express()
app.use(cookieParser())
app.use(cors())
app.use(express.urlencoded({extended:true}))
app.use(express.json())
// All routes structure
app.use('/api/v1/health',Healthcheck)
app.use('/api/v1/auth',Auth)
app.use('/api/v1/project',Project)
app.use('/api/v1/task',Task)
app.use('/api/v1/notes',Note)


export default app