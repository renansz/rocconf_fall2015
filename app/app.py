#!/usr/bin/env python
from flask import Flask, session, Response, jsonify
from flask_bootstrap import Bootstrap
from flask import render_template
from flask import request
from pymongo import MongoClient

import re
import json

import pprint

#pretty printer config
pp = pprint.PrettyPrinter(indent=2)

app = Flask(__name__)
app.secret_key = 'abc'
Bootstrap(app)
DEBUG = True

# Initialize the database connection
DB_HOST = 'localhost'
DB_PORT = 27017
db_client = MongoClient(DB_HOST,DB_PORT)

# Grab the database and all of the session keys
#db = db_client['roc_conf']
#session_key = db['annotations'].find().sort('dt',-1)

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
    app.run(host='0.0.0.0',debug=True,port=5000)
