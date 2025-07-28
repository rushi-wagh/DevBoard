import express from "express"
import {isLoggedIn} from "../middleware/auth.middleware.js"
import { createSubTask, createTask, deleteSubTask, deleteTask, getTaskById, getTasks, updateSubTask, updateTask } from "../controllers/Task.controllers.js"


const router = express.Router()


router.post('/create-task',isLoggedIn,createTask)
router.post('/update-task/:id',isLoggedIn,updateTask)
router.get('/delete-task/:id',isLoggedIn,deleteTask)
router.get("/get-tasks",isLoggedIn,getTasks)
router.get('/get-task/:taskId',isLoggedIn,getTaskById)
router.post('/create-subtask/:taskId',isLoggedIn,createSubTask)
router.put('/update-subtask/:id',isLoggedIn,updateSubTask)
router.get('/delete-subtask/:id',isLoggedIn,deleteSubTask)


export default router