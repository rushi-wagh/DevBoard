DevBoard is a backend system for managing projects, tasks, subtasks, and notes with role-based access control.
## Features

- User authentication: register, login, logout, email verification, password reset  
- Role-Based Access Control (RBAC) for Admin, Member, and Viewer roles  
- Project management: create, update, delete projects, invite members, assign roles  
- Task and Subtask management linked under projects  
- Notes management scoped to projects with role-based editing  
- JWT authentication + middleware-based validation for every request  

---

## Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Authentication:** JWT, middleware-based RBAC  
- **Validation:** Middleware-based input validation  

---

## Example Workflows

- Admin creates a project → adds members → updates roles  
- Member creates tasks & subtasks under a project  
- Notes are added with role-based permissions  
- All actions pass through login + permission middleware before hitting the database  

---

## Routes & Permissions

### 🔑 Auth (Global Routes)

| Route | Method | Accessible By |
|-------|--------|---------------|
| `/auth/register` | POST | Public |
| `/auth/login` | POST | Public |
| `/auth/logout` | GET | Authenticated users (all roles) |
| `/auth/verify-email/:token` | GET | Public via token |
| `/auth/forgot-password` | POST | Public |
| `/auth/reset-password/:token` | POST | Public with valid token |
| `/auth/refresh-accesstoken` | GET | Authenticated users (all roles) |
| `/auth/resend-verification` | GET | Authenticated but unverified users |

---

### 📂 Projects

| Route | Method | Accessible By |
|-------|--------|---------------|
| `/projects/create-project` | POST | Admin only |
| `/projects/update-project/:id` | PUT | Admin only |
| `/projects/delete-project/:id` | DELETE | Admin only |
| `/projects/get-project/:id` | GET | Admin, Member, Viewer (if part of project) |
| `/projects/add-member/:projectId` | POST | Admin only |
| `/projects/delete-member/:projectId/:userId` | GET | Admin only |
| `/projects/update-role/:projectId/:userId` | PUT | Admin only |
| `/projects/members/:id` | GET | Admin, Member (if part of project) |

---

### ✅ Tasks

| Route | Method | Accessible By |
|-------|--------|---------------|
| `/tasks/create-task` | POST | Admin, Member |
| `/tasks/update-task/:id` | POST | Admin, Member (if assigned) |
| `/tasks/delete-task/:id` | GET | Admin only |
| `/tasks/get-tasks` | GET | Admin, Member, Viewer |
| `/tasks/get-task/:taskId` | GET | Admin, Member, Viewer |

---

### 📌 Subtasks

| Route | Method | Accessible By |
|-------|--------|---------------|
| `/tasks/create-subtask/:taskId` | POST | Admin, Member (if assigned) |
| `/tasks/update-subtask/:id` | PUT | Admin, Member (if assigned) |
| `/tasks/delete-subtask/:id` | GET | Admin only |
| Linked to tasks | — | Inherits permissions from parent task |

---

### 📝 Notes

| Route | Method | Accessible By |
|-------|--------|---------------|
| `/notes/create/:projectId` | POST | Admin, Member |
| `/notes/update/:noteId/:projectId` | PUT | Admin, Member (author only) |
| `/notes/delete/:noteId/:projectId` | DELETE | Admin, Member (author only) |
| `/notes/:projectId` | GET | Admin → all project notes <br> Member → project notes (can view all, edit own) <br> Viewer → read-only access |
| `/notes/get-note/:noteId/:projectId` | GET | Admin, Member, Viewer (per role rules) |

---

## Learnings

- Designing & managing multi-model relationships (Projects → Tasks → Subtasks → Notes)  
- Implementing RBAC at user & project level  
- Middleware-driven route protection keeps code clean & scalable  
- Database design solves half the coding issues before they even arise  
- Debugging and facing errors teaches more than writing neat code  

