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
# XXX
#======================================================= 
@app.route("/sessions")
def return_sessions():
    list = os.listdir("session_data")
    pp.pprint(list)

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
