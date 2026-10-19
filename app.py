from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from functools import wraps
import firebase_admin
from firebase_admin import auth, credentials, firestore

# Initialize Firebase Admin SDK (prevents re-initialization errors)
if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

# Initialize Firestore DB Client
db = firestore.client()

app = Flask(__name__)
app.secret_key = "super-secret-key-change-this-in-production"  # Needed for sessions

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
                return jsonify({"status": "error", "message": "Prompt and 5 options are required."}), 400

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