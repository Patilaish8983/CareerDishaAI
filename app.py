import os
from flask import Flask, request, render_template, jsonify, session, redirect, url_for
from firebase_config import auth  # Import the Firebase Auth instance your coordinator configured

# Explicitly maps the template folder path so Flask doesn't crash on nested structures
base_dir = os.path.abspath(os.path.dirname(__file__))
template_dir = os.path.join(base_dir, 'templates')

app = Flask(__name__, template_folder=template_dir)
app.secret_key = "career_disha-Ai is a smart counselling"  # Required for keeping track of logged-in sessions

# 1. Main Landing Route (Home Page Shortcut)
@app.route('/')
def home():
    return render_template('landing.html')

# 2. Route to render your HTML page and catch form data
@app.route('/auth', methods=['GET', 'POST'])
def authentication():
    if request.method == 'POST':
        data = request.get_json()
        id_token = data.get('idToken')
        
        try:
            # Verify the token received from the frontend auth.html
            decoded_token = auth.verify_id_token(id_token)
            uid = decoded_token['uid']
            
            # Store user ID in session storage to keep them logged in
            session['user_id'] = uid
            
            return jsonify({"status": "success", "uid": uid}), 200
            
        except Exception as e:
            return jsonify({"status": "error", "message": f"Verification failed: {str(e)}"}), 400

    # If it's a GET request, just display your beautiful HTML form
    return render_template('auth.html')

# 3. Add your placeholder profile view to prevent errors on successful redirection
@app.route('/user/profile')
def user_profile():
    if 'user_id' not in session:
        return redirect(url_for('authentication')) # Kick them back to login if they aren't logged in
    return render_template('user/profile.html')

# 4. CRITICAL MISSING LINK: The Active Server Runner Execution Block
if __name__ == '__main__':
    app.run(debug=True)
