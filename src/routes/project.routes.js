import express from "express"
import { createProject, deleteProject, getProjectById, getProjects, updateProject } from "../controllers/project.controllers.js"
import { isLoggedIn } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get('/projects',isLoggedIn,getProjects)
router.get('/get-project/:id',isLoggedIn,getProjectById)
router.post('/create-project',isLoggedIn,createProject)
router.put('/update-project/:id',isLoggedIn,updateProject)
router.delete('/delete-project/:id',isLoggedIn,deleteProject)



export default router