# Session analysis script for the RocConf HCI 412 Group.
#
# Ye (Eric) Wang, Yue (Bella) Wang, Jeffery White
#
# TO RUN: Set the session folder name in the main function and let it rip.
#
# Participation Analysis - Measuring how many times a user spoke, for how long, and for how much
#   of the total session time they occupied.
#
# Rapport Analysis - Attempting to find more than one persons smile at the same time. This feature
#   was the least worked on for this project and still could use some bug fixing.
#
# Sentiment Analysis - Analysis of the sentiment (positive/negative) of words spoken on a per
#   user basis, single words and their counts and a three word window analysis over time
#   to attempt to capture 'context'.
#

import os
import json
import pprint
import numpy as np
import matplotlib.pyplot as plt
from textblob import TextBlob

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

    print "Generating participation rates..."

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
    
    blocks = {}
    for e in users:
        blocks[e] = []

    c_user = transition[0][0]
    c_user_start = 0

    for e in transition:
        if e[0] != c_user:
            blocks[c_user].append({"start": round(c_user_start,1), "end":round(e[1],1), "duration": round((e[1] - c_user_start),1)})
            c_user = e[0]
            c_user_start = e[1]

    total_duration = 0
    averages = {}

    for e in users:
        user_blocks = blocks[e]
        for k in user_blocks:
            total_duration = total_duration + k['duration']

    for e in users:
        duration = 0
        user_blocks = blocks[e]
        for k in user_blocks:
            duration = duration + k['duration']

        try:
            p_spk = round((duration / total_duration) * 100 , 2)
        except:
            p_spk = 0

        try:
            p_nospeak = round(100 - ((duration / total_duration) * 100) , 2)
        except:
            p_nospeak = 100

        try:
            avg_speak = round(duration / counter_dict[e], 2)
        except:
            avg_speak = 0

        averages[e] = {"p_spk": p_spk, 
                       "p_nospeak": p_nospeak, 
                       "avg_speak": avg_speak}


    data_to_write = {}
    data_to_write['spk_counts'] = counter_dict
    data_to_write['spk_blocks'] = blocks
    data_to_write['spk_avg'] = averages

    filepath_final = os.path.abspath(os.path.join(basepath, "session_data/" + session + "/p_rates.json"))

    with open(filepath_final,'w') as final_file:
        final_file.write(json.dumps(data_to_write))

    print "Participation rates generated..."

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
def generate_participation_matrix(session):
    print "Generating participation matrix..."

    list=[]

    users = os.listdir("session_data/" + session)
    users = [user for user in users if 'user' in user]
  
    basepath = os.path.dirname(__file__)

    i = 1
    for e in users:
        filepath = os.path.abspath(os.path.join(basepath, "session_data/" + session + "/" + e + "/formatted-alignment.json"))   
        list = read_list_formattedalignment(filepath, i, list)
        i = i + 1

    matrix = iterate_matrix(sorted(list),len(users))

    data_to_write = {}

    data_to_write['matrix'] = matrix.tolist()

    filepath_final = os.path.abspath(os.path.join(basepath, "session_data/" + session + "/p_matrix.json"))

    with open(filepath_final,'w') as final_file:
        final_file.write(json.dumps(data_to_write))

    print "Participation matrix generated..."

def read_matrix(filepath):

    file=open(filepath)
    featuredict=json.loads(file.read())
    data=np.zeros((len(featuredict['features']),len(featuredict['features'][0])))
    i=0
    for time_stamp in featuredict['features']:
        
        data[i,:]=time_stamp.values()
        i+=1;
    return data

def read_list_formattedalignment(filepath,number_user,list):
    
    file=open(filepath,"r+")
    loaded_data=json.loads(file.read())
    
    for time_stamp in loaded_data['word']:
        if(time_stamp['speech'] !='sp'):
            list.append((time_stamp['startTime'], number_user))
    return list


#smooth method
def smooth_list(list, iteration):
    temp=[]
    out=[]
    for items in list:
        temp.append(items[1])
    for i in range(iteration, len(temp) - iteration):
        if(temp[i-iteration] == temp[i+iteration]):
            temp[i] = temp[i-iteration]
    temp[0] = temp[1]
    temp[len(temp)-1] = temp[len(temp)-2]
    for j in range(0,len(list)):
        out.append((list[j][0],temp[j]))
    return out

#iterate smooth method
def smooth_call(list):
    
    while 1:
        
        list=smooth_list(list,1)
        list=smooth_list(list,2)

        temp=smooth_list(list,1)
        temp=smooth_list(temp,2)

        if(temp==list):
            break
        list=temp

    return temp

# remove duplicate start-time, further smooth noisy data
def remove_duplicate(list):
    out=[]
    for i in range(0,len(list)-1):
        if(list[i][0]!=list[i+1][0]):
            out.append((list[i][0],list[i][1]))
    j=3
    while j<len(out)-4:
#        print out[j-3][1], out[j][1],out[j+3][1]
        if(out[j][1]!=out[j-3][1] and out[j][1]!=out[j+3][1]):
            out.pop(j)
        j=j+1

    return out

# iterate smoothing methods to get stablized matrix
def iterate_matrix(list,number_user):
    while 1:
    
        list=smooth_call(list)
        list=remove_duplicate(list)
        list=smooth_call(list)
        matrix_first=transition_matrix(number_user,list)

        list=smooth_call(list)
        list=remove_duplicate(list)
        list=smooth_call(list)
        matrix_second=transition_matrix(number_user,list)

        if(matrix_first.all()==matrix_second.all()):
            break    
    return matrix_second

#calculate transition matrix
def transition_matrix(number_user,list):
    temp=[]
    out=np.zeros((number_user, number_user))
    for i in range(1,number_user+1):
        for j in range(0, len(list)-1):
            if(list[j][1]==i):
                temp.append(list[j+1][1]-list[j][1]+i)
        
        for index in temp:
            if(index!=i):
                out[i-1][index-1]=out[i-1][index-1]+1
        temp=[]
    return out

#=======================================================
# Function to generate sentiment hits over the time
# of the session.
#=======================================================
def generate_sentiment_time(session):

    users = os.listdir("session_data/" + session)
    users = [user for user in users if 'user' in user]

    for e in users:
        print "Generating sentiment by time for " + e + "..."
        basepath = os.path.dirname(__file__)
        filepath = os.path.abspath(os.path.join(basepath, "session_data/" + session + "/" + e + "/formatted-alignment.json"))

        data = sliding_window(filepath,3)

        list_data = []
        for j in data:
            blob = TextBlob(j['text'])
            sentiment = blob.sentiment

            dict = {"time":j['time'], "sentiment": sentiment[0]}
            list_data.append(dict)

        filepath_2 = os.path.abspath(os.path.join(basepath, "session_data/" + session + "/" + e + "/average-features.json"))
        with open(filepath_2,"r+") as avg:
            loaded_data = json.loads(avg.read())
            features = loaded_data['features']
            max_time = round((features[0]['totalDuration_Milliseconds'] / 1000),1)

        data_to_write = {"time_data": smooth_time_data(max_time, list_data)}

        filepath_final = os.path.abspath(os.path.join(basepath, "session_data/" + session + "/" + e + "/sentiment-by-time.json"))

        with open(filepath_final,'w') as final_file:
            final_file.write(json.dumps(data_to_write))

        print "Sentiment by time for " + e + " generated..."

# Fill in the gaps in the time series data for better display in amCharts
def smooth_time_data(max, data):
    final_data = []

    timer = 0.0
    for e in data:
        while(timer < e['time']):
            timer = timer + .5
            final_data.append({"sentiment":0.0, "time": round(timer,1)})

        rounded = {"sentiment":round(e['sentiment'],2), "time": round(e['time'],1)}
        timer = timer + .5
        final_data.append(rounded)

    while(timer < max):
        timer = timer + .5
        final_data.append({"sentiment":0.0, "time": round(timer,1)})

    return final_data

def sliding_window(filepath, length):
    chunks = []
    buffer = []
    words = None

    with open(filepath,"r+") as the_file:
        loaded_data = json.loads(the_file.read())
        words = loaded_data['word']

    # Each time we add in a word to the buffer, we want to check the last 'length' of words
    for e in words:
        if(e['speech'] != 'sp'):
            buffer.append(e['speech'])

            chunk = buffer[-length:]
            chunk_string = ""
            for k in chunk:
                chunk_string += " " + k
            chunks.append({"text":chunk_string, "time": e['endTime']})

    return chunks

#=======================================================
# Function to generate lists of words and counts that
# have sentiment for each user. 
# (Non neutrals for the progress# bar display.)
#=======================================================
def generate_sentiment_lists(session):
    users = os.listdir("session_data/" + session)
    users = [user for user in users if 'user' in user]

    for e in users:
        print "Generating sentiment list for " + e + "..."

        data_to_write = {}

        negatives = []
        positives = []

        basepath = os.path.dirname(__file__)
        filepath = os.path.abspath(os.path.join(basepath, "session_data/" + session + "/" + e + "/word-tag-count.json"))

        with open(filepath,"r+") as the_file:
            loaded_data = json.loads(the_file.read())
            counts = loaded_data['counts']

            for k in counts:
                blob = TextBlob(k['text'])
                sentiment = blob.sentiment

                if sentiment[0] > 0.25:
                    positives.append({"text":k['text'], "count":k['count'], "value":sentiment[0]})
                elif sentiment[0] < -0.25:
                    negatives.append({"text":k['text'], "count":k['count'], "value":sentiment[0]})


        data_to_write['pos'] = positives
        data_to_write['neg'] = negatives

        filepath_final = os.path.abspath(os.path.join(basepath, "session_data/" + session + "/" + e + "/sentiment-counts.json"))

        with open(filepath_final,'w') as final_file:
            final_file.write(json.dumps(data_to_write))

        print "Sentiment lists for " + e + " generated..."

#=======================================================
# Function to generate the aggregate word counts
# for the entire session.
#=======================================================
def generate_word_counts(session):
    print "Generating word counts..."
    session_counts = []

    users = os.listdir("session_data/" + session)
    users = [user for user in users if 'user' in user]

    for e in users:
        basepath = os.path.dirname(__file__)
        filepath = os.path.abspath(os.path.join(basepath, "session_data/" + session + "/" + e + "/word-tag-count.json"))
        session_counts.append(process_user_freq(filepath))
   
    processed_counts = aggregate_freq_words(session_counts)

    list_data = []

    for e,v in processed_counts.iteritems():
        dict = {"text": e, "counts": v}
        list_data.append(dict)

    data_to_write = {"counts": list_data}

    filepath_final = os.path.abspath(os.path.join(basepath, "session_data/" + session + "/session_word_counts.json"))

    with open(filepath_final,'w') as final_file:
        final_file.write(json.dumps(data_to_write))

    print "Word counts generated..."

def process_user_freq(filepath):
    formatted_data = []

    stopwords = ["the","be","to","of","and","a","in","that",
                 "have","it","for","not","on","with","he",
                 "as","do","at","this","but","his","by",
                 "from","they","we","say","her","she","or",
                 "an","will","my","all","would","there","their",
                 "what","so","up","out","if","about","who","get",
                 "which","go","me","when","make","can",
                 "time","just","him","know","take","into","your",
                 "some","could","them","see","other","than",
                 "then","now","only","come","its","over",
                 "think","also","back","after","use","how",
                 "our","first","well","way","even","new",
                 "because","any","these","give","most",
                 "is","are","was","does","been","where","why",
                 "am","being","thing","really","something","however",
                 "said","got","such","it's","don't","that's","I","You",
                 "what's","did","too","gotten"]

    with open(filepath,"r+") as the_file:
        loaded_data = json.loads(the_file.read())
        counts = loaded_data['counts']

        for e in counts:
            if str.lower(str(e['text'])) not in stopwords:
                formatted_data.append(e)

    return formatted_data

def aggregate_freq_words(list):
    final_data = {}

    for e in list:
        for j in e:
            if final_data.has_key(j['text']):
                final_data[j['text']] += final_data[j['text']] + j['count']
            else:
                final_data[j['text']] = j['count']

    return final_data

#=======================================================
# Function to generate the coincident smile counts
#=======================================================
def generate_smile_counts(session):

    print "Generating smile counts..."

    users = os.listdir("session_data/" + session)
    users = [user for user in users if 'user' in user]

    result = smile_count(len(users),session)

    data_to_write = {}

    for i in range(2,len(users)):
        data_to_write[i] = 0

    c_found = False
    c_found_value = 0

    for e,v in result.iteritems():
        if(v >= 2 and not c_found):
            data_to_write[v] = data_to_write[v] + 1
            c_found_value = v
            c_found = True
        elif (v < c_found_value):
            c_found = False
            c_found_value = 0

    basepath = os.path.dirname(__file__)
    filepath_final = os.path.abspath(os.path.join(basepath, "session_data/" + session + "/smile_counts.json"))

    with open(filepath_final,'w') as final_file:
        final_file.write(json.dumps(data_to_write))

    print "Smile counts generated..."

def read_matrix(filepath):
    
    file=open(filepath)
    featuredict=json.loads(file.read())
    data=np.zeros((len(featuredict['features']),len(featuredict['features'][0])))
    i=0
    for time_stamp in featuredict['features']:
        
        data[i,:]=time_stamp.values()
        i+=1;
    return data


def read_list_smile(filepath):
    list = []
    file = open(filepath,"r+")
    loaded_data = json.loads(file.read())
    
    for time_stamp in loaded_data['features']:
        list.append((time_stamp['time_millisec'],time_stamp['smile_cubicSpline']))
    return list


def read_list_average(filepath):
    file=open(filepath,"r+")
    loaded_data=json.loads(file.read())
    return (loaded_data['features'][0])['averageSmileIntensity_100']


def smile_count(user_number, session):
    count={}
    for i in range(1, user_number+1):
        basepath = os.path.dirname(__file__)
        filepath1 = os.path.abspath(os.path.join(basepath, "session_data/" + session + "/user_" + str(i) + "/audio-video-features.json"))
        filepath2 = os.path.abspath(os.path.join(basepath, "session_data/" + session + "/user_" + str(i) + "/average-features.json"))

        data = read_list_smile(filepath1)
        ave = read_list_average(filepath2)
        
        for j in range(0,len(data)):
            if(count.has_key(data[j][0])):
                if(data[j][1]>ave):
                    count[data[j][0]]=count[data[j][0]]+1
            else:
                if(data[j][1]>ave):
                    count[data[j][0]]=1
                else:
                    count[data[j][0]]=0
    return count

#=======================================================
# Main Function
#=======================================================
if __name__ == "__main__":
    session_name = "multi_test_4"

    generate_participation_matrix(session_name)
    generate_sentiment_time(session_name)
    generate_word_counts(session_name)
    generate_sentiment_lists(session_name)
    generate_participation_rates(session_name)
    #generate_smile_counts(session_name)