import os
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from functools import wraps
import firebase_admin
from firebase_admin import auth, credentials, firestore
from scoring_engine import evaluate_psychometric_profile

# Initialize Flask App
app = Flask(__name__)
app.secret_key = "super-secret-key-change-this-in-production"

# Absolute path resolution for Firebase service account key (prevents OneDrive path issues)
basedir = os.path.abspath(os.path.dirname(__file__))
key_path = os.path.join(basedir, "serviceAccountKey.json")

# Initialize Firebase Admin SDK (prevents re-initialization errors)
if not firebase_admin._apps:
    cred = credentials.Certificate(key_path)
    firebase_admin.initialize_app(cred)

# Initialize Firestore DB Client
db = firestore.client()

# ----------------------------------------------------
# ADMIN PROTECTION DECORATOR
# ----------------------------------------------------
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('is_admin'):
            return redirect(url_for('auth_page', role='admin'))
        return f(*args, **kwargs)
    return decorated_function

# ----------------------------------------------------
# PUBLIC ROUTES
# ----------------------------------------------------

@app.route('/')
def home():
    return render_template('landing.html')

@app.route('/auth')
def auth_page():
    role = request.args.get('role', 'user')
    return render_template('auth.html', role=role)

# ----------------------------------------------------
# AUTHENTICATION API
# ----------------------------------------------------

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json() or {}
    id_token = data.get('idToken')
    intended_role = data.get('role', 'user')
    
    if not id_token:
        return jsonify({"status": "error", "message": "Missing ID token."}), 400

    try:
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        email = decoded_token.get('email', '')
        
        admin_emails = [
            "anushkaagre7@gmail.com",
            "gaidharshravani@gmail.com",
            "tirupati23@gmail.com"
        ]
        is_admin_user = email in admin_emails
        
        # Auto-create or merge user profile in Firestore so they show up in admin lists immediately
        user_ref = db.collection('users').document(uid)
        user_doc = user_ref.get()
        if not user_doc.exists:
            user_ref.set({
                "email": email,
                "full_name": decoded_token.get('name', 'Student'),
                "stream": "General",
                "academicLevel": "Standard Track",
                "testCompleted": False,
                "createdAt": firestore.SERVER_TIMESTAMP
            }, merge=True)
        
        if intended_role == 'admin':
            if not is_admin_user:
                return jsonify({
                    "status": "error", 
                    "message": "Access denied. This account does not have admin permissions."
                }), 403
            
            session['user_id'] = uid
            session['is_admin'] = True
            return jsonify({
                "status": "success", 
                "role": "admin", 
                "redirect": "/admin/dashboard"
            })
        
        else:
            session['user_id'] = uid
            session['is_admin'] = is_admin_user
            return jsonify({
                "status": "success", 
                "role": "user", 
                "redirect": "/user/dashboard"
            })
            
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 401

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({"status": "success"})

# ----------------------------------------------------
# SECURED ADMIN SPA & AGGREGATE API
# ----------------------------------------------------

@app.route('/admin')
@app.route('/admin/dashboard')
@admin_required
def admin_dashboard():
    return render_template('admin/index.html')

@app.route('/api/admin/data')
@admin_required
def api_admin_data():
    try:
        users_list = []
        
        # 1. Fetch metadata profiles from Firestore 'users' collection
        firestore_users = {}
        try:
            users_ref = db.collection('users').stream()
            for doc in users_ref:
                firestore_users[doc.id] = doc.to_dict()
        except Exception as fs_err:
            print("Firestore query note (users):", fs_err)

        # 2. Fetch registered users from Firebase Authentication
        page = auth.list_users()
        for user in page.iterate_all():
            profile = firestore_users.get(user.uid, {})
            users_list.append({
                "uid": user.uid,
                "email": user.email or "N/A",
                "name": profile.get("full_name") or user.display_name or (user.email.split('@')[0] if user.email else "Student"),
                "stream": profile.get("stream", "General Track"),
                "academicLevel": profile.get("academicLevel", "Standard"),
                "testCompleted": profile.get("testCompleted", False),
                "createdAt": profile.get("createdAt") or (user.user_metadata.creation_timestamp if user.user_metadata else "Recent")
            })

        # 3. Dynamic counts for Questions and Careers from Firestore
        question_count = len(list(db.collection('questions').stream()))
        career_count = len(list(db.collection('careers').stream()))
        total_students = len(users_list)
        completed_tests = sum(1 for u in users_list if u.get("testCompleted"))

        return jsonify({
            "status": "success",
            "stats": {
                "total_students": total_students,
                "assessment_questions": question_count,
                "assessments_completed": completed_tests,
                "curated_careers": career_count
            },
            "users": users_list
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ----------------------------------------------------
# TO PROVIDE TEST RESULTS FOR USER DASHBOARD 
# ----------------------------------------------------
@app.route('/api/user/dashboard-data', methods=['GET'])
def get_user_dashboard_data():
    uid = get_request_uid()
    if not uid:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    try:
        doc = db.collection('users').document(uid).get()
        if doc.exists:
            data = doc.to_dict()
            registered_name = data.get('full_name') or 'Student'
            # Return both formats so frontend JS never misses a field
            response_data = {
                "full_name": registered_name,
                "email": data.get('email', ''),
                "stream": data.get('stream', 'General'),
                "testCompleted": data.get('testCompleted', False),
                "top_domain": data.get('top_domain', 'Pending Assessment'),
                "career_title": data.get('career_title', 'Complete Test to Unlock'),
                "compatibility": data.get('compatibility', 0),
                "academic_recommendation": data.get('academic_recommendation', '')
            }
            return jsonify({"status": "success", "data": response_data})
        else:
            return jsonify({"status": "success", "data": {"testCompleted": False, "full_name": "Student"}})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
        

# ----------------------------------------------------
# QUESTIONS CRUD API (Firestore: 'questions')
# ----------------------------------------------------

@app.route('/api/admin/questions', methods=['GET', 'POST'])
@admin_required
def api_admin_questions():
    if request.method == 'GET':
        try:
            questions = []
            docs = db.collection('questions').stream()
            for doc in docs:
                item = doc.to_dict()
                item['id'] = doc.id
                questions.append(item)
            return jsonify({"status": "success", "questions": questions})
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    elif request.method == 'POST':
        try:
            data = request.get_json() or {}
            prompt = data.get('q') or data.get('prompt')
            options = data.get('options', [])

            if not prompt or not options:
                return jsonify({"status": "error", "message": "Prompt and options are required."}), 400

            doc_ref = db.collection('questions').add({
                "q": prompt,
                "options": options,
                "createdAt": firestore.SERVER_TIMESTAMP
            })
            return jsonify({"status": "success", "id": doc_ref[1].id}), 201
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/admin/questions/<question_id>', methods=['DELETE'])
@admin_required
def api_admin_delete_question(question_id):
    try:
        db.collection('questions').document(question_id).delete()
        return jsonify({"status": "success", "message": "Question deleted."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/admin/questions/<question_id>', methods=['PUT'])
@admin_required
def api_admin_update_question(question_id):
    try:
        data = request.get_json() or {}
        prompt = data.get('q') or data.get('prompt')
        options = data.get('options', [])

        if not prompt or not options:
            return jsonify({"status": "error", "message": "Prompt and options are required."}), 400

        db.collection('questions').document(question_id).update({
            "q": prompt,
            "options": options,
            "updatedAt": firestore.SERVER_TIMESTAMP
        })
        return jsonify({"status": "success", "message": "Question updated successfully."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ----------------------------------------------------
# CAREERS CRUD API (Firestore: 'careers')
# ----------------------------------------------------

@app.route('/api/admin/careers', methods=['GET', 'POST'])
@admin_required
def api_admin_careers():
    if request.method == 'GET':
        try:
            careers = []
            docs = db.collection('careers').stream()
            for doc in docs:
                item = doc.to_dict()
                item['id'] = doc.id
                careers.append(item)
            return jsonify({"status": "success", "careers": careers})
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    elif request.method == 'POST':
        try:
            data = request.get_json() or {}
            title = data.get('title')
            domain = data.get('domain')
            salary = data.get('salary')
            description = data.get('description')

            if not title or not domain:
                return jsonify({"status": "error", "message": "Title and domain tag are required."}), 400

            doc_ref = db.collection('careers').add({
                "title": title,
                "domain": domain,
                "salary": salary,
                "description": description,
                "createdAt": firestore.SERVER_TIMESTAMP
            })
            return jsonify({"status": "success", "id": doc_ref[1].id}), 201
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/admin/careers/<career_id>', methods=['DELETE'])
@admin_required
def api_admin_delete_career(career_id):
    try:
        db.collection('careers').document(career_id).delete()
        return jsonify({"status": "success", "message": "Career deleted."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/admin/careers/<career_id>', methods=['PUT'])
@admin_required
def api_admin_update_career(career_id):
    try:
        data = request.get_json() or {}
        title = data.get('title')
        domain = data.get('domain')
        salary = data.get('salary')
        description = data.get('description')

        if not title or not domain:
            return jsonify({"status": "error", "message": "Title and domain are required."}), 400

        db.collection('careers').document(career_id).update({
            "title": title,
            "domain": domain,
            "salary": salary,
            "description": description,
            "updatedAt": firestore.SERVER_TIMESTAMP
        })
        return jsonify({"status": "success", "message": "Career updated successfully."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
# ----------------------------------------------------
# STUDENT RESULTS API (Reads completed results from 'users')
# ----------------------------------------------------
@app.route('/api/admin/results', methods=['GET'])
@admin_required
def api_admin_results():
    try:
        results = []
        # Fetch all user documents from Firestore
        users_ref = db.collection('users').stream()
        
        for doc in users_ref:
            u = doc.to_dict()
            
            # Only include students who have completed their test
            if u.get('testCompleted') is True:
                # Format timestamp safely
                updated_at = u.get('updatedAt') or u.get('createdAt')
                if hasattr(updated_at, 'strftime'):
                    formatted_date = updated_at.strftime('%b %d, %Y')
                elif isinstance(updated_at, str):
                    formatted_date = updated_at[:10]
                else:
                    formatted_date = 'Recent'

                results.append({
                    "id": doc.id,
                    "studentName": u.get('full_name') or u.get('name') or (u.get('email', '').split('@')[0] if u.get('email') else 'Student'),
                    "studentEmail": u.get('email', ''),
                    "dominantDomain": u.get('top_domain', 'N/A'),
                    "topCareer": u.get('career_title', 'General Pathway'),
                    "matchScore": u.get('compatibility', 85),
                    "formattedDate": formatted_date
                })

        return jsonify({"status": "success", "results": results})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
# ----------------------------------------------------
# HELPER FOR AUTH TOKENS
# ----------------------------------------------------
def get_request_uid():
    if 'user_id' in session:
        return session['user_id']
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        try:
            token = auth_header.split(' ')[1]
            decoded_token = auth.verify_id_token(token)
            return decoded_token['uid']
        except Exception:
            pass
    return None

# ----------------------------------------------------
# Admin Questions & Careers Management SPA
# ----------------------------------------------------
@app.route('/api/questions', methods=['GET'])
def get_student_questions():
    """Fetches questions from Firestore for students taking the test."""
    try:
        questions = []
        docs = db.collection('questions').stream()
        for doc in docs:
            item = doc.to_dict()
            # Ensure the prompt key matches what test.html expects ('q' or 'prompt')
            if 'prompt' in item and 'q' not in item:
                item['q'] = item['prompt']
            questions.append(item)
            
        return jsonify({"status": "success", "questions": questions})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ----------------------------------------------------
# MULTI-CRITERIA QUIZ SUBMISSION API (Uses scoring_engine.py)
# ----------------------------------------------------
@app.route('/api/quiz/submit', methods=['POST'])
def submit_quiz():
    uid = get_request_uid()
    if not uid:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
        
    try:
        data = request.get_json() or {}
        answers_traits = data.get('answers_traits', [])
        
        user_doc = db.collection('users').document(uid).get()
        user_profile = user_doc.to_dict() if user_doc.exists else {}
        
        marks_10th = float(user_profile.get('marks_10th', 85.0))
        marks_12th = float(user_profile.get('marks_12th', 80.0))
        
        # 1. Fetch dynamic careers from Firestore
        careers_docs = db.collection('careers').stream()
        firestore_careers = [doc.to_dict() for doc in careers_docs]

        # 2. Evaluate profile with dynamic Firestore careers
        evaluation = evaluate_psychometric_profile(
            answers_traits, 
            marks_10th, 
            marks_12th, 
            available_careers=firestore_careers
        )
        
        result_data = {
            "top_domain": evaluation['top_domain'],
            "career_title": evaluation['career_title'],
            "description": f"Multidimensional Evaluation Engine analysis mapped your traits to {evaluation['top_domain']}. {evaluation['academic_recommendation']}",
            "compatibility": evaluation['compatibility'],
            "academic_recommendation": evaluation['academic_recommendation'],
            "testCompleted": True,
            "updatedAt": firestore.SERVER_TIMESTAMP
        }
        
        db.collection('users').document(uid).set(result_data, merge=True)
        return jsonify({"status": "success", "redirect": "/user/results"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
@app.route('/api/user/results-data', methods=['GET'])
def get_user_results():
    uid = get_request_uid()
    if not uid:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    try:
        doc = db.collection('users').document(uid).get()
        if doc.exists and doc.to_dict().get('testCompleted'):
            return jsonify({"status": "success", "results": doc.to_dict()})
        else:
            return jsonify({
                "status": "success", 
                "results": {
                    "career_title": "Take Psychometric Test",
                    "description": "Complete your assessment to generate your multi-criteria evaluation report.",
                    "compatibility": 0
                }
            })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ----------------------------------------------------
# USER ROUTES (templates/user/...)
# ----------------------------------------------------

@app.route('/user/dashboard')
def user_dashboard():
    return render_template('user/dashboard.html')

@app.route('/user/profile')
def user_profile():
    return render_template('user/profile.html')

@app.route('/user/test')
def user_test():
    return render_template('user/test.html')

@app.route('/user/careers')
def user_careers():
    return render_template('user/careers.html')

@app.route('/user/results')
def user_results():
    return render_template('user/results.html')

@app.route('/user/chatbot')
def user_chatbot():
    return render_template('user/chatbot.html')

# ----------------------------------------------------
# SERVER ENTRY POINT
# ----------------------------------------------------
if __name__ == '__main__':
    app.run(debug=True, port=5000)