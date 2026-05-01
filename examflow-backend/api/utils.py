from rest_framework import permissions
from .models import Question

class IsAdminUserOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')

class IsAdminUserOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')

def evaluate_attempt(attempt):
    """
    Evaluates an exam attempt by comparing submitted answers
    against correct answers in the database.
    Returns (score, total_marks)
    """
    questions = Question.objects.filter(exam=attempt.exam)
    score = 0
    total = 0

    for q in questions:
        total += q.marks
        # answers is a JSON dict with stringified question IDs
        submitted = attempt.answers.get(str(q.id), "").upper()
        if submitted == q.correct_option:
            score += q.marks

    return score, total
