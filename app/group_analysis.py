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
import numpy as np
import matplotlib.pyplot as plt

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
    # - OUTPUT - To JSON
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
def generate_participation_matrix(session):
    list=[]

    users = os.listdir("session_data/" + session)
    users = [user for user in users if 'user' in user]
  
    basepath = os.path.dirname(__file__)

    i = 1
    for e in users:
        filepath = os.path.abspath(os.path.join(basepath, "session_data/" + session + "/" + e + "/formatted-alignment.json"))   
        list = read_list_formattedalignment(filepath, i, list)
        i = i + 1

    matrix=iterate_matrix(sorted(list),3)

    #TODO - Write out matrix to JSON
    pp.pprint(matrix)

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
def smooth_list(list,iteration):
    temp=[]
    out=[]
    for items in list:
        temp.append(items[1])
    for i in range(iteration,len(temp)-iteration):
        if(temp[i-iteration]==temp[i+iteration]):
            temp[i]=temp[i-iteration]
    temp[0]=temp[1]
    temp[len(temp)-1]=temp[len(temp)-2]
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
def generate_smile_counts(session):
    result = smile_count(3,session)
    time=[]
    for i in np.arange(1,len(result)+1,1):
        time.append(i)
    plt.plot(time,result.values())
    plt.show()

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
    #generate_participation_matrix(session_name)
    #generate_smile_counts(session_name) TO DO - Not sure how well this one is working yet