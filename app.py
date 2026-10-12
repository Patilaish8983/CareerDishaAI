import os
from flask import Flask, request, render_template, jsonify, session, redirect, url_for
from firebase_config import auth, db  
from google.cloud import firestore

base_dir = os.path.abspath(os.path.dirname(__file__))
template_dir = os.path.join(base_dir, 'templates')

app = Flask(__name__, template_folder=template_dir)
app.secret_key = "career_disha-Ai is a smart counselling"

# 1. Main Landing Route
@app.route('/')
def home():
    return render_template('landing.html')

# 2. Authentication Route
@app.route('/auth', methods=['GET', 'POST'])
def authentication():
    if request.method == 'POST':
        data = request.get_json()
        id_token = data.get('idToken')
        
        try:
            decoded_token = auth.verify_id_token(id_token)
            uid = decoded_token['uid']
            session['user_id'] = uid
            return jsonify({"status": "success", "uid": uid}), 200
        except Exception as e:
            return jsonify({"status": "error", "message": f"Verification failed: {str(e)}"}), 400

    return render_template('auth.html')

# 3. User Profile
@app.route('/user/profile')
def user_profile():
    if 'user_id' not in session:
        return redirect(url_for('authentication'))
    return render_template('user/profile.html')

# ==========================================
# ADMIN DASHBOARD & FIREBASE API ROUTES
# ==========================================

@app.route('/admin')
def admin_portal():
    return render_template('admin/index.html')

@app.route('/api/stats/visit', methods=['POST'])
def record_visit():
    try:
        stats_ref = db.collection('analytics').document('site_traffic')
        stats_ref.set({'total_visits': firestore.Increment(1)}, merge=True)
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/metrics', methods=['GET'])
def get_admin_metrics():
    try:
        stats_ref = db.collection('analytics').document('site_traffic').get()
        visits = stats_ref.to_dict().get('total_visits', 0) if stats_ref.exists else 0

        students_count = len(list(db.collection('users').stream()))
        questions_count = len(list(db.collection('questions').stream()))
        results_count = len(list(db.collection('results').stream()))
        careers_count = len(list(db.collection('careers').stream()))

        return jsonify({
            "total_visits": visits,
            "students_count": students_count,
            "questions_count": questions_count,
            "results_count": results_count,
            "careers_count": careers_count
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/students', methods=['GET'])
def get_admin_students():
    try:
        users_ref = db.collection('users').stream()
        users_list = [doc.to_dict() | {'id': doc.id} for doc in users_ref]
        return jsonify(users_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/results', methods=['GET'])
def api_get_results():
    try:
        results_ref = db.collection('results').stream()
        results = []
        for doc in results_ref:
            r = doc.to_dict()
            r['id'] = doc.id
            results.append(r)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/questions', methods=['GET', 'POST', 'PUT', 'DELETE'])
def api_manage_questions():
    try:
        if request.method == 'GET':
            q_ref = db.collection('questions').stream()
            questions = [doc.to_dict() | {'id': doc.id} for doc in q_ref]
            return jsonify(questions)
        
        elif request.method == 'POST':
            payload = request.json
            db.collection('questions').add(payload)
            return jsonify({"status": "success", "message": "Question added"})

        elif request.method == 'PUT':
            payload = request.json
            q_id = payload.get('id')
            if not q_id:
                return jsonify({"error": "Missing question ID"}), 400
            
            # Remove id from the body before saving to Firestore
            update_data = {k: v for k, v in payload.items() if k != 'id'}
            db.collection('questions').document(q_id).set(update_data, merge=True)
            return jsonify({"status": "success", "message": "Question updated"})
            
        elif request.method == 'DELETE':
            q_id = request.args.get('id')
            if q_id:
                db.collection('questions').document(q_id).delete()
            return jsonify({"status": "success", "message": "Question deleted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/careers', methods=['GET', 'POST', 'PUT', 'DELETE'])
def api_manage_careers():
    try:
        if request.method == 'GET':
            c_ref = db.collection('careers').stream()
            careers = [doc.to_dict() | {'id': doc.id} for doc in c_ref]
            return jsonify(careers)
        
        elif request.method == 'POST':
            payload = request.json
            db.collection('careers').add(payload)
            return jsonify({"status": "success", "message": "Career added"})

        elif request.method == 'PUT':
            payload = request.json
            c_id = payload.get('id')
            if not c_id:
                return jsonify({"error": "Missing career ID"}), 400
            
            update_data = {k: v for k, v in payload.items() if k != 'id'}
            db.collection('careers').document(c_id).set(update_data, merge=True)
            return jsonify({"status": "success", "message": "Career updated"})
            
        elif request.method == 'DELETE':
            c_id = request.args.get('id')
            if c_id:
                db.collection('careers').document(c_id).delete()
            return jsonify({"status": "success", "message": "Career deleted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)