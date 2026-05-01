from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.utils import timezone
from django.shortcuts import get_object_or_404

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
