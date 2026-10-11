import firebase_admin
from firebase_admin import credentials, auth

# Connects Flask to your Firebase project using the key
if not firebase_admin._apps:
    try:
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
        print("🚀 Firebase Admin SDK initialized successfully!")
    except Exception as e:
        print(f"❌ Error initializing Firebase Admin SDK: {e}")
