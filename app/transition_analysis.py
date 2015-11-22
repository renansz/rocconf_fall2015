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

#read session_data from word-prosody.json, label user
def read_list_wordprosody(filepath,number_user,list):
    
    file=open(filepath,"r+")
    loaded_data=json.loads(file.read())

    for time_stamp in loaded_data['features']:
        if(time_stamp['word'] !='sp'):
            list.append((time_stamp['start_time_secs'], number_user))
    return list

#read session_data from formatted-alignment.json, label user

def read_list_formattedalignment(filepath,number_user,list):
    
    file=open(filepath,"r+")
    loaded_data=json.loads(file.read())
    
    for time_stamp in loaded_data['phone']:
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
    pp.pprint(list)
    
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




if __name__=='__main__':
    

    list=[]
    for i in range(1,4):
        list=read_list_wordprosody('/Users/yuewang/Desktop/rocconf_fall2015/app/session_data/multi_test_2/user_'+ str(i) +'/word-prosody.json',i,list)

    matrix=iterate_matrix(sorted(list),3)
    pp.pprint(matrix)


    list=[]
    for i in range(1,4):
        list=read_list_formattedalignment('/Users/yuewang/Desktop/rocconf_fall2015/app/session_data/multi_test_2/user_'+ str(i) +'/formatted-alignment.json',i,list)

    matrix=iterate_matrix(sorted(list),3)
    pp.pprint(matrix)



























    