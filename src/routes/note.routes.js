import express from "express"
import { createNote, deleteNote, getNoteById, getNotes, updateNote } from "../controllers/note.controllers.js";
import { isLoggedIn, validateProjectPermission } from "../middleware/auth.middleware.js";
import {AvailableUserRoles,UserRolesEnum} from "../utils/constants.js"



const router = express.Router();

router.get(
  "/:projectId",
  isLoggedIn,
  validateProjectPermission(AvailableUserRoles),
  getNotes
);

router.post(
  "/create/:projectId",
  isLoggedIn,
  validateProjectPermission([UserRolesEnum.ADMIN]),
  createNote
);

router.get(
  "/get-note/:noteId/:projectId",
  isLoggedIn,
  validateProjectPermission(AvailableUserRoles),
  getNoteById
);

router.put(
  "/update/:noteId/:projectId",
  isLoggedIn,
  validateProjectPermission([UserRolesEnum.ADMIN]),
  updateNote
);

router.delete(
  "/delete/:noteId/:projectId",
  isLoggedIn,
  validateProjectPermission([UserRolesEnum.ADMIN]),
  deleteNote
);

export default router;
