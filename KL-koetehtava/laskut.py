#! /usr/bin/python3
# coding=utf-8
import json 

# The following needs to be done by hand first: 
# The data is first saved in a CSV-format (this is done in Google Sheets to ensure
# that the encoding is UTF-8). Then the CSV-file is further transformed to more 
# handy and modern JSON-file with couple clicks at http://www.csvjson.com/csv2json

data = []   # Variable to store all the data presented in the excel-file. 
codes = []  # A variable to store Toimialakoodit (= industry code)

# Load the JSON-file into the data-variable
with open('kauppalehti.json',  encoding='utf-8') as data_file: 
	data = json.loads(data_file.read())

# Parse all the different industry codes from the data and save them to the codes-variable
for x in data:
	code = x["Toimialakoodi YTJ"]
	industry = x["Toimialakuvaus YTJ"]
	if [code, industry] not in codes:
		codes.append([code, industry])


count = 0  # Helper variable for computing the average sales growth percentage for each industry
		   # (Apumuuttuja kun lasketaan keskimääräistä LVKasvu%:a jokaiselle toimialalle)
summa = 0.0 # Helper variable
i = 0		# Helper index
toimialat = []	# A list that will contain the tuples with (average sales growth percentage, industry code)
                # (Lista pareista (kyseisen toimialan keskimääräinen LVKasvu%, Toimialakoodi) )

#Lasketaan keskimääräiset kasvuprosentit kullekin toimialalle 
for code in codes:
	for x in data: 
		if x["Toimialakoodi YTJ"] == code[0]:
			count = count + 1
			if isinstance(x["LVKasvu% 2012-2015"], int):
				summa = summa + x["LVKasvu% 2012-2015"]
			else: summa = summa + float(x["LVKasvu% 2012-2015"].replace(',','.'))
	toimialat.append([round(summa/count, 1), code[0], code[1]])
	summa = 0
	count = 0

# Sort the resulting list from smallest growth percentage to largest
toimialat.sort()
#for toimiala in toimialat:
#	print(toimiala)

with open("toimialojen_kehitys.txt", "w") as my_file:
	my_file.write('\n'.join(str(line) for line in toimialat))


hklsto = []
# Lasketaan keskimääräiset henkilöstömäärät kullekkin toimialalle vuonna 2015
s12 = 0
s13 = 0
s14 = 0
s15 = 0
for ala in toimialat:
	for x in data: 
		if x["Toimialakoodi YTJ"] == ala[1]:
			count = count + 1
			s12 = s12 + x["Henkilöstömäärä 2012"]
			s13 = s13 + x["Henkilöstömäärä 2013"]
			s14 = s14 + x["Henkilöstömäärä 2014"]
			s15 = s15 + x["Henkilöstömäärä 2015"]
	hklsto.append([ala[0], round(s12/count), round(s13/count), round(s14/count), round(s15/count), ala[1], ala[2]])
	s12 = 0
	s13 = 0
	s14 = 0
	s15 = 0
	count = 0

hklsto.sort()
#for ala in hklsto: 
#	print(ala[0], " ", ala[1], " ", ala[2], " ", ala[3], " ", ala[4], " ", ala[5])

hklostonkasvupros = []
for ala in hklsto: 
	#print(ala[1], " ", ala[1] != 0, " ", ala[4])
	if (ala[1] != 0 and ala[4] != 0 and ala[1] != "" and ala[4] != "" and ala[1] != "0" and ala[4] != "0" and isinstance(ala[1], int) and isinstance(ala[4], int)):
		hklostonkasvupros.append([(ala[4]-ala[1])/float(ala[1])*100, ala[5], ala[6]])

hklostonkasvupros.sort(reverse=True)

with open("muutos.txt","w") as filu:
	filu.write( '\n'.join( str(line[0])+" "+str(line[1])+" "+str(line[2]) for line in hklostonkasvupros) )


with open("heklostomaaran_kehitys.csv", "w") as datafile:
	datafile.write("Keskimääräinen LVK%,Keskimääräinen h-määrä 2012,Keskimääräinen h-määrä 2013,Keskimääräinen h-määrä 2014,Keskimääräinen h-määrä 2015,Toimialakoodi,Toimiala\n" + '\n'.join(str(line[0])+','+str(line[1])+','+str(line[2])+','+str(line[3])+','+str(line[4])+','+str(line[5])+','+str(line[6]) for line in hklsto))