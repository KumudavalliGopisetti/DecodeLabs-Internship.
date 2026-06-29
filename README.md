# 🎓 Student Management System

A full-stack **Student Management System** built using **Node.js**, **Express.js**, and **MongoDB**. This application allows users to manage student records with secure authentication and RESTful APIs.

---

## 📌 Features

* User Authentication (JWT)
* Secure Login & Registration
* Add New Student
* View All Students
* Update Student Details
* Delete Student Records
* Input Validation
* Error Handling
* MongoDB Database Integration
* REST API Architecture

---

## 🛠️ Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcrypt.js
* dotenv
* CORS

### Frontend

* HTML5
* CSS3
* JavaScript

---

## 📁 Project Structure

```
Student-Management-System/
│
├── backend/
│   ├── public/
│   ├── auth.js
│   ├── authController.js
│   ├── authRoutes.js
│   ├── db.js
│   ├── errorHandler.js
│   ├── server.js
│   ├── Student.js
│   ├── studentController.js
│   ├── studentRoutes.js
│   ├── User.js
│   ├── validate.js
│   ├── package.json
│   └── .env
│
├── frontend/
│
├── .gitignore
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/KumudavalliGopisetti/DecodeLabs-Internship.git
```

### 2. Navigate to the Project

```bash
cd DecodeLabs-Internship/backend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=5000
NODE_ENV=development

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

JWT_EXPIRES_IN=7d

ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:5500
```

### 5. Run the Server

```bash
npm start
```

or

```bash
node server.js
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint           | Description   |
| ------ | ------------------ | ------------- |
| POST   | /api/auth/register | Register User |
| POST   | /api/auth/login    | Login User    |

### Students

| Method | Endpoint          | Description       |
| ------ | ----------------- | ----------------- |
| GET    | /api/students     | Get All Students  |
| GET    | /api/students/:id | Get Student by ID |
| POST   | /api/students     | Add Student       |
| PUT    | /api/students/:id | Update Student    |
| DELETE | /api/students/:id | Delete Student    |

---

## 🔐 Authentication

The application uses **JSON Web Token (JWT)** authentication.

Include the token in the request header:

```
Authorization: Bearer <your_token>
```

---

## 🚀 Future Enhancements

* Student Search
* Pagination
* Role-Based Access Control
* Dashboard Analytics
* File Upload for Student Profile
* Attendance Management
* Result Management

---

## 📷 Screenshots

Add screenshots of your application here.

Example:

```
screenshots/
    login.png
    dashboard.png
    students.png
```

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Push to your branch
5. Create a Pull Request

---

## 📄 License

This project is developed for learning and educational purposes.

---

## 👩‍💻 Author

**Kumudavalli Gopisetti**

GitHub: https://github.com/KumudavalliGopisetti
