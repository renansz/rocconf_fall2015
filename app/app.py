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

#=======================================================
# AJAX Handler for getting a list of sessions
# stored on this server.
#======================================================= 
@app.route("/sessions")
def return_sessions():

    list_files ={'files': os.listdir("session_data")}

    #creating response object
    response = jsonify(list_files) 
    response.status_code = 200 

    return response

#=======================================================
# AJAX Handler for getting sentiment data
#======================================================= 
@app.route("/sentiment", methods=['GET'])
def return_sentiment():

    directory = request.args.get('session')

    basepath = os.path.dirname(__file__)
    users = os.listdir("session_data/" + directory)

    time_data = {}

    for e in users:
        try:
            filepath = os.path.abspath(os.path.join(basepath, "session_data/" + directory + "/" + e + "/sentiment-by-time.json"))
            with open(filepath,"r+") as the_file:
                loaded_data = json.loads(the_file.read())
                time_data[e] = loaded_data['time_data']
        except Exception as exception:
            print exception
    
    filepath = os.path.abspath(os.path.join(basepath, "session_data/" + directory + "/sentiment_counts.json"))
    with open(filepath,"r+") as the_file:
        loaded_data = json.loads(the_file.read())

    data = {}
    data['counts'] = loaded_data['counts']
    data['time'] = time_data

    #creating response object
    response = jsonify(data) 
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
