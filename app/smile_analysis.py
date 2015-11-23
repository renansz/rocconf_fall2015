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


def read_list_smile(filepath):
    list=[]
    file=open(filepath,"r+")
    loaded_data=json.loads(file.read())
    
    for time_stamp in loaded_data['features']:
        list.append((time_stamp['time_millisec'],time_stamp['smile_cubicSpline']))
    return list


def read_list_average(filepath):
    file=open(filepath,"r+")
    loaded_data=json.loads(file.read())
    print (loaded_data['features'][0])['averageSmileIntensity_100']
    return (loaded_data['features'][0])['averageSmileIntensity_100']


def smile_count(user_number):
    count={}
    for i in range(1,user_number+1):
        data=read_list_smile('/Users/yuewang/Desktop/rocconf_fall2015/app/session_data/multi_test_2/user_'+ str(i) +'/audio-video-features.json')
        ave=read_list_average('/Users/yuewang/Desktop/rocconf_fall2015/app/session_data/multi_test_2/user_'+ str(i) +'/average-features.json')
        
        for j in range(0,len(data)):
            if(count.has_key(data[j][0])):
                if(data[j][1]>ave):
                    count[data[j][0]]=count[data[j][0]]+1
            else:
                if(data[j][1]>ave):
                    count[data[j][0]]=1
                else:
                    count[data[j][0]]=0
    pp.pprint(count)
    return count

if __name__=='__main__':

    result=smile_count(3)
    time=[]
    for i in np.arange(1,len(result)+1,1):
        time.append(i)
    plt.plot(time,result.values())
    plt.show()





