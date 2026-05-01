# 📝 ExamFlow

A full-stack **Online Examination Platform** built with **Django REST Framework** (backend) and **React + Vite** (frontend). ExamFlow enables admins to create and schedule exams while students can attempt them in real time and view their results.

---

## 🚀 Features

### 👩‍🏫 Admin
- Create, edit, and delete exams
- Add and manage multiple-choice questions (MCQ)
- Schedule exams with a start date/time
- Toggle exam visibility (activate/deactivate)
- View all registered students
- View platform-wide statistics

### 🧑‍🎓 Student
- Register and log in securely
- View available (active) exams on the dashboard
- Attempt timed exams with MCQ questions
- Submit answers and receive instant scores
- View detailed results for each exam
- Manage personal profile

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Python 3 + Django | Core framework |
| Django REST Framework | REST API layer |
| Simple JWT | JWT-based authentication |
| SQLite | Database (development) |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI library |
| Vite | Build tool & dev server |
| React Router DOM v7 | Client-side routing |
| Axios | HTTP client |
| Tailwind CSS | Utility-first styling |
| Headless UI | Accessible UI components |

---

## 📁 Project Structure

```
ExamFlow/
├── examflow-backend/         # Django backend
│   ├── api/                  # Core API app
│   │   ├── models.py         # User, Exam, Question, ExamAttempt
│   │   ├── serializers.py    # DRF serializers
│   │   ├── views.py          # API views & logic
│   │   ├── urls.py           # API route definitions
│   │   └── admin.py          # Django admin config
│   ├── examflow_backend/     # Django project settings
│   ├── manage.py
│   └── .env                  # Backend environment variables
│
└── examflow-frontend/        # React frontend
    ├── src/
    │   ├── pages/            # Route-level page components
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── StudentDashboard.jsx
    │   │   ├── ExamAttemptPage.jsx
    │   │   ├── ResultPage.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   ├── ManageQuestions.jsx
    │   │   ├── ScheduleExam.jsx
    │   │   └── ProfilePage.jsx
    │   ├── components/       # Reusable components (e.g., ProtectedRoute)
    │   ├── context/          # React context (AuthContext)
    │   ├── api/              # Axios instance & API helpers
    │   ├── App.jsx           # Root component with routing
    │   └── main.jsx          # App entry point
    ├── .env                  # Frontend environment variables
    └── package.json
```

---

## ⚙️ Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+ & npm
- Git

---

### 🔧 Backend Setup

```bash
# 1. Navigate to the backend directory
cd examflow-backend

# 2. Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# 3. Install dependencies
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers python-decouple

# 4. Configure environment variables
# Edit the .env file with your settings:
# SECRET_KEY=your-secret-key
# DEBUG=True

# 5. Run migrations
python manage.py makemigrations
python manage.py migrate

# 6. (Optional) Seed sample data
python seed_data.py

# 7. Create a superuser (admin)
python manage.py createsuperuser

# 8. Start the development server
python manage.py runserver
```

Backend will be available at: **http://127.0.0.1:8000**

---

### 🎨 Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd examflow-frontend

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Edit .env:
# VITE_API_BASE_URL=http://127.0.0.1:8000/api

# 4. Start the development server
npm run dev
```

Frontend will be available at: **http://localhost:5173**

---

## 🌐 API Endpoints

All endpoints are prefixed with `/api/`

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and get JWT tokens |
| `GET` | `/api/auth/profile` | Get current user's profile |

### Exams
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/exams` | List all active exams |
| `POST` | `/api/exams` | Create a new exam (admin) |
| `GET` | `/api/exams/<id>` | Get exam details |
| `PUT` | `/api/exams/<id>` | Update an exam (admin) |
| `DELETE` | `/api/exams/<id>` | Delete an exam (admin) |
| `POST` | `/api/exams/<id>/submit` | Submit exam answers |

### Questions
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/questions` | List questions |
| `POST` | `/api/questions` | Add a question (admin) |
| `PUT` | `/api/questions/<id>` | Update a question (admin) |
| `DELETE` | `/api/questions/<id>` | Delete a question (admin) |

### Results
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/results/me` | Get current student's results |
| `GET` | `/api/results/<exam_id>` | Get result for a specific exam |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/students` | List all students |
| `GET` | `/api/admin/stats` | Platform statistics |
| `PATCH` | `/api/admin/exams/<id>/toggle` | Toggle exam active status |

---

## 🗄️ Data Models

```
User
├── email (unique, used as username)
├── name
└── role (student | admin)

Exam
├── title, description
├── duration_minutes
├── total_marks
├── is_active
├── scheduled_at
└── created_by → User

Question
├── exam → Exam
├── text
├── option_a / option_b / option_c / option_d
├── correct_option (A/B/C/D)
└── marks

ExamAttempt
├── student → User
├── exam → Exam
├── answers (JSON)
├── score
└── is_evaluated
```

---

## 🔐 Authentication

ExamFlow uses **JWT (JSON Web Token)** authentication via `djangorestframework-simplejwt`.

- On login, the server returns an `access` token and a `refresh` token.
- The frontend stores these in `localStorage` and attaches the `access` token as a `Bearer` header on every authenticated request.
- Role-based route protection is enforced on both frontend (via `ProtectedRoute`) and backend (via custom permission checks in views).

---

## 🧪 Running Tests

```bash
# Backend
cd examflow-backend
python manage.py test

# Frontend linting
cd examflow-frontend
npm run lint
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

> Built with ❤️ using Django & React
