import os

from dotenv import load_dotenv

from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room

app_folder = os.path.dirname(os.path.abspath(__file__))  # adjust as appropriate
load_dotenv(os.path.join(app_folder, '.env'))

app = Flask(__name__, static_url_path='/static')
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

hipster_channels = {'help':[]}

def serialize_message(name, timestamp, content):
    message = {}
    message['username'] = name
    message['time'] = timestamp
    message['content'] = content
    return message


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


@app.route("/channels")
def get_all_channels():
    return jsonify(list(hipster_channels.keys()))


@socketio.on("submit channel")
def submit_channel(data):
    name = data["name"]
    if(name not in hipster_channels):
        hipster_channels[name]=[]
    join_room(data['name'])
    emit("announce channel", data, broadcast=True, include_self=False)


@socketio.on("submit message")
def submit_message(data):
    room=data['room']
    channel = hipster_channels[room]
    if (len(channel) == 10):
        channel.pop(0)
    new_message=serialize_message(data['username'],data['time'],data['content'])
    channel.append(new_message)
    emit("announce message", data, broadcast=True, include_self=False,room=room)


@socketio.on("get channel messages")
def get_channel_updates(data):
    channel_name = data['name']
    if (channel_name in hipster_channels):
        latest_messages = hipster_channels[channel_name]
    emit("announce channel updates", latest_messages)
