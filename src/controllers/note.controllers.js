import { ProjectNote } from "../models/note.models.js";
import { project } from "../models/project.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const getNotes = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  if (!projectId) {
    throw new ApiError(401, "ProjectId is required");
  }
  const Project = await project.findById(projectId);
  if (!Project) {
    throw new ApiError(404, "no project found");
  }
  const notes = await ProjectNote.find({ project: projectId }).populate(
    "createdBy",
    "username fullname"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, notes, "Notes fetched Succesfully"));
});

const getNoteById = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  if (!noteId) {
    throw new ApiError(401, "No id provided");
  }
  const noteById = await ProjectNote.findById(noteId).populate(
    "createdBy",
    "username fullname"
  );

  if (!noteById) {
    throw new ApiError(404, "no note found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, noteById, "Note for given id"));
});

const createNote =asyncHandler(async(req, res) => {
  const { projectId } = req.params;
  const { contents } = req.body;
  console.log("projectid",projectId,"content",contents)
  const Project = await project.findById(projectId);
  if (!Project) {
    throw new ApiError(401, "Project is not found");
  }

  const note = await ProjectNote.create({
    project: projectId,
    contents,
    createdBy: req.user._id,
  });
  if (!note) {
    throw new ApiError(401, "Error while creating");
  }

  const populateNote = await ProjectNote.findById(note._id).populate(
    "createdBy",
    "username fullname"
  );
  console.log(populateNote);

  return res
    .status(201)
    .json(new ApiResponse(201, populateNote, "Note created successfully"));
});

const updateNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const { contents } = req.body;
  const _id =noteId
  const existingNote = await ProjectNote.findById(noteId);
  console.log(existingNote)

  if (!existingNote) {
    throw new ApiError(401, "Note is not found");
  }

  const updatedNote = await ProjectNote.findByIdAndUpdate(
    noteId,
    { contents },
    { new: true }
  ).populate("createdBy", "username fullname");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedNote, "Note updated successfully"));
});

const deleteNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const note = await ProjectNote.findByIdAndDelete(noteId);
  if (!note) {
    throw new ApiError(404, "Note is not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note deleted successfully"));
});

export { createNote, deleteNote, getNoteById, getNotes, updateNote };
