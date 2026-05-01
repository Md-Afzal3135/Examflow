from django.urls import path
from .views import (
    RegisterView, LoginView, ProfileView,
    ExamListCreateView, ExamDetailView, ExamSubmitView,
    QuestionListCreateView, QuestionDetailView,
    MyResultsView, ResultDetailView,
    AdminStudentsView, AdminStatsView, AdminToggleExamView
)

urlpatterns = [
    # Auth
    path('auth/register', RegisterView.as_view(), name='register'),
    path('auth/login', LoginView.as_view(), name='login'),
    path('auth/profile', ProfileView.as_view(), name='profile'),
    
    # Exams
    path('exams', ExamListCreateView.as_view(), name='exams-list'), # To match proxy or no-trailing slash formats easily
    path('exams/', ExamListCreateView.as_view(), name='exams-list-slash'),
    path('exams/<int:pk>', ExamDetailView.as_view(), name='exam-detail'),
    path('exams/<int:pk>/submit', ExamSubmitView.as_view(), name='exam-submit'),
    
    # Questions
    path('questions', QuestionListCreateView.as_view(), name='questions-list'),
    path('questions/', QuestionListCreateView.as_view(), name='questions-list-slash'),
    path('questions/<int:pk>', QuestionDetailView.as_view(), name='question-detail'),
    
    # Results
    path('results/me', MyResultsView.as_view(), name='my-results'),
    path('results/<int:exam_id>', ResultDetailView.as_view(), name='result-detail'),
    
    # Admin
    path('admin/students', AdminStudentsView.as_view(), name='admin-students'),
    path('admin/stats', AdminStatsView.as_view(), name='admin-stats'),
    path('admin/exams/<int:pk>', AdminToggleExamView.as_view(), name='admin-toggle-exam'),
    path('admin/exams/<int:pk>/toggle', AdminToggleExamView.as_view(), name='admin-toggle-exam-patch'),
]
