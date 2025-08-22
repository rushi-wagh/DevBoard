import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { project } from "../models/project.models.js";
import { projectMember } from "../models/projectmember.models.js";

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

  const { title, description } = req.body;
  const userId = req.user._id;

  if (!title || !description) {
    throw new ApiError(401, "All fields are required");
  }
  
  const existingProject = await project.findOne({ title });
  console.log(existingProject);
  
  if (existingProject) {
    throw new ApiError(401, "Project already exists");
  }
  
  const Project = await project.create({
    title,
    description,
    createdBy: userId
  });
 
  return res
    .status(200)
    .json(new ApiResponse(200, Project, "project created succesfully"));
});

const updateProject = asyncHandler(async (req, res) => {
 
  const { title, description } = req.body;
  const id = req.params.id;


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

 
  return res
    .status(200)
    .json(new ApiResponse(200, Project, "Project updated successfully"));
});

const deleteProject = async (req, res) => {
  //get project id from user
  const { id } = req.params;
  if (!id) {
    throw new ApiError(401, "no id provided");
  }
  //find project and delete it
  const Project = await project.findByIdAndDelete(id);
  if (!Project) {
    throw new ApiError(404, "no project found");
  }
  //validate
  //send response
  res
    .status(200)
    .json(new ApiResponse(200, Project, "project deleted succesfully"));
};

const getProjectMembers = async (req, res) => {
  const { id } = req.params;

  const ProjectMember = await projectMember
    .find({ project: id })
    .populate("user", "username");
  const members = ProjectMember.map((m) => m.user.username);
  console.log(members);
  return res.status(200).json(new ApiResponse(200, members, "members"));
};

const addMemberToProject = async (req, res) => {
  const { projectId } = req.params;
  const { userId } = req.body;

  if (!projectId) {
    throw new ApiError(401, "No token found");
  }
  if (!userId) {
    throw new ApiError(401, "No userId found");
  }
  const existingMember = await projectMember.findOne({
    $and: [{ project: projectId }, { user: userId }],
  });
  console.log("existing", existingMember);
  if (existingMember) {
    throw new ApiError(400, "Already member of project");
  }
  const Project = await project.findById(projectId);
  if (!Project) {
    throw new ApiError(404, "No Project found");
  }
  const ProjectMember = await projectMember.create({
    user: userId,
    project: Project,
  });

  if (!ProjectMember) {
    throw new ApiError(400, "error while adding member");
  }
  return res.status(200).json(new ApiResponse(200, ProjectMember, "Added"));
};

const deleteMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  if (!userId || !projectId) {
    throw new ApiError(400, "Project ID and User ID are required");
  }

  const Project = await project.findById(projectId);
  if (!Project) {
    throw new ApiError(404, "Project does not exist");
  }

  const memberToDelete = await projectMember.findOneAndDelete({
    project: projectId,
    user: userId,
  });

  if (!memberToDelete) {
    throw new ApiError(404, "Team member not found in this project");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, memberToDelete, "Team member removed successfully")
    );
});

const updateMemberRole = async (req, res) => {
  const { projectId, userId } = req.params;
  const { role } = req.body;

  if ([projectId, role, userId].some((field) => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  const Project = await project.findById(projectId);

  if (!Project) {
    throw new ApiError(404, "Project does not exist");
  }

  const existInProject = await projectMember.findOne({ user: userId });

  if (!existInProject) {
    throw new ApiError(404, "Project member does not exist");
  }

  if (existInProject.role === role) {
    throw new ApiError(400, "This user already has the same role");
  }

  existInProject.role = role;
  await existInProject.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, existInProject, "Team member role updated"));
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
