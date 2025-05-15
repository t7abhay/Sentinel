# 🔐 Sentinel - Self-Hosted Auth & RBAC Microservice

Sentinel is a pluggable, self-hosted authentication and role-based access control (RBAC) microservice built with Node.js, Express, Sequelize ORM, and SQL databases. It supports secure login, registration, and dynamic role management — ready to be dropped into your existing stack.

---

## 🚀 Features

- ✅ Authentication via username/email + password  
- 🔒 Password hashing with bcrypt  
- 🛡️ Role-Based Access Control (RBAC)   
- 📦 Plug-and-play REST API  
- 🌍 Self-hosted with environment config  
- 🧱 Sequelize ORM support for PostgreSQL, MySQL, SQLite, etc.

---
> [!IMPORTANT]
> [Postman collection link ](https://documenter.getpostman.com/view/19138437/2sB2qUp5LE)


> [!IMPORTANT]
> [WorkFlow](https://app.eraser.io/workspace/fN75ALMPUkd6uMopyhmu)
 
 
## 📦 Installation

```bash
git clone https://github.com/t7abhay/sentinel.git
cd sentinel
npm install
```
---

> [!NOTE]
> Make sure to change env

---

## 🔐 Auth & User API Documentation

**Base URL:** `/api`

---

## 📌 Register User

**Endpoint:** `POST /auth/register`  
**Description:** Registers a new user with default role.  
**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "password123"
}
```

**Responses:**

- `201 Created`: User registered successfully.
- `400 Bad Request`: Missing or empty fields / Password too short.
- `409 Conflict`: Email already registered.
- `500 Internal Server Error`: Default role not found.

---

## 📌 Login User

**Endpoint:** `POST /auth/login`  
**Description:** Authenticates user and sets tokens in HTTP-only cookies.  
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Responses:**

- `200 OK`: Login successful, access and refresh tokens sent.
- `400 Bad Request`: Missing credentials or invalid password.
- `404 Not Found`: Account does not exist.

**Cookies Set:**

- `accessToken`: JWT access token
- `refreshToken`: JWT refresh token

---

## 📌 Logout User

**Endpoint:** `POST /auth/logout`  
**Description:** Logs out user by clearing tokens and invalidating refresh token.

**Responses:**

- `200 OK`: User logged out successfully or already logged out.

---

## 📌 Get My Profile

**Endpoint:** `GET /auth/me`  
**Description:** Returns currently logged-in user's profile.  
**Headers:**

- `Authorization: Bearer <accessToken>`

**Responses:**

- `200 OK`: User profile data.
- `400 Bad Request`: User not authenticated.

---

## 📌 Change Password

**Endpoint:** `POST /auth/change-password`  
**Description:** Allows user to update password.  
**Request Body:**
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass456"
}
```

**Responses:**

- `200 OK`: Password updated.
- `400 Bad Request`: Current password incorrect.
- `409 Conflict`: New password is same as old.

---

## 📌 Update User Role

**Endpoint:** `PATCH /auth/user/:id/role`  
**Description:** Updates the role of a specific user (admin only).  
**Request Body:**
```json
{
  "roleId": 2
}
```

**Responses:**

- `200 OK`: User role updated.
- `404 Not Found`: User or role not found.

---

## 📌 Create Admin

**Endpoint:** `POST /auth/create-admin`  
**Description:** Creates a new admin user.  
**Request Body:**
```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "admin123",
  "adminKey": "SOME_SECRET_KEY"
}
```

**Responses:**

- `201 Created`: Admin user created.
- `400 Bad Request`: User already exists.
- `403 Forbidden`: Invalid admin key.
- `500 Internal Server Error`: Admin role not configured.

---

## 🔐 Notes

- All protected routes require authentication via JWT `accessToken`.
- Tokens are stored as HTTP-only cookies.
- Refresh logic should be handled separately via a refresh endpoint (not included here).

---

## 💻 Tech Stack

- ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white&style=flat-square) Node.js
- ![Express](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white&style=flat-square) Express.js
- ![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?logo=sequelize&logoColor=white&style=flat-square) Sequelize ORM
- ![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white&style=flat-square) Docker
- ![Mysql](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white&style=flat-square) Mysql
