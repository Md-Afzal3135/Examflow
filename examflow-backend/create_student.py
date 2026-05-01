import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'examflow_backend.settings')
django.setup()

from api.models import User

def create_student():
    student, created = User.objects.get_or_create(
        email="student@examflow.com",
        defaults={
            "name": "Test Student",
            "role": "student"
        }
    )
    student.set_password("Student@123")
    student.save()
    print("Created dedicated student account successfully!")

if __name__ == '__main__':
    create_student()
