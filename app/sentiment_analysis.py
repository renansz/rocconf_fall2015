# Simple sentiment classification using the NLTK toolkit
# The below isn't a full citation yet, but just notes on where I'm getting this information from
# Based on a series of tutorials from -> http://streamhacker.com/2010/05/10/text-classification-sentiment-analysis-naive-bayes-classifier/
# Utilized information from -> http://text-processing.com/demo/sentiment/

# Now moving on to trying out the TextBlob library directory (which also bases itself off of NLTK)
# Possibly also doing an ensemble method here, since there's also a nice web based utility I want to try out.
# NLTK not so great here, but TextBlog really nice with two types of sentiment analysis.

# Formatting To Use:
# - For the users word tag count, currently -> {"text":"ABOUT","count":1}  so change to {"text":"ABOUT","count":1,"polarity": calculated}
# - For the overall sessions, we'll aggregate over all users on the call, then update with the polarity measurement.
# 
# Formatting on the Sentiment over time for the conversation.
# - formatted-alignment yields elements like {"endTime": 98.7761904762, "speech": "sp", "startTime": 97.9181405896} in the "words" index.
# - So the idea here is to parse this with a 3 word window (and also possibly a 5 word window) to get at:
# - {"polarity": VALUE, "time": VALUE } where "time" is the end of the current window.
# - and if necessary can break this out into a 'polarity per second' so {"time": second, "polarity": value }

import json
import pprint
import os.path

import nltk.classify.util
from nltk.classify import NaiveBayesClassifier
from nltk.corpus import movie_reviews

from textblob import TextBlob
from textblob.sentiments import NaiveBayesAnalyzer

#pretty printer config
pp = pprint.PrettyPrinter(indent=2)

classifier = None

#=======================================================
# Bag of words for the classifier
#=======================================================
def word_feats(words):
    return dict([(word, True) for word in words])

#=======================================================
# Training a classifier off of the movie review corpus
#=======================================================
def setup_classifier():
    negids = movie_reviews.fileids('neg')
    posids = movie_reviews.fileids('pos')
 
    negfeats = [(word_feats(movie_reviews.words(fileids=[f])), 'neg') for f in negids]
    posfeats = [(word_feats(movie_reviews.words(fileids=[f])), 'pos') for f in posids]

    # We'll train on the entire corpus instead of just parts of it
    trainfeats = negfeats + posfeats

    nb_classifier = NaiveBayesClassifier.train(trainfeats)
    return nb_classifier


#=======================================================
# Below example shows how to train a NB classifier
# on the NLTK and test it on the same corpus for
# accuracy.
#=======================================================
def classifier_test():
    negids = movie_reviews.fileids('neg')
    posids = movie_reviews.fileids('pos')
 
    negfeats = [(word_feats(movie_reviews.words(fileids=[f])), 'neg') for f in negids]
    posfeats = [(word_feats(movie_reviews.words(fileids=[f])), 'pos') for f in posids]
 
    negcutoff = len(negfeats)*3/4
    poscutoff = len(posfeats)*3/4
 
    trainfeats = negfeats[:negcutoff] + posfeats[:poscutoff]
    testfeats = negfeats[negcutoff:] + posfeats[poscutoff:]
    print 'train on %d instances, test on %d instances' % (len(trainfeats), len(testfeats))
 
    classifier = NaiveBayesClassifier.train(trainfeats)
    
    '''
    print 'accuracy:', nltk.classify.util.accuracy(classifier, testfeats)
    classifier.show_most_informative_features()
    '''
    for i, (feats, label) in enumerate(testfeats):
        pp.pprint(feats)

#=======================================================
# Processing a single users transcript for formatting for
# the classifier. This is more of a toy example to show
# how we need to format for getting a featureset to 
# analyze.
# - word-prosody.json analysis #1
#=======================================================
def process_user(filepath):

    formatted_data = {}

    with open(filepath,"r+") as the_file:
        loaded_data = json.loads(the_file.read())

        word_data = loaded_data['features']

        for e in word_data:
            if(e['confidence'] == 1):
                formatted_data[e['word']] = False
    
    return formatted_data

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
    filepath = os.path.abspath(os.path.join(basepath, "session_data/multi_test_3/user_2/formatted-alignment.json"))

    #data = process_user_freq(filepath)

    data = sliding_window(filepath, 3)

    pp.pprint(data)
    '''
    classifier = setup_classifier()
    
    for e in data:
        results = classifier.classify(e)
        print str(e) + " Yields " + results
    '''

    '''
    print "===================== Testing on the PatternAnalysis =========================="

    for e in data:
        blob = TextBlob(e)
        print e + " Yields " + str(blob.sentiment)

    print "====================== Testing on the NB Classifier ==========================="

    for e in data:
        blob = TextBlob(e, analyzer=NaiveBayesAnalyzer())
        print e + " Yields " + str(blob.sentiment)
    '''