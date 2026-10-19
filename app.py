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
            # Redirect unauthorized users to admin login
            return redirect(url_for('auth_page', role='admin'))
        return f(*args, **kwargs)
    return decorated_function

# ----------------------------------------------------
# PUBLIC ROUTES
# ----------------------------------------------------

# Main landing page route
@app.route('/')
def home():
    return render_template('landing.html')

# Authentication gateway route accepting ?role=user or ?role=admin
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
        # Verify the Firebase ID token sent from the client-side
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        email = decoded_token.get('email', '')
        
        # Whitelisted admin emails
        admin_emails = [
            "anushkaagre7@gmail.com",
            "gaidharshravani@gmail.com",
            "tirupati23@gmail.com"
        ]
        is_admin_user = email in admin_emails
        
        # Guard: Check role mismatch
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
            # Standard user login flow (Redirects to dashboard)
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
# SECURED ADMIN ROUTES & DATA APIS
# ----------------------------------------------------

@app.route('/admin/dashboard')
@admin_required
def admin_dashboard():
    # Renders templates/admin/index.html according to your project structure
    return render_template('admin/index.html')

# Endpoint to supply aggregated stats and registered user directory to admin.js
@app.route('/api/admin/data')
@admin_required
def api_admin_data():
    try:
        users_list = []
        
        # 1. Fetch metadata profiles from Firestore 'users' collection if present
        firestore_users = {}
        try:
            users_ref = db.collection('users').stream()
            for doc in users_ref:
                firestore_users[doc.id] = doc.to_dict()
        except Exception as fs_err:
            print("Firestore query note (optional collection):", fs_err)

        # 2. Fetch all registered users from Firebase Authentication directly
        page = auth.list_users()
        for user in page.iterate_all():
            profile = firestore_users.get(user.uid, {})
            
            # Format and prioritize Firestore profile details, fallback to Auth metadata
            users_list.append({
                "uid": user.uid,
                "email": user.email or "N/A",
                "name": profile.get("full_name") or user.display_name or (user.email.split('@')[0] if user.email else "Student"),
                "stream": profile.get("stream", "General Track"),
                "academicLevel": profile.get("academicLevel", "Standard"),
                "testCompleted": profile.get("testCompleted", False),
                "createdAt": profile.get("createdAt") or (user.user_metadata.creation_timestamp if user.user_metadata else "Recent")
            })

        total_students = len(users_list)
        completed_tests = sum(1 for u in users_list if u.get("testCompleted"))

        return jsonify({
            "status": "success",
            "stats": {
                "total_students": total_students,
                "assessment_questions": 0,
                "assessments_completed": completed_tests,
                "curated_careers": 0
            },
            "users": users_list
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/admin/questions')
@admin_required
def admin_questions():
    return render_template('admin/questions.html')

@app.route('/admin/users')
@admin_required
def admin_users():
    return render_template('admin/users.html')

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