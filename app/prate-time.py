import os
import json
from pprint import pprint

dictionary = []

def addto_sorted_list(filepath,user):
	with open(filepath,"r+") as the_file:
		loaded_data = json.loads(the_file.read())
		times = loaded_data['startTime']
		totaltime=0
		for item in loaded_data["word"]:
			totaltime+=item["endTime"]-item["startTime"]
			if (item["speech"] != "sp"):
				newtuple = (item["startTime"], user)
				dictionary.append(newtuple)
	

if __name__ == "__main__":
	basepath = os.path.dirname(__file__)
	filepath_1 = os.path.abspath(os.path.join(basepath, "session_data/multi_test_2/user_1/formatted-alignment.json"))
	filepath_2 = os.path.abspath(os.path.join(basepath, "session_data/multi_test_2/user_2/formatted-alignment.json"))
	filepath_3 = os.path.abspath(os.path.join(basepath, "session_data/multi_test_2/user_3/formatted-alignment.json"))
	# filepath_4 = os.path.abspath(os.path.join(basepath, "session_data/multi_test_1/user_4/formatted-alignment.json"))

	addto_sorted_list(filepath_1,"user1")
	addto_sorted_list(filepath_2,"user2")
	addto_sorted_list(filepath_3,"user3")
	
	sorteddictionary = sorted(dictionary, key = lambda x: x[0])
	json.dumps(sorteddictionary)


	checker=""
	counter = 0
	user1counter = 0
	user2counter = 0
	user3counter = 0
	for item in sorteddictionary:
		if(counter == 0):
			checker = item[1]

		elif(item[1] != checker):
			if(checker == "user1"):
				user1counter += 1
			elif(checker == "user2"):
				user2counter += 1
			elif(checker == "user3"):
				user3counter += 1
			checker = item[1]
		counter +=1
	print user1counter
	print user2counter
	print user3counter


	# print json.dumps(sorteddictionary)

