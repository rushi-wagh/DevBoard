import express from "express"
import { addMemberToProject, createProject, deleteMember, deleteProject, getProjectById, getProjectMembers, getProjects, updateMemberRole, updateProject } from "../controllers/project.controllers.js"
import { isLoggedIn } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get('/projects',isLoggedIn,getProjects)
router.get('/get-project/:id',isLoggedIn,getProjectById)
router.post('/create-project',isLoggedIn,createProject)
router.put('/update-project/:id',isLoggedIn,updateProject)
router.delete('/delete-project/:id',isLoggedIn,deleteProject)
router.post('/add-member/:projectId',addMemberToProject)
router.get('/members/:id',getProjectMembers)
router.get('/delete-member/:projectId/:userId',isLoggedIn,deleteMember)
router.put('/update-role/:projectId/:userId',isLoggedIn,updateMemberRole)


export default router