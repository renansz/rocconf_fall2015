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
        if(time_stamp['word'] !='sp'):
            list.append((time_stamp['start_time_secs'], number_user))
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
        temp=smooth_list(temp,1)

        if(temp==list):
            break
        list=temp
    return temp

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




if __name__=='__main__':
    
#    read in file
    list=[]
    for i in range(1,4):
        list=read_list('/Users/yuewang/Desktop/rocconf_fall2015/app/session_data/multi_test_2/user_'+ str(i) +'/word-prosody.json',i,list)
#    smooth data to remove noise 
    list=smooth_call(sorted(list))
    pp.pprint(list)
#    calculate transition matrix
    matrix=transition_matrix(3,list)
    pp.pprint(matrix)




























    