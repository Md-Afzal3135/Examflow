import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'examflow_backend.settings')
django.setup()

from api.models import User, Exam, Question, ExamAttempt
from api.utils import evaluate_attempt

def seed():
    # 1. Create target specific user 'afzal1234' with Admin privileges
    print("Seeding specific user account afzal1234...")
    afzal, created = User.objects.get_or_create(email="afzal1234@examflow.com", defaults={
        "name": "afzal1234",
        "role": "admin", 
        "is_staff": True,
        "is_superuser": True
    })
    
    afzal.set_password("Afzal@123")
    afzal.role = "admin"
    afzal.is_staff = True
    afzal.is_superuser = True
    afzal.save()
    print("Created Admin User: Email=afzal1234@examflow.com, Password=Afzal@123")

    # 2. Seed Students (25 records)
    print("Seeding 25 sample students...")
    students = []
    for i in range(1, 26):
        email = f"student{i}@examflow.com"
        user, _ = User.objects.get_or_create(email=email, defaults={
            "name": f"Test Student {i}",
            "role": "student"
        })
        user.set_password("student123")
        user.save()
        students.append(user)

    # 3. Seed Exams & Questions (5 exams, 10 Qs each = 55 records)
    print("Seeding 5 Exams and 50 Questions...")
    exams = []
    for i in range(1, 6):
        exam, _ = Exam.objects.get_or_create(title=f"General Knowledge Exam Model {i}", defaults={
            "description": f"Standardized test layout covering general knowledge {i}.",
            "duration_minutes": random.choice([30, 45, 60]),
            "total_marks": 100,
            "is_active": True,
            "created_by": afzal
        })
        exams.append(exam)
        
        if exam.questions.count() == 0:
            for j in range(1, 11):
                Question.objects.create(
                    exam=exam,
                    text=f"Which of the following describes sample problem {j} accurately?",
                    option_a=f"Random Answer {j}.1",
                    option_b=f"Random Answer {j}.2",
                    option_c=f"Random Answer {j}.3",
                    option_d=f"Random Answer {j}.4",
                    correct_option=random.choice(['A', 'B', 'C', 'D']),
                    marks=10
                )

    # 4. Seed Attempts and Results (Approx 40 attempts = 40 records)
    print("Seeding roughly 40 student examination attempts...")
    for student in students:
        # Each student randomly takes between 1 to 3 exams
        attempted_exams = random.sample(exams, random.randint(1, 3))
        for exam in attempted_exams:
            if not ExamAttempt.objects.filter(student=student, exam=exam).exists():
                answers = {}
                for q in exam.questions.all():
                    # 75% chance of getting it right to skew stats reasonably
                    if random.random() > 0.25:
                        answers[str(q.id)] = q.correct_option
                    else:
                        answers[str(q.id)] = random.choice([opt for opt in ['A', 'B', 'C', 'D'] if opt != q.correct_option])
                    
                attempt = ExamAttempt.objects.create(
                    student=student,
                    exam=exam,
                    answers=answers,
                    is_evaluated=True
                )
                
                score, total = evaluate_attempt(attempt)
                attempt.score = score
                attempt.total_marks = total
                attempt.save()

    total_records = User.objects.count() + Exam.objects.count() + Question.objects.count() + ExamAttempt.objects.count()
    print(f"Data seeding complete! Reached Approx {total_records} database records.")

if __name__ == "__main__":
    seed()
