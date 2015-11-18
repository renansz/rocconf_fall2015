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
# Processing of a users frequent words for running
# through the sentiment analysis.
#=======================================================
def process_user_freq(filepath):
    formatted_data = []

    with open(filepath,"r+") as the_file:
        loaded_data = json.loads(the_file.read())
        counts = loaded_data['counts']

        for e in counts:
            sample = e['text']
            formatted_data.append(sample)

    return formatted_data

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
    basepath = os.path.dirname(__file__)
    filepath = os.path.abspath(os.path.join(basepath, "session_data/multi_test_3/user_3/formatted-alignment.json"))

    data = process_user_freq(filepath)

    #data = sliding_window(filepath, 5)
    

    #pp.pprint(data)
  