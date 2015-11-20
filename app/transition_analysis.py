import json
import numpy as np
import os
import matplotlib.pyplot as plt
import pprint

pp = pprint.PrettyPrinter(indent=2)


def read_matrix(filepath):

    file=open(filepath)
    featuredict=json.loads(file.read())
    data=np.zeros((len(featuredict['features']),len(featuredict['features'][0])))
    i=0
    for time_stamp in featuredict['features']:
        
        data[i,:]=time_stamp.values()
        i+=1;
    return data

#read session_data, label user
def read_list(filepath,number_user,list):
    
    file=open(filepath,"r+")
    loaded_data=json.loads(file.read())

    for time_stamp in loaded_data['features']:
        if time_stamp['pitch_Hz']>0:
            list.append((time_stamp['start_time_secs'],number_user))
    return list

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
                out[i-1][index-1]=np.sum(index/index)
        temp=[]
    return out




if __name__=='__main__':
    
    list=[]
    for i in range(1,5):
        list=read_list('/Users/yuewang/Desktop/rocconf_fall2015/app/session_data/multi_test_3/user_'+ str(i) +'/word-prosody.json',i,list)
    list=sorted(list)
    pp.pprint(list)
    matrix=transition_matrix(4,list)
    pp.pprint(matrix)







    