# Sentiment Analysis of Session Data using the TextBlog Library - which extends the NLTK to a bunch of new stuff.
# - For the RocConf HCI 412 Project - Jeffery White - 11/15/2015

# Formatting For Word Tag Counts:
# - For the users word tag count, currently -> {"text":"ABOUT","count":1}  so change to {"text":"ABOUT","count":1,"polarity": calculated}
# - For the overall sessions, we'll aggregate over all users on the call, then update with the polarity measurement.
# 
# Formatting on the Sentiment over time for the conversation.
# - formatted-alignment yields elements like {"endTime": 98.7761904762, "speech": "sp", "startTime": 97.9181405896} in the "word" index.
# - So the idea here is to parse this with a 3 word window (and also possibly a 5 word window) to get at:
# - {"polarity": VALUE, "time": VALUE } where "time" is the end of the current window.
#
# Overall Session Statistics
# - For the session in total we can take a look at the 'range' in sentiment for the entire group. So can say get at a 'peak' sentiment
#   in both the positive and negative direction for all users on the call. 
# - Maybe also 'how much time' did the people on the call stay above say .5 and below say -.5.

import json
import pprint
import os.path

from textblob import TextBlob
from textblob.sentiments import NaiveBayesAnalyzer

#pretty printer config
pp = pprint.PrettyPrinter(indent=2)

#=======================================================
# Loading frequent word counts from file and removal
# of stopwords.
#=======================================================
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
                 "said","got","such","it's","don't","that's",
                 "what's","did","too","gotten"]

    with open(filepath,"r+") as the_file:
        loaded_data = json.loads(the_file.read())
        counts = loaded_data['counts']

        for e in counts:
            if str.lower(str(e['text'])) not in stopwords:
                formatted_data.append(e)

    return formatted_data

#=======================================================
# Aggregation of Users Frequent Words into one
# set of information for the entire session.
#=======================================================
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
# Perform a read of a sliding window across a users
# words spoken.
#=======================================================
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
# Main Function
#=======================================================
if __name__ == "__main__":

    #-------------------------------------------------------------------------------------------------------------
    # Getting Sentiment for the word counts for the entire session and write to file
    #-------------------------------------------------------------------------------------------------------------
    basepath = os.path.dirname(__file__)
    filepath_1 = os.path.abspath(os.path.join(basepath, "session_data/multi_test_2/user_1/word-tag-count.json"))
    filepath_2 = os.path.abspath(os.path.join(basepath, "session_data/multi_test_2/user_2/word-tag-count.json"))
    filepath_3 = os.path.abspath(os.path.join(basepath, "session_data/multi_test_2/user_3/word-tag-count.json"))

    session_counts = []
    session_counts.append(process_user_freq(filepath_1))
    session_counts.append(process_user_freq(filepath_2))
    session_counts.append(process_user_freq(filepath_3))
   
    processed_counts = aggregate_freq_words(session_counts)

    list_data = []

    for e,v in processed_counts.iteritems():
        blob = TextBlob(e)
        sentiment = blob.sentiment

        dict = {"text": e, "counts": v, "sentiment": sentiment[0]}
        list_data.append(dict)

    data_to_write = {"counts": list_data}

    filepath_final = os.path.abspath(os.path.join(basepath, "session_data/multi_test_2/sentiment_counts.json"))

    with open(filepath_final,'w') as final_file:
        final_file.write(pp.pformat(data_to_write))

    #-------------------------------------------------------------------------------------------------------------
    # Obtaining a graph of sentiment for each users and depositing that into their directory
    #-------------------------------------------------------------------------------------------------------------
    '''
    basepath = os.path.dirname(__file__)
    filepath_1 = os.path.abspath(os.path.join(basepath, "session_data/multi_test_2/user_3/formatted-alignment.json"))

    data = sliding_window(filepath_1,3)

    list_data = []
    for e in data:
        blob = TextBlob(e['text'])
        sentiment = blob.sentiment

        dict = {"time":e['time'], "sentiment": sentiment[0]}
        list_data.append(dict)

    data_to_write = {"time_data":list_data}

    filepath_final = os.path.abspath(os.path.join(basepath, "session_data/multi_test_2/user_3/sentiment-by-time.json"))

    with open(filepath_final,'w') as final_file:
        final_file.write(pp.pformat(data_to_write))
    '''




