# 🔐 Sentinel - Self-Hosted Auth & RBAC Microservice

Sentinel is a pluggable, self-hosted authentication and role-based access control (RBAC) microservice built with Node.js, Express, Sequelize ORM, and SQL databases. It supports secure login, registration, and dynamic role management — ready to be dropped into your existing stack.

---

## 🚀 Features

- ✅ Authentication via username/email + password  
- 🔒 Password hashing with bcrypt  
- 🛡️ Role-Based Access Control (RBAC)  
- 🔁 Dynamic role and permission assignment  
- 📦 Plug-and-play REST API  
- 🌍 Self-hosted with environment config  
- 🧱 Sequelize ORM support for PostgreSQL, MySQL, SQLite, etc.

---
> [!IMPORTANT]
> [Postman collection link ](https://postman.co/workspace/sentinel~b74589e2-12c5-41e9-9f29-24cf78d93e00/collection/19138437-d129d1df-7742-4fc3-a74c-bf90ddf70600?action=share&creator=19138437)
  

## 📦 Installation

```bash
git clone https://github.com/t7abhay/sentinel.git
cd sentinel
npm install

```
---

> [!NOTE]
> Make sure to change env

 
##  API Endpoints

```bash
POST /api/v1/register
Request:
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "strongpassword123"
}

Response:
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "jfd29364Oi..."
}

```

```bash
POST /api/v1/auth/login
 
{
  "username": "ziggy",
  "password": "123456"
}

{
  "user": {
    "id": 1,
    "username": "ziggy",
    "email": "ziggy@example.com"
  }
}

```

```bash


GET /api/v1/get-profile
{
 "data":{
   "user":{}
 }
}

```

```bash
POST /api/v1/change-password


Request: 
{
  "oldPassword": "oldpass123",
  "newPassword": "newpass456"
}

Response:
{
    "message": "Password updated successfully"
}

```

> [!WARNING]
> Following route is only meant for admins/owners

```bash
PATCH /api/v1/users/:id/update-role



Request:
{
  "Authorization":"Bearer <accessToken>",
 "roleId": 
}


Response:{
  "message":"user role update"
}
```

```bash
POST /api/v1/create-admins


Request:
{
    "username":"admin",
    "email":"admin@email.com",
    "password":"admin@password",
    "adminKey":"admin@keyfromEnv"
}

Response:
{
    "message": "Admin user created successfully"
}

```