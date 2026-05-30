from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.core.signing import dumps, loads, BadSignature, SignatureExpired
import random

from .models import User, Exam, Question, ExamAttempt
from .serializers import (
    UserSerializer, 
    MyTokenObtainPairSerializer, 
    ExamSerializer, 
    ExamDetailSerializer,
    QuestionAdminSerializer,
    ExamAttemptSerializer
)
from .utils import IsAdminUserOnly, evaluate_attempt

class RegisterView(views.APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        if User.objects.filter(email=request.data.get('email')).exists():
            return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)
            
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "Registration successful", "user": UserSerializer(user).data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class ProfileView(views.APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response(UserSerializer(request.user).data)
        
    def put(self, request):
        user = request.user
        data = request.data
        if 'name' in data:
            user.name = data['name']
        if 'password' in data and data['password']:
            user.set_password(data['password'])
        user.save()
        return Response({"message": "Profile updated", "user": UserSerializer(user).data})

class ExamListCreateView(views.APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        exams = Exam.objects.all() if request.user.role == 'admin' else Exam.objects.filter(is_active=True)
        return Response(ExamSerializer(exams, many=True).data)
        
    def post(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
            
        duration = request.data.get('duration_minutes') or request.data.get('duration', 60)
        scheduled_at = request.data.get('scheduled_at') or request.data.get('start_time')
        
        exam = Exam.objects.create(
            title=request.data['title'],
            description=request.data.get('description', ''),
            duration_minutes=int(duration),
            total_marks=request.data.get('total_marks', 100),
            scheduled_at=scheduled_at if scheduled_at else None,
            created_by=request.user
        )
        return Response(ExamSerializer(exam).data, status=status.HTTP_201_CREATED)

class ExamDetailView(views.APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        try:
            exam = Exam.objects.get(pk=pk)
            return Response(ExamDetailSerializer(exam).data)
        except Exam.DoesNotExist:
            return Response({"error": "Exam not found"}, status=status.HTTP_404_NOT_FOUND)

class ExamSubmitView(views.APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        try:
            exam = Exam.objects.get(pk=pk)
        except Exam.DoesNotExist:
            return Response({"error": "Exam not found"}, status=status.HTTP_404_NOT_FOUND)
            
        answers = request.data.get('answers', {})
        
        attempt = ExamAttempt.objects.create(
            student=request.user,
            exam=exam,
            answers=answers,
            submitted_at=timezone.now()
        )
        
        score, total = evaluate_attempt(attempt)
        attempt.score = score
        attempt.total_marks = total
        attempt.is_evaluated = True
        attempt.save()
        
        return Response({
            "message": "Exam submitted",
            "score": score,
            "total_marks": total,
            "attempt_id": attempt.id
        })

class QuestionListCreateView(views.APIView):
    permission_classes = [IsAuthenticated, IsAdminUserOnly]

    def get(self, request):
        questions = Question.objects.select_related('exam').all()
        exam_id = request.query_params.get('exam_id')
        if exam_id:
            questions = questions.filter(exam_id=exam_id)
        return Response(QuestionAdminSerializer(questions, many=True).data)

    def post(self, request):
        # Frontend sends { text, options: [], correct_idx, exam_id }
        # Need to translate it for QuestionAdminSerializer (exam, option_a, ..., correct_option)
        data = request.data.copy()
        
        if 'exam_id' in data and 'exam' not in data:
            data['exam'] = data['exam_id']
            
        if 'options' in data:
            opts = data['options']
            if len(opts) >= 4:
                data['option_a'] = opts[0]
                data['option_b'] = opts[1]
                data['option_c'] = opts[2]
                data['option_d'] = opts[3]
                
        if 'correct_idx' in data:
            idx = int(data['correct_idx'])
            data['correct_option'] = chr(65 + idx) # 0->A, 1->B, etc.

        serializer = QuestionAdminSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class QuestionDetailView(views.APIView):
    permission_classes = [IsAuthenticated, IsAdminUserOnly]

    def get(self, request, pk):
        question = get_object_or_404(Question, pk=pk)
        return Response(QuestionAdminSerializer(question).data)

    def put(self, request, pk):
        question = get_object_or_404(Question, pk=pk)
        data = request.data.copy()

        if 'exam_id' in data and 'exam' not in data:
            data['exam'] = data['exam_id']

        if 'options' in data:
            opts = data['options']
            if len(opts) >= 4:
                data['option_a'] = opts[0]
                data['option_b'] = opts[1]
                data['option_c'] = opts[2]
                data['option_d'] = opts[3]

        if 'correct_idx' in data:
            data['correct_option'] = chr(65 + int(data['correct_idx']))

        serializer = QuestionAdminSerializer(question, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        try:
            q = Question.objects.get(pk=pk)
            q.delete()
            return Response({"message": "Question deleted"})
        except Question.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

class MyResultsView(views.APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        attempts = ExamAttempt.objects.filter(student=request.user, is_evaluated=True)
        return Response(ExamAttemptSerializer(attempts, many=True).data)

class ResultDetailView(views.APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, exam_id):
        attempt = ExamAttempt.objects.filter(
            student=request.user, 
            exam_id=exam_id, 
            is_evaluated=True
        ).order_by('-submitted_at').first()
        
        if not attempt:
            return Response({"error": "No result found"}, status=status.HTTP_404_NOT_FOUND)
            
        questions = Question.objects.filter(exam_id=exam_id)
        review = []
        for q in questions:
            given = attempt.answers.get(str(q.id), "N/A")
            review.append({
                "question_text": q.text,
                "student_answer": given,
                "correct_answer": q.correct_option,
                "is_correct": given.upper() == q.correct_option
            })
            
        percentage = round((attempt.score / attempt.total_marks) * 100, 2) if attempt.total_marks else 0
        return Response({
            "exam_title": attempt.exam.title,
            "score": percentage, # In Guide's ResultPage this means %, wait Guide return score literal and percentage literal
            "total_questions": len(questions),
            "percentage": percentage,
            "passed": attempt.score >= (attempt.total_marks * 0.4) if attempt.total_marks else False,
            "breakdown": review
        })

class AdminStudentsView(views.APIView):
    permission_classes = [IsAuthenticated, IsAdminUserOnly]
    
    def get(self, request):
        students = User.objects.filter(role='student')
        return Response(UserSerializer(students, many=True).data)

class AdminStatsView(views.APIView):
    permission_classes = [IsAuthenticated, IsAdminUserOnly]
    
    def get(self, request):
        total_students = User.objects.filter(role='student').count()
        total_exams = Exam.objects.count()
        attempts = ExamAttempt.objects.filter(is_evaluated=True)
        total_attempts = attempts.count()
        percentages = [
            (attempt.score / attempt.total_marks) * 100
            for attempt in attempts
            if attempt.total_marks
        ]
        avg_score = sum(percentages) / len(percentages) if percentages else 0
        
        return Response({
            "total_students": total_students,
            "total_exams": total_exams,
            "total_attempts": total_attempts,
            "avg_score": round(avg_score or 0, 2),
            "average_score": round(avg_score or 0, 2)
        })

class AdminToggleExamView(views.APIView):
    permission_classes = [IsAuthenticated, IsAdminUserOnly]
    
    def patch(self, request, pk):
        try:
            exam = Exam.objects.get(pk=pk)
            exam.is_active = not exam.is_active
            exam.save()
            return Response({"message": "Exam status updated", "is_active": exam.is_active})
        except Exam.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
    def delete(self, request, pk):
        try:
            exam = Exam.objects.get(pk=pk)
            title = exam.title
            exam.delete()
            return Response({"message": f"Exam '{title}' deleted"})
        except Exam.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

class AdminStudentDetailView(views.APIView):
    permission_classes = [IsAuthenticated, IsAdminUserOnly]
    
    def get(self, request, pk):
        student = get_object_or_404(User, pk=pk, role='student')
        
        attempts = ExamAttempt.objects.filter(student=student, is_evaluated=True).order_by('submitted_at')
        total_attempts = attempts.count()
        
        percentages = []
        history = []
        passed_count = 0
        
        for attempt in attempts:
            if attempt.total_marks:
                pct = round((attempt.score / attempt.total_marks) * 100, 2)
                percentages.append(pct)
                passed = pct >= 40
                if passed:
                    passed_count += 1
                history.append({
                    "id": attempt.id,
                    "exam_title": attempt.exam.title,
                    "score": pct,
                    "passed": passed,
                    "submitted_at": attempt.submitted_at
                })
                
        avg_score = round(sum(percentages) / len(percentages), 2) if percentages else 0
        pass_rate = round((passed_count / total_attempts) * 100, 2) if total_attempts else 0
        
        return Response({
            "student": UserSerializer(student).data,
            "analytics": {
                "total_exams_taken": total_attempts,
                "average_score": avg_score,
                "pass_rate": pass_rate
            },
            "history": history
        })

class AdminStudentDeleteView(views.APIView):
    permission_classes = [IsAuthenticated, IsAdminUserOnly]
    
    def delete(self, request, pk):
        student = get_object_or_404(User, pk=pk, role='student')
        name = student.name
        student.delete() # Automatically cascades and deletes ExamAttempts
        return Response({"message": f"Student '{name}' permanently deleted"})


# ── Password Reset ─────────────────────────────────────────────────────────

class RequestPasswordResetView(views.APIView):
    """
    POST /api/auth/request-password-reset
    Body: { email }
    Returns a signed token that the frontend embeds in the reset link and
    sends via EmailJS. Token expires in 1 hour.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        # Always return 200 to prevent email enumeration
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"message": "If that email is registered, a reset link has been sent."})

        otp = f"{random.randint(100000, 999999)}"
        token = dumps({'email': email, 'otp': otp}, salt='examflow-password-reset')
        return Response({
            "message": "Reset token generated.",
            "token": token,
            "otp": otp,
            "name": user.name,
        })


class ResetPasswordConfirmView(views.APIView):
    """
    POST /api/auth/reset-password
    Body: { token, password }
    Validates the signed token (max 1 hour old) and updates the password.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        token    = request.data.get('token', '')
        otp      = request.data.get('otp', '')
        password = request.data.get('password', '')

        if not token or not password or not otp:
            return Response({"error": "Token, OTP and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 6:
            return Response({"error": "Password must be at least 6 characters."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            data = loads(token, salt='examflow-password-reset', max_age=3600)
            email = data['email']
            if data['otp'] != str(otp):
                return Response({"error": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)
        except SignatureExpired:
            return Response({"error": "Reset OTP has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)
        except BadSignature:
            return Response({"error": "Invalid or tampered reset OTP."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        user.set_password(password)
        user.save()
        return Response({"message": "Password reset successfully. You can now log in."})


# ── Email Verification ─────────────────────────────────────────────────────

class SendVerificationView(views.APIView):
    """
    POST /api/auth/send-verification
    Body: { email }  — AllowAny so it works right after registration (no JWT yet).
    Generates and returns a signed verification token (24h expiry).
    Frontend embeds the token in a link and sends the email via EmailJS.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()

        # If authenticated, fall back to the logged-in user's email
        if not email and hasattr(request, 'user') and request.user.is_authenticated:
            email = request.user.email

        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"error": "No account found with that email."}, status=status.HTTP_404_NOT_FOUND)

        if user.email_verified:
            return Response({"message": "Email is already verified."})

        otp = f"{random.randint(100000, 999999)}"
        token = dumps({'email': email, 'otp': otp}, salt='examflow-email-verify')
        return Response({
            "message": "Verification token generated.",
            "token": token,
            "otp": otp,
            "name": user.name,
            "email": user.email,
        })


class VerifyEmailView(views.APIView):
    """
    POST /api/auth/verify-email
    Body: { token }
    Validates the signed token (max 24 hours) and marks email_verified=True.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token', '')
        otp = request.data.get('otp', '')

        if not token or not otp:
            return Response({"error": "Verification token and OTP are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            data = loads(token, salt='examflow-email-verify', max_age=86400)  # 24 hours
            email = data['email']
            if data['otp'] != str(otp):
                return Response({"error": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)
        except SignatureExpired:
            return Response({"error": "Verification OTP has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)
        except BadSignature:
            return Response({"error": "Invalid verification OTP."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        user.email_verified = True
        user.save()
        return Response({"message": "Email verified successfully! You can now log in.", "email": email})
