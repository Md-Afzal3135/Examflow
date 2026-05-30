"""
seed_mock.py
------------
Seeds the ExamFlow database with:
  • 30 realistic student accounts
  • 8 topic-specific exams (10 questions each, 10 marks each → 100 total marks)
  • Varied student attempts with realistic score distributions
  • Existing admin account preserved (get_or_create)

Run from the backend root:
    python seed_mock.py
"""

import os
import django
import random
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "examflow_backend.settings")
django.setup()

from api.models import User, Exam, Question, ExamAttempt
from api.utils import evaluate_attempt

# ──────────────────────────────────────────────────────────────
# DATA POOLS
# ──────────────────────────────────────────────────────────────

FIRST_NAMES = [
    "Arjun", "Priya", "Rohan", "Sneha", "Vikram", "Ananya", "Karan",
    "Divya", "Rahul", "Pooja", "Aditya", "Meera", "Siddharth", "Kavya",
    "Amit", "Riya", "Nikhil", "Shreya", "Ajay", "Nandini", "Harish",
    "Ishaan", "Tanvi", "Deepak", "Swati", "Gaurav", "Preethi", "Varun",
    "Lakshmi", "Sandeep",
]

LAST_NAMES = [
    "Sharma", "Patel", "Reddy", "Nair", "Gupta", "Singh", "Kumar",
    "Verma", "Mehta", "Joshi", "Iyer", "Pillai", "Rao", "Choudhary",
    "Das", "Bose", "Mishra", "Pandey", "Shah", "Shetty",
]

# 8 exam definitions: (title, description, duration, questions_list)
# Each question: (text, A, B, C, D, correct)
EXAM_CATALOG = [
    {
        "title": "Python Programming Fundamentals",
        "description": "Tests core Python concepts: syntax, data structures, OOP, and standard library.",
        "duration": 45,
        "questions": [
            ("What is the output of `print(type([]))`?", "<class 'list'>", "<class 'tuple'>", "<class 'dict'>", "<class 'set'>", "A"),
            ("Which keyword is used to define a function in Python?", "func", "define", "def", "fun", "C"),
            ("What does `len({'a':1,'b':2})` return?", "1", "2", "3", "0", "B"),
            ("Which of these is an immutable data type?", "List", "Dictionary", "Set", "Tuple", "D"),
            ("What is the correct way to open a file for writing?", "open('f','r')", "open('f','w')", "open('f','a+')", "open('f','x')", "B"),
            ("What does `//` operator do in Python?", "Division", "Modulo", "Floor Division", "Exponentiation", "C"),
            ("How do you create a virtual environment?", "python -m env", "python -m venv", "python virtualenv", "py -env", "B"),
            ("Which method removes and returns the last item of a list?", "remove()", "pop()", "delete()", "discard()", "B"),
            ("What is a lambda function?", "Named function", "Anonymous function", "Recursive function", "Generator function", "B"),
            ("Which module is used for regular expressions in Python?", "regex", "re", "regexp", "string", "B"),
        ],
    },
    {
        "title": "Web Development Basics",
        "description": "Covers HTML, CSS, and JavaScript fundamentals for front-end development.",
        "duration": 40,
        "questions": [
            ("What does HTML stand for?", "Hyper Transfer Markup Language", "Hyper Text Markup Language", "High Text Machine Language", "Hyper Tool Markup Language", "B"),
            ("Which CSS property changes text colour?", "font-color", "text-color", "color", "foreground", "C"),
            ("How do you declare a JavaScript variable?", "variable x", "dim x", "var x", "int x", "C"),
            ("Which HTML tag is used for the largest heading?", "<h6>", "<heading>", "<h1>", "<head>", "C"),
            ("What does CSS stand for?", "Colorful Style Sheets", "Cascading Style Sheets", "Creative Style Sheets", "Computer Style Sheets", "B"),
            ("Which property is used to change the background colour?", "bgcolor", "background-color", "color-bg", "back-color", "B"),
            ("What does DOM stand for?", "Document Object Model", "Display Object Module", "Digital Object Model", "Data Object Module", "A"),
            ("Which event fires when a button is clicked?", "onhover", "onclick", "onpress", "onselect", "B"),
            ("How do you link an external CSS file?", "<style src=''>", "<link rel='stylesheet'>", "<css href=''>", "<include css>", "B"),
            ("Which HTML element is used for JavaScript code?", "<js>", "<code>", "<script>", "<javascript>", "C"),
        ],
    },
    {
        "title": "Database & SQL Essentials",
        "description": "Assesses knowledge of relational databases, SQL queries, and data modelling.",
        "duration": 50,
        "questions": [
            ("What does SQL stand for?", "Structured Query Language", "Simple Query Language", "Sequential Query Language", "Standard Query Language", "A"),
            ("Which command retrieves data from a table?", "GET", "FETCH", "SELECT", "PULL", "C"),
            ("Which clause filters rows in a SELECT statement?", "HAVING", "WHERE", "FILTER", "LIMIT", "B"),
            ("What is a PRIMARY KEY?", "Duplicate identifier", "Unique row identifier", "Foreign reference", "Index column", "B"),
            ("Which JOIN returns all rows from both tables?", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN", "D"),
            ("What does GROUP BY do?", "Sorts results", "Groups rows by a column", "Filters duplicates", "Limits rows returned", "B"),
            ("Which command adds a new row?", "ADD", "INSERT INTO", "NEW ROW", "APPEND", "B"),
            ("What is normalisation?", "Speeding up queries", "Organising data to reduce redundancy", "Encrypting data", "Backing up tables", "B"),
            ("Which constraint prevents NULL values?", "UNIQUE", "PRIMARY KEY", "NOT NULL", "DEFAULT", "C"),
            ("What is a FOREIGN KEY?", "Primary key of same table", "Key in another table referencing this table", "Encrypted key", "Composite key", "B"),
        ],
    },
    {
        "title": "Data Structures & Algorithms",
        "description": "Tests understanding of arrays, linked lists, trees, graphs, and algorithm complexity.",
        "duration": 60,
        "questions": [
            ("What is the time complexity of binary search?", "O(n)", "O(n²)", "O(log n)", "O(1)", "C"),
            ("Which data structure uses FIFO ordering?", "Stack", "Queue", "Tree", "Graph", "B"),
            ("What is a linked list?", "Contiguous memory structure", "Nodes connected via pointers", "Key-value store", "Binary structure", "B"),
            ("What is the worst-case time of bubble sort?", "O(n log n)", "O(n)", "O(n²)", "O(log n)", "C"),
            ("Which traversal visits left-root-right?", "Pre-order", "In-order", "Post-order", "Level-order", "B"),
            ("What data structure is used for DFS?", "Queue", "Heap", "Stack", "Array", "C"),
            ("Which algorithm finds shortest path?", "DFS", "Binary Search", "Dijkstra", "Merge Sort", "C"),
            ("What is a hash table?", "Sorted array", "Key-value store using hash function", "Linked node structure", "Binary tree", "B"),
            ("Which sorting algorithm is stable and O(n log n)?", "Quick Sort", "Bubble Sort", "Merge Sort", "Selection Sort", "C"),
            ("What is recursion?", "Iterative loop", "Function calling itself", "Pointer arithmetic", "Stack overflow", "B"),
        ],
    },
    {
        "title": "Operating Systems Concepts",
        "description": "Covers OS fundamentals: processes, threads, memory management, and scheduling.",
        "duration": 45,
        "questions": [
            ("What is a process?", "Program in storage", "Program in execution", "OS kernel", "Device driver", "B"),
            ("Which scheduling algorithm is fairest?", "FCFS", "Round Robin", "Priority", "LIFO", "B"),
            ("What is virtual memory?", "Extra RAM", "ROM storage", "Abstraction extending physical memory", "Cache layer", "C"),
            ("What does a mutex do?", "Speeds up I/O", "Provides mutual exclusion", "Manages threads", "Allocates memory", "B"),
            ("What is deadlock?", "System freeze", "Processes waiting on each other forever", "Memory overflow", "Disk failure", "B"),
            ("Which component manages hardware?", "Compiler", "Kernel", "Shell", "Loader", "B"),
            ("What is thrashing?", "High CPU usage", "Excessive page swapping", "Memory leak", "I/O starvation", "B"),
            ("What is paging?", "Memory compaction", "Dividing memory into fixed-size frames", "Disk management", "Thread scheduling", "B"),
            ("What does IPC stand for?", "Inter-Process Communication", "Internal Process Control", "Input-Process-Compute", "Integrated Process Chain", "A"),
            ("What is a context switch?", "Changing file permissions", "Saving/restoring process state", "Thread creation", "Kernel panic", "B"),
        ],
    },
    {
        "title": "Computer Networks & Security",
        "description": "Tests networking models, protocols, IP addressing, and cybersecurity fundamentals.",
        "duration": 45,
        "questions": [
            ("What does HTTP stand for?", "Hyper Transfer Text Protocol", "HyperText Transfer Protocol", "High Text Transfer Protocol", "Hybrid Transfer Protocol", "B"),
            ("Which layer of OSI handles routing?", "Transport", "Network", "Data Link", "Session", "B"),
            ("What is the default port for HTTPS?", "80", "443", "8080", "22", "B"),
            ("What does DNS do?", "Encrypts data", "Translates domain names to IP", "Routes packets", "Manages firewalls", "B"),
            ("What is a firewall?", "Antivirus software", "Network security barrier", "Encryption algorithm", "Load balancer", "B"),
            ("Which protocol sends email?", "IMAP", "POP3", "SMTP", "FTP", "C"),
            ("What is a subnet mask?", "IP encryption", "Divides IP into network/host parts", "Routing table", "Gateway address", "B"),
            ("What does SSL/TLS provide?", "Speed", "Encryption for data in transit", "Authentication only", "Compression", "B"),
            ("What is a DDoS attack?", "Single user overloading server", "Distributed overload attack", "SQL injection", "Man-in-middle attack", "B"),
            ("What is the loopback address?", "192.168.0.1", "10.0.0.1", "127.0.0.1", "255.255.255.0", "C"),
        ],
    },
    {
        "title": "Mathematics for Computer Science",
        "description": "Covers discrete mathematics, logic, probability, and linear algebra for CS students.",
        "duration": 55,
        "questions": [
            ("What is 2^10?", "512", "1000", "1024", "256", "C"),
            ("How many bits in a byte?", "4", "16", "8", "32", "C"),
            ("What is the Boolean result of TRUE AND FALSE?", "TRUE", "FALSE", "UNDEFINED", "NULL", "B"),
            ("What is the complement of set A?", "A itself", "Universal set minus A", "A union B", "A intersection B", "B"),
            ("What is log₂(64)?", "4", "8", "6", "16", "C"),
            ("How many edges does a complete graph K₄ have?", "4", "6", "8", "12", "B"),
            ("What is factorial of 0?", "0", "1", "Undefined", "Infinity", "B"),
            ("What is a prime number?", "Divisible by 2", "Divisible only by 1 and itself", "An even number", "A perfect square", "B"),
            ("What does P(A|B) represent?", "P(A) times P(B)", "Probability of A given B", "P(A) plus P(B)", "Probability of not A", "B"),
            ("What is the modulo of 17 mod 5?", "3", "2", "1", "4", "B"),
        ],
    },
    {
        "title": "Software Engineering Principles",
        "description": "Evaluates SDLC, design patterns, agile methodologies, and software testing.",
        "duration": 40,
        "questions": [
            ("What does SDLC stand for?", "Software Design Life Cycle", "Software Development Life Cycle", "System Design Language Construct", "Software Deployment Life Cycle", "B"),
            ("Which methodology uses sprints?", "Waterfall", "V-Model", "Agile/Scrum", "RAD", "C"),
            ("What is a design pattern?", "UI template", "Reusable solution to common problem", "Database schema", "Programming language", "B"),
            ("What is unit testing?", "Testing entire system", "Testing individual components", "Testing UI only", "Load testing", "B"),
            ("What is version control?", "Software licensing", "Tracking code changes over time", "Deployment automation", "Documentation system", "B"),
            ("What does CI/CD stand for?", "Continuous Integration/Continuous Delivery", "Code Inspection/Code Deployment", "Central Integration/Central Deployment", "Client Interface/Client Delivery", "A"),
            ("What is technical debt?", "Software licensing fee", "Cost of shortcuts taken in development", "Server maintenance cost", "Team salary cost", "B"),
            ("Which pattern separates UI from business logic?", "Singleton", "Factory", "MVC", "Observer", "C"),
            ("What is refactoring?", "Rewriting from scratch", "Improving code without changing behaviour", "Adding new features", "Fixing bugs", "B"),
            ("What is a sprint in Scrum?", "A release", "A time-boxed iteration", "A bug fix cycle", "A deployment", "B"),
        ],
    },
]


def seed_mock():
    print("=" * 60)
    print("  ExamFlow — Mock Data Seeder")
    print("=" * 60)

    # ── Admin (preserved) ──────────────────────────────────────
    print("\n[1/4] Ensuring admin account exists...")
    admin, _ = User.objects.get_or_create(
        email="afzal1234@examflow.com",
        defaults={"name": "afzal1234", "role": "admin", "is_staff": True, "is_superuser": True},
    )
    admin.set_password("Afzal@123")
    admin.role = "admin"
    admin.is_staff = True
    admin.is_superuser = True
    admin.save()
    print("    ✔ Admin: afzal1234@examflow.com / Afzal@123")

    # ── 30 Students ───────────────────────────────────────────
    print("\n[2/4] Seeding 30 students...")
    students = []
    used_combos = set()
    i = 1
    while len(students) < 10:
        fn = random.choice(FIRST_NAMES)
        ln = random.choice(LAST_NAMES)
        combo = (fn, ln)
        if combo in used_combos:
            continue
        used_combos.add(combo)

        full_name = f"{fn} {ln}"
        email = f"{fn.lower()}.{ln.lower()}{i}@examflow.com"
        user, created = User.objects.get_or_create(
            email=email,
            defaults={"name": full_name, "role": "student"},
        )
        user.set_password("Student@123")
        user.save()
        students.append(user)
        status = "created" if created else "exists"
        print(f"    {'✔' if created else '·'} [{i:02d}] {full_name} ({email}) — {status}")
        i += 1

    # ── 8 Exams with 10 questions each ────────────────────────
    print("\n[3/4] Seeding 3 exams with 10 questions each...")
    exams = []
    for idx, cat in enumerate(EXAM_CATALOG[:3], start=1):
        exam, created = Exam.objects.get_or_create(
            title=cat["title"],
            defaults={
                "description": cat["description"],
                "duration_minutes": cat["duration"],
                "total_marks": 100,
                "is_active": True,
                "created_by": admin,
            },
        )
        exams.append(exam)
        status = "created" if created else "exists"
        print(f"    {'✔' if created else '·'} [{idx}] {cat['title']} — {status}")

        if exam.questions.count() == 0:
            for q_data in cat["questions"]:
                text, a, b, c, d, correct = q_data
                Question.objects.create(
                    exam=exam,
                    text=text,
                    option_a=a,
                    option_b=b,
                    option_c=c,
                    option_d=d,
                    correct_option=correct,
                    marks=10,
                )
            print(f"         └─ 10 questions inserted")

    # ── Attempts: every student takes 3–6 random exams ────────
    print("\n[4/4] Seeding exam attempts...")
    attempt_count = 0
    for student in students:
        num_exams = random.randint(3, 6)
        chosen_exams = random.sample(exams, min(num_exams, len(exams)))

        for exam in chosen_exams:
            if ExamAttempt.objects.filter(student=student, exam=exam).exists():
                continue

            # Simulate a student performance tier (weak / average / strong)
            tier = random.choices(["weak", "average", "strong"], weights=[20, 50, 30])[0]
            correct_prob = {"weak": 0.35, "average": 0.65, "strong": 0.85}[tier]

            answers = {}
            for q in exam.questions.all():
                if random.random() < correct_prob:
                    answers[str(q.id)] = q.correct_option
                else:
                    wrong = [opt for opt in ["A", "B", "C", "D"] if opt != q.correct_option]
                    answers[str(q.id)] = random.choice(wrong)

            # Stagger submission times over the past 60 days
            days_ago = random.randint(1, 60)
            submitted = timezone.now() - timedelta(days=days_ago, hours=random.randint(0, 12))

            attempt = ExamAttempt.objects.create(
                student=student,
                exam=exam,
                answers=answers,
                submitted_at=submitted,
                is_evaluated=True,
            )
            score, total = evaluate_attempt(attempt)
            attempt.score = score
            attempt.total_marks = total
            attempt.save()
            attempt_count += 1

    print(f"    ✔ {attempt_count} attempts created")

    # ── Summary ───────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("  Seeding complete! Database summary:")
    print(f"  • Users      : {User.objects.count()} (1 admin + {User.objects.filter(role='student').count()} students)")
    print(f"  • Exams      : {Exam.objects.count()}")
    print(f"  • Questions  : {Question.objects.count()}")
    print(f"  • Attempts   : {ExamAttempt.objects.count()}")
    print("=" * 60)
    print("\n  Student login credentials:")
    print("  Email  : <firstname>.<lastname><n>@examflow.com")
    print("  Password: Student@123")
    print("\n  Admin credentials:")
    print("  Email  : afzal1234@examflow.com")
    print("  Password: Afzal@123")
    print("=" * 60)


if __name__ == "__main__":
    seed_mock()
