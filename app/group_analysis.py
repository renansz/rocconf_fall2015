# Group analysis script for the RocConf HCI 412 Group.
#
# Ye (Eric) Wang, Yue (Bella) Wang, Jeffery White
#
# Participation Analysis
#
# Rapport Analysis
#
# Sentiment Analysis
#

import os
import json
import pprint

#pretty printer config
pp = pprint.PrettyPrinter(indent=2)

#=======================================================
# Function to generate the participation analysis
# for members on the call. This creates counts, lengths
# and the overall rate of participation.
#=======================================================
dictionary = []
transition = []
counter_dict = {}

def generate_participation_rates(session):
    global counter_dict, dictionary, transition

    users = os.listdir("session_data/" + session)
    users = [user for user in users if 'user' in user]

    basepath = os.path.dirname(__file__)

    for e in users:
        filepath = os.path.abspath(os.path.join(basepath, "session_data/" + session + "/" + e + "/formatted-alignment.json"))
        addto_sorted_list(filepath, e)
        counter_dict[e] = 0

    sorteddictionary = sorted(dictionary, key = lambda x: x[0])
    
    checker = ""
    counter = 0
    for item in sorteddictionary:
        if(counter == 0):
            checker = item[1]
            counter_dict[checker] = counter_dict[checker] + 1
            transition.append((checker, 0))
        elif(item[1] != checker):
            transition.append((item[1],item[0]))
            counter_dict[checker] = counter_dict[checker] + 1
            checker = item[1]
        counter += 1
    
    #COUNTS GOOD - TODO - Generate Length of Speaking from the transition data!
    # - Can get total time spoken by each user, and length of each speaking 'block'.
    # - Format output for possible gannt chart too.
    pp.pprint(counter_dict)

def addto_sorted_list(filepath, user):
    global dictionary

    with open(filepath,"r+") as the_file:
        loaded_data = json.loads(the_file.read())
        times = loaded_data['startTime']
        totaltime = 0
        for item in loaded_data["word"]:
            totaltime += item["endTime"] - item["startTime"]
            if (item["speech"] != "sp"):
                newtuple = (item["startTime"], user)
                dictionary.append(newtuple)

#=======================================================
# Function to generate the participation matrix for
# showing transitions during the call.
#=======================================================
def generate_participation_matrix():
    data = {}

#=======================================================
# Function to generate sentiment hits over the time
# of the session.
#=======================================================
def generate_sentiment_time():
    data = {}

#=======================================================
# Function to generate lists of words and counts that
# have sentiment. (Non neutrals for the progress
# bar display.)
#=======================================================
def generate_sentiment_lists():
    data = {}

#=======================================================
# Function to generate the aggregate word counts
# for the entire session.
#=======================================================
def generate_word_counts():
    data = {}

#=======================================================
# Function to generate the coincident smile counts
#=======================================================
def generate_smile_counts():
    data = {}

#=======================================================
# Function to generate the coincident smiles time
# series data
#=======================================================
def generate_smile_time():
    data = {}

#=======================================================
# Main Function
#=======================================================
if __name__ == "__main__":
    session_name = "multi_test_2"

    #generate_participation_rates(session_name)