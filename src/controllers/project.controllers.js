import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { project } from "../models/project.models.js";

const getProjects = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  console.log(userId);
  const allProjects = await project.find({
    createdBy: userId,
  });
  if (!allProjects || allProjects.length === 0) {
    throw new ApiError(404, "No project found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, allProjects, "All project fetched Succesfully"));
});

const getProjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(404, "No projectId found");
  }
  const projectById = await project.findById(id);

  if (!projectById) {
    throw new ApiError(404, "no project found for given Id");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, projectById, "This is project for given Id"));
});

const createProject = asyncHandler(async (req, res) => {
  // get data
  const { title, description } = req.body;
  const userId = req.user._id;
  // validate
  if (!title || !description) {
    throw new ApiError(401, "All fields are required");
  }
  //check if existing project
  const existingProject = await project.findOne({ title });
  console.log(existingProject);
  // return if existing
  if (existingProject) {
    throw new ApiError(401, "Project already exists");
  }
  // create if nope
  const Project = await project.create({
    title,
    description,
    createdBy: userId,
  });
  //return response
  return res
    .status(200)
    .json(new ApiResponse(200, Project, "project created succesfully"));
});

const updateProject = asyncHandler(async (req, res) => {
  // get project by id
  const { title, description } = req.body;
  const id = req.params.id;

  // validation
  if (!id) {
    throw new ApiError(400, "Project id must be required", []);
  }

  if (!title) {
    throw new ApiError(400, "Project name is required");
  }

  const Project = await project.findByIdAndUpdate(id, {
    $set: {
      title,
      description,
    },
  });

  if (!Project) {
    throw new ApiError(429, "Project does not exist", []);
  }

  await Project.save({ validateBeforeSave: false });

  // Respond with a success message indicating that the project was update successfully.
  return res
    .status(200)
    .json(new ApiResponse(200,Project, "Project updated successfully"));
});


const deleteProject = async (req, res) => {
  //get project id from user
  const { id } = req.params;
  if (!id) {
    throw new ApiError(401, "no id provided");
  }
  //find project and delete it
  const Project = await project.findByIdAndDelete(id);
  if(!Project){
    throw new ApiError(401,"no project found")
  }
  //validate
  //send response
  res
    .status(200)
    .json(new ApiResponse(200, Project, "project deleted succesfully"));
};

const getProjectMembers = async (req, res) => {
  // get project members
};

const addMemberToProject = async (req, res) => {
  // add member to project
};

const deleteMember = async (req, res) => {
  // delete member from project
};

const updateMemberRole = async (req, res) => {
  // update member role
};

export {
  addMemberToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateMemberRole,
  updateProject,
};
