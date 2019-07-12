import os

from dotenv import load_dotenv

from flask import Flask, render_template
from flask_socketio import SocketIO, emit


app_folder = os.path.dirname(os.path.abspath(__file__)) # adjust as appropriate
load_dotenv(os.path.join(app_folder, '.env'))

app = Flask(__name__, static_url_path='/static')
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

@app.errorhandler(500)
def page_not_found(e):
    # note that we set the 404 status explicitly
    return render_template('500.html'), 500

@app.errorhandler(404)
def page_not_found(e):
    # note that we set the 404 status explicitly
    return render_template('404.html'), 404

@app.route("/")
def index():
    return render_template('index.html')
