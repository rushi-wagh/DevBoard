import { Task } from "../models/task.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { subTask } from "../models/subtask.models.js";

// get all tasks
const getTasks = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const allTasks = await Task.find({ assignedBy: userId });

  if (allTasks.length === 0) {
    throw new ApiError(404, "No tasks found for user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, allTasks, "Tasks fetched successfully"));
});


// get task by id
const getTaskById = async (req, res) => {
  const { taskId } = req.params;
  const _id= taskId
  if (!taskId) {
    throw new ApiError(401, "No token provided");
  }
  const taskById = await Task.findById(_id);
  console.log(taskById)
  if (!taskById) {
    throw new ApiError(401, "No task found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, taskById, "this is task for given id"));
};

// create task
const createTask = asyncHandler(async (req, res) => {
  const userId  = req.user._id;
  const {projectId} = req.body
  if (!projectId) {
    throw new ApiError(401, "No token found");
  }
  const { title, description, assignedTo } = req.body;

  if (!title || !description || !assignedTo) {
    throw new ApiError(402, "all fields are required");
  }

  const task = await Task.create({
    title,
    description,
    project: projectId,
    assignedTo,
    assignedBy: userId,
  });
  if (!task) {
    throw new ApiError(401, "Error while creating task");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task created succesfully"));
});

// update task
const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params; //task_id
  const _id = id
  if (!id) {
    throw new ApiError(401, "id is required");
  }
  const updatedTask = await Task.findByIdAndUpdate(
  _id,
  req.body,
  { new: true, runValidators: true }
);
console.log(updatedTask)
 //be careful send data as exact name in model through body
  if (!updatedTask) {
    throw new ApiError(401, "Error while updating");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedTask, "Task updated succesfully"));
});

// delete task
const deleteTask = async (req, res) => {
  const { id } = req.params;
  const taskToDelete = await Task.findByIdAndDelete(id);
  if (!taskToDelete) {
    throw new ApiError(404, "Task not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, taskToDelete, "Task deleted Succesfully"));
};

// create subtask
const createSubTask = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user._id;
  const { title } = req.body;
  if (!taskId || !userId) {
    throw new ApiError(401, "Both tokens are required");
  }
  if (!title) {
    throw new ApiError(401, "Title is required");
  }
  const SubTask = await subTask.create({
    title,
    task: taskId,
    createdBy: userId,
  });
  if (!SubTask) {
    throw new ApiError(400, "Error while creating");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, SubTask, "subTask created succesfully"));
};

const updateSubTask = async (req, res) => {
  const { id } = req.params; //subtask_id
  if (!id) {
    throw new ApiError(401, "id is required");
  }
  const updatedSubTask = await subTask.findByIdAndUpdate(id, req.body, {
    new: true,
  }); //be careful send data as exact name in model through body
  if (!updatedSubTask) {
    throw new ApiError(401, "Error while updating");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedSubTask, "Task updated succesfully"));
};

// delete subtask
const deleteSubTask = async (req, res) => {
  const { id } = req.params;
  const subtaskToDelete = await subTask.findByIdAndDelete(id);
  if (!subtaskToDelete) {
    throw new ApiError(404, "Task not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, subtaskToDelete, "Task deleted Succesfully"));
};

export {
  createSubTask,
  createTask,
  deleteSubTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateSubTask,
  updateTask,
};
