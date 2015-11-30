#!/usr/bin/env python
from flask import Flask, session, Response, jsonify
from flask_bootstrap import Bootstrap
from flask import render_template
from flask import request

import re
import json
import os

import pprint

#pretty printer config
pp = pprint.PrettyPrinter(indent=2)

app = Flask(__name__)
app.secret_key = 'abc'
Bootstrap(app)
DEBUG = True

basepath = os.path.dirname(__file__)

#-------------------------------------------------------
# Load Audio Video Feature Data
#   - Both Smile and Loudness are in the same
#     very large file so to optimize we'll get them
#     at the same time.
#   - Second optimization here is to only load
#     this in 250ms (quarter seconds)
#     intervals (it is in 10ms base)
#-------------------------------------------------------
def load_av_data(session):
    data = {}

    users = os.listdir("session_data/" + session)
    users = [user for user in users if 'user' in user]

    smile_data = {}
    loudness_data = {}

    for e in users:
        user_smile_data = []
        user_loudness_data = []
        try:            
            filepath = os.path.abspath(os.path.join(basepath, "session_data/" + session + "/" + e + "/audio-video-features.json"))
            with open(filepath,"r+") as the_file:
                loaded_data = json.loads(the_file.read())
                data_to_process = loaded_data['features']

                for j in data_to_process:
                    if (j['time_millisec'] % 1000 == 0):
                        user_smile_data.append({"time": j['time_millisec'] / 1000, "intensity": j['smile_cubicSpline']})
                        user_loudness_data.append({"time": j['time_millisec'] / 1000, "intensity": j['soundIntensity_DB']})
            smile_data[e] = user_smile_data
            loudness_data[e] = user_loudness_data
        except Exception as err:
            print 'error in load_sentiment_time'
            print err

    data['smile'] = smile_data
    data['loudness'] = loudness_data

    return data

#-------------------------------------------------------
# Loading Sentiment Time Series
#-------------------------------------------------------
def load_sentiment_time(session):
    data = {}

    users = os.listdir("session_data/" + session)
    users = [user for user in users if 'user' in user]

    for e in users:
        try:
            filepath = os.path.abspath(os.path.join(basepath, "session_data/" + session + "/" + e + "/sentiment-by-time.json"))
            with open(filepath,"r+") as the_file:
                loaded_data = json.loads(the_file.read())
                data[e] = loaded_data['time_data']
        except Exception as err:
            print 'error in load_sentiment_time'
            print err

    return data

#-------------------------------------------------------
# Loading Sentiment Counts
#-------------------------------------------------------
def load_sentiment_counts(session):
    data = {}

    users = os.listdir("session_data/" + session)
    users = [user for user in users if 'user' in user]

    for e in users:
        try:
            filepath = os.path.abspath(os.path.join(basepath, "session_data/" + session + "/" + e + "/sentiment-counts.json"))
            with open(filepath,"r+") as the_file:
                loaded_data = json.loads(the_file.read())
                data[e] = loaded_data
        except Exception as err:
            print 'error in load_sentiment_counts'
            print err

    return data

#-------------------------------------------------------
# Loading Session Word Counts
#-------------------------------------------------------
def load_session_counts(session):
    data = {}

    try:
        filepath = os.path.abspath(os.path.join(basepath, "session_data/" + session + "/session_word_counts.json"))
        with open(filepath,"r+") as the_file:
            loaded_data = json.loads(the_file.read())
            data = loaded_data['counts']
    except Exception as err:
        print 'error in load_session_counts'
        print err

    return data

#-------------------------------------------------------
# Loading Average Features
#-------------------------------------------------------
def load_avg_features(session):
    data = {}

    users = os.listdir("session_data/" + session)
    users = [user for user in users if 'user' in user]

    length = 0

    for e in users:
        try:
            filepath = os.path.abspath(os.path.join(basepath, "session_data/" + session + "/" + e + "/average-features.json"))
            with open(filepath,"r+") as the_file:
                loaded_data = json.loads(the_file.read())
                features = loaded_data['features'][0]

                p_speaking = round((features['totalVoicedTime_Milliseconds'] / features['totalDuration_Milliseconds']) * 100, 2)

                data[e] = [{"speak": p_speaking, "rem": 100 - p_speaking, "rate": features['speakingRate_WPM']}]

                length = length + 1
        except Exception as err:
            print 'error in load_percentages'
            print err

    data['length'] = length

    return data

#-------------------------------------------------------
# Load Pariticipation Matrix
#-------------------------------------------------------
def load_matrix(session):
    data = {}

    try:
        filepath = os.path.abspath(os.path.join(basepath, "session_data/" + session + "/p_matrix.json"))
        with open(filepath,"r+") as the_file:
            loaded_data = json.loads(the_file.read())
            data = loaded_data['matrix']
    except Exception as err:
        print 'error in load_matrix'
        print err

    return data

#-------------------------------------------------------
# Load Pariticipation Metrics
#-------------------------------------------------------
def load_metrics(session):
    data = {}

    try:
        filepath = os.path.abspath(os.path.join(basepath, "session_data/" + session + "/p_rates.json"))
        with open(filepath,"r+") as the_file:
            loaded_data = json.loads(the_file.read())
            data = loaded_data
    except Exception as err:
        print 'error in load_sentiment_counts'
        print err

    return data

#-------------------------------------------------------
# Load Smile Counts
#-------------------------------------------------------
def load_smile_counts(session):
    data = {}

    try:
        filepath = os.path.abspath(os.path.join(basepath, "session_data/" + session + "/smile_counts.json"))
        with open(filepath,"r+") as the_file:
            loaded_data = json.loads(the_file.read())
            data = loaded_data
    except Exception as err:
        print 'error in load_smile_counts'
        print err

    return data

#=======================================================
# AJAX Handler for getting a list of sessions
# stored on this server. 
#   - Good for a load menu
#======================================================= 
@app.route("/sessions")
def return_sessions():

    list_files ={'files': os.listdir("session_data")}

    #creating response object
    response = jsonify(list_files) 
    response.status_code = 200 

    return response

#=======================================================
# AJAX Handler for serving data on a session to the
# website. 
#   - Once a session is selected ask for data here!
#======================================================= 
@app.route("/load_data", methods=['GET'])
def return_sentiment():

    directory = request.args.get('session')
    
    session_data = {}
    session_data['sentiment_time'] = load_sentiment_time(directory)
    session_data['session_counts'] = load_session_counts(directory)
    session_data['avg_features'] = load_avg_features(directory)
    session_data['p_matrix'] = load_matrix(directory)
    session_data['p_metrics'] = load_metrics(directory)
    session_data['smile_counts'] = load_smile_counts(directory)
    session_data['sentiment_counts'] = load_sentiment_counts(directory)

    av_data = load_av_data(directory)
    session_data['smile_time'] = av_data['smile']
    session_data['loudness_time'] = av_data['loudness']
    
    #creating response object
    response = jsonify(session_data) 
    response.status_code = 200 

    return response


#=======================================================
# Page Handler for the landing page
#======================================================= 
@app.route("/")
def main_page():
    return render_template('index.html',)

#=======================================================
# Start the web service on the local host
#=======================================================
if __name__ == "__main__":
    app.run(host='0.0.0.0',debug=True,port=5050)
