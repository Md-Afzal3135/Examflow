from django.contrib import admin
from .models import User, Exam, Question, ExamAttempt

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'email', 'role', 'date_joined']
    list_filter = ['role']
    search_fields = ['email', 'name']

@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'duration_minutes', 'total_marks', 'is_active', 'scheduled_at', 'created_at']
    list_filter = ['is_active']
    search_fields = ['title']

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['id', 'exam', 'text', 'correct_option', 'marks']
    list_filter = ['exam']
    search_fields = ['text']

@admin.register(ExamAttempt)
class ExamAttemptAdmin(admin.ModelAdmin):
    list_display = ['id', 'student', 'exam', 'score', 'total_marks', 'is_evaluated', 'submitted_at']
    list_filter = ['is_evaluated']
