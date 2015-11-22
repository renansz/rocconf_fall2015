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

    try:
        filepath = os.path.abspath(os.path.join(basepath, "session_data/" + session + "/sentiment_counts.json"))
        with open(filepath,"r+") as the_file:
            loaded_data = json.loads(the_file.read())
            data = loaded_data['counts']
    except Exception as err:
        print 'error in load_sentiment_counts'
        print err

    return data

#-------------------------------------------------------
# Loading Time on the Floor
#-------------------------------------------------------
def load_percentages(session):
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

                data[e] = [{"x":1, "speak": p_speaking, "rem": 100 - p_speaking }]

                length = length + 1
        except Exception as err:
            print 'error in load_percentages'
            print err

    data['length'] = length

    return data

#-------------------------------------------------------
# Load Pariticipation Matrix
#-------------------------------------------------------
def load_matrix():
    data = {}

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
    session_data['sentiment_counts'] = load_sentiment_counts(directory)
    session_data['p_percentages'] = load_percentages(directory)
    
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
