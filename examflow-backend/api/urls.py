from django.urls import path
from .views import (
    RegisterView, LoginView, ProfileView,
    RequestPasswordResetView, ResetPasswordConfirmView,
    SendVerificationView, VerifyEmailView,
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

    # Password Reset
    path('auth/request-password-reset', RequestPasswordResetView.as_view(), name='request-password-reset'),
    path('auth/reset-password', ResetPasswordConfirmView.as_view(), name='reset-password'),

    # Email Verification
    path('auth/send-verification', SendVerificationView.as_view(), name='send-verification'),
    path('auth/verify-email', VerifyEmailView.as_view(), name='verify-email'),

    # Exams
    path('exams', ExamListCreateView.as_view(), name='exams-list'),
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
