import json
import pprint
import os.path

#pretty printer config
pp = pprint.PrettyPrinter(indent=2)

#Some Notes - the Idea here is to create a 'round robin' of the session data
# in order to create a sort of 'meeting' out of it for development purposes

# User 1 is a 52 second session
# User 2 is a 60 second session
# User 3 is a 46 second session

# 1 second is 1000 milliseconds

#=======================================================
# Modifying the audio video features for a user
#=======================================================
def shift_audio_video_features():
    basepath = os.path.dirname(__file__)
    filepath = os.path.abspath(os.path.join(basepath, "session_data/multi_test_3/user_4/audio-video-features.json"))

    time_to_shift = 5200 + 6000 + 4600

    shift = time_to_shift / 10  # Shifting 52 seconds worth of 10 millsecond 'slots' for User 2

    data_to_write = []

    with open(filepath,"r+") as the_file:
        data_to_fix = json.loads(the_file.read())

        original_data = data_to_fix['features'] 

        i = 0
        current_time = 0
        for e in original_data:
            if(i < shift):
                data_to_write.append({'movement_cubicSpline': e['movement_cubicSpline'],
                                      'pitch_Hz': 0,
                                      'smile_cubicSpline': e['smile_cubicSpline'],
                                      'soundIntensity_DB': 0,
                                      'time_milisec': current_time})
                current_time = current_time + 10
                i = i + 1
            else:
                break;

        for e in original_data:
                data_to_write.append({'movement_cubicSpline': e['movement_cubicSpline'],
                            'pitch_Hz': e['pitch_Hz'],
                            'smile_cubicSpline': e['smile_cubicSpline'],
                            'soundIntensity_DB': e['soundIntensity_DB'],
                            'time_millisec': e['time_millisec'] + time_to_shift})  

        filepath_2 = os.path.abspath(os.path.join(basepath, "session_data/multi_test_3/user_4/audio-video-features-test.json"))
        with open(filepath_2,'w') as outfile:
            json.dump({"features": data_to_write}, outfile)
        
        #Use this to print out a JSON file a more readable format
        #pp.pprint(original_data)

#=======================================================
# Modifying the formatted alignment data for the user.
#=======================================================
def shift_formatted_alignment():
    basepath = os.path.dirname(__file__)
    filepath = os.path.abspath(os.path.join(basepath, "session_data/multi_test_3/user_4/formatted-alignment.json"))

    time_to_shift = 52 + 60 + 46

    with open(filepath,"r+") as the_file:
        data_to_fix = json.loads(the_file.read())

        original_data = data_to_fix['phone'] 
        original_words = data_to_fix['word']

        phonetics_data = []
        words_data = []
        data_to_write = {}

        for e in original_data:
            phonetics_data.append({'endTime': e['endTime'] + time_to_shift,
                              'speech': e['speech'],
                              'startTime': e['startTime'] + time_to_shift})

        for e in original_words:
            words_data.append({'endTime': e['endTime'] + time_to_shift,
                              'speech': e['speech'],
                              'startTime': e['startTime'] + time_to_shift})

            
        data_to_write['endTime'] = data_to_fix['endTime'] + time_to_shift
        data_to_write['startTime'] = data_to_fix['startTime']
        data_to_write['phone'] = phonetics_data
        data_to_write['word'] = words_data


        filepath_2 = os.path.abspath(os.path.join(basepath, "session_data/multi_test_3/user_4/formatted-alignment-test.json"))
        with open(filepath_2,'w') as outfile:
            json.dump(data_to_write, outfile)
  
        #Use this to print out a JSON file a more readable format
        #pp.pprint(data_to_fix)

#=======================================================
# Modifying the word prosody files.
#=======================================================
def shift_word_prosody():
    basepath = os.path.dirname(__file__)
    filepath = os.path.abspath(os.path.join(basepath, "session_data/multi_test_3/user_4/word-prosody.json"))

    time_to_shift = 52 + 60 + 46

    with open(filepath,"r+") as the_file:
        data_to_fix = json.loads(the_file.read())

        original_data = data_to_fix['features'] 

        prosody_data = []

        prosody_data.append({"word":"sp", "start_time_secs":0, "end_time_secs":time_to_shift, "soundIntensity_DB":0, "pitch_Hz":0, "confidence":0})

        data_to_write = {}

        for e in original_data:
            prosody_data.append({'word': e['word'],
                                 'start_time_secs': e['start_time_secs'] + time_to_shift,
                                 'end_time_secs': e['end_time_secs'] + time_to_shift,
                                 'soundIntensity_DB': e['soundIntensity_DB'],
                                 'pitch_Hz': e['pitch_Hz'],
                                 'confidence': e['confidence']})

        data_to_write['features'] = prosody_data

        filepath_2 = os.path.abspath(os.path.join(basepath, "session_data/multi_test_3/user_4/word-prosody-test.json"))
        with open(filepath_2,'w') as outfile:
            json.dump(data_to_write, outfile)
  
        #Use this to print out a JSON file a more readable format
        #pp.pprint(data_to_fix)

#=======================================================
# Simple output test.
#=======================================================
def print_test():
    basepath = os.path.dirname(__file__)
    filepath = os.path.abspath(os.path.join(basepath, "session_data/multi_test_3/user_4/word-prosody.json"))

    with open(filepath,"r+") as the_file:
        data_to_fix = json.loads(the_file.read())
  
        #Use this to print out a JSON file a more readable format
        filepath_2 = os.path.abspath(os.path.join(basepath, "session_data/multi_test_3/user_4/word-prosody-test.json"))
        with open(filepath_2,'w') as outfile:
            outfile.write(pp.pformat(data_to_fix['features']))

#=======================================================
# Start the web service on the local host
#=======================================================
if __name__ == "__main__":
    print_test()