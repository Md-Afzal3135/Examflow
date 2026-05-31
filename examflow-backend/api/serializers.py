from rest_framework import serializers
from .models import User, Exam, Question, ExamAttempt
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role', 'email_verified', 'password', 'date_joined']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],
            role=validated_data.get('role', 'student')
        )
        return user

from rest_framework.exceptions import AuthenticationFailed

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        try:
            data = super().validate(attrs)
        except AuthenticationFailed:
            raise serializers.ValidationError({"error": "Invalid email or password."})
            
        request_role = self.initial_data.get('role')
        if request_role and self.user.role != request_role:
            raise serializers.ValidationError({"error": f"Invalid credentials. Please ensure you are logging in as a {request_role}."})

        # Add user data to response to match the Guide's return format
        data['user'] = {
            'id': self.user.id,
            'name': self.user.name,
            'email': self.user.email,
            'role': self.user.role
        }
        # The frontend guide expects "token" as the access token key
        data['token'] = data.pop('access')
        return data

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'option_a', 'option_b', 'option_c', 'option_d', 'marks']
        
class QuestionAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'exam', 'text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option', 'marks']

class ExamSerializer(serializers.ModelSerializer):
    total_questions = serializers.SerializerMethodField()
    
    class Meta:
        model = Exam
        fields = ['id', 'title', 'description', 'duration_minutes', 'total_marks', 'is_active', 'total_questions']

    def get_total_questions(self, obj):
        return obj.questions.count()

class ExamDetailSerializer(ExamSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    
    class Meta(ExamSerializer.Meta):
        fields = ExamSerializer.Meta.fields + ['questions']

class ExamAttemptSerializer(serializers.ModelSerializer):
    exam_title = serializers.CharField(source='exam.title', read_only=True)
    percentage = serializers.SerializerMethodField()

    class Meta:
        model = ExamAttempt
        fields = [
            'id',
            'exam_id',
            'exam_title',
            'student_id',
            'score',
            'total_marks',
            'percentage',
            'is_evaluated',
            'submitted_at',
        ]

    def get_percentage(self, obj):
        if not obj.total_marks:
            return 0
        return round((obj.score / obj.total_marks) * 100, 2)
