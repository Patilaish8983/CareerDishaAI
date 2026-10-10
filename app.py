from flask import Flask, render_template, request, redirect, url_for, session

app = Flask(__name__)
app.secret_key = 'career_disha_ai_secret_key'  # Needed for session management

@app.route('/')
def landing():
    return render_template('landing.html')

@app.route('/auth')
def auth():
    return render_template('auth.html')

@app.route('/login', methods=['POST'])
def handle_login():
    # Capture user info from form if submitted
    full_name = request.form.get('full_name', 'Student')
    email = request.form.get('email', '')
    session['user'] = {'full_name': full_name, 'email': email}
    return redirect(url_for('dashboard'))

# --- User Module Routes ---

@app.route('/user/dashboard')
def dashboard():
    return render_template('user/dashboard.html')

@app.route('/user/profile')
def profile():
    return render_template('user/profile.html')

@app.route('/user/test')
def test():
    return render_template('user/test.html')

@app.route('/user/results')
def results():
    return render_template('user/results.html')

@app.route('/user/careers')
def careers():
    return render_template('user/careers.html')

@app.route('/user/chatbot')
def chatbot():
    return render_template('user/chatbot.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('auth'))

@app.route('/')
def home():
    return render_template('landing,html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)