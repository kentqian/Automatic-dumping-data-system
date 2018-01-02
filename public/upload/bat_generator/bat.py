import csv
import re
import traceback
import sys

blocklist = []
listblock = ["CPC", "CPF","CPG","WD","GRBM","IA","VGT","SU","SC","DB","CB","SPI","SX","TA","TD","TCP","TCC","TCA","TCS","GDS","MCS","BIF","SRBM","RMI","EA","UMC"]
blockchannel = ["CPC2", "CPF2","CPG2","WD2","GRBM2","IA2","VGT2","SU4","SC4","DB4","CB4","SPI2","SQ1","SX2","TA2","TD2","TCP2","TCC2","TCA2","TCS2","GDS2","MCS2","BIF2","SRBM2","RMI1","EA1","UMC1"]

csvfile = open('temp.csv', 'w',newline='')
writer = csv.writer(csvfile)
shadertype = ["4", "5", "11", "12", "13", "15", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40","41","42","43","44","45","46", "74", "75", "76", "77", "78", "79", "80", "81", "82", "83", "84", "85", "86", "87", "88","115"]
sq_ps = []
sq_acc = []
sqc = []
sq = []

sq_shadertype = []

for i in range(len(listblock)):
    inputfile = csv.reader(open(sys.argv[1]))
    temp = listblock[i]

    listblock[i] = []

    for row in inputfile:
        
        if(row[2] == temp):
            listblock[i].append(temp+row[3])
            

    if(listblock[i] != []):
        blocklist.append(listblock[i])
#print blocklist
inputfile = csv.reader(open(sys.argv[1]))
for row in inputfile:
    option = False
    if(row[2] == "SQ"):
        #print row[3]
        for j in range(len(shadertype)):
            
            if(row[3] == shadertype[j]):
                #print shadertype[j]
                option = True
        #print option
        
        if(option):        
            if"_LEVEL_" in row[4]:
                sq_acc.append("SQS_ACC"+row[3])
                inter = row[4].replace("SQ_PERF_SEL_","_")
                sq_acc.append(inter)
                #sq_acc.append
            else:
                sq_ps.append("SQS_PS"+row[3])
        elif "SQC_PERF_SEL_" in row[4]:
            sqc.append("SQC"+row[3])
        elif "_LEVEL" in row[4]:
            sq_acc.append("SQS_ACC"+row[3])
            inter = row[4].replace("SQ_PERF_SEL_","_")
            sq_acc.append(inter)
        else:
            sq.append("SQ"+row[3])

#print sq
#print sq_acc
#print sq_ps
#print sqc
blocklist.append(sq)
#print blocklist

sq_shadertype.append(sq_ps)
sq_shadertype.append(sq_acc)
sq_shadertype.append(sqc)

#print sq_shadertype

dic = {}
for j in range(len(blockchannel)):
    tempbl = re.compile(r'\D+')
    blocktemp = tempbl.findall(blockchannel[j])
    tempch = re.compile(r'\d+')
    channeltemp = tempch.findall(blockchannel[j])
    dic[blocktemp[0]] = channeltemp[0]
#print dic

while(blocklist != []):
    passlist = []
    for i in range(len(blocklist)):
        #print blocklist[i]
        if(blocklist[i] == []):
            #del(blocklist[i])
            #print blocklist
            continue
        else:
            block = re.compile(r'\D+')
            temp = block.findall(blocklist[i][0])
            a = dic.get(temp[0])
            for j in range(int(a)):
                try:
                    blockpop = blocklist[i].pop(0)
                    
                    blockindex = re.compile(r'\d+')
                    tempindex = blockindex.findall(blockpop)
                    tempcounter = temp[0] + str(j) + ":"+tempindex[0]+":"+blockpop
                    #print tempcounter
                    passlist.append(tempcounter)
                    
                    #passlist.append(blockpop)

        
                except:
                    #print blocklist
                    #del(blocklist[i])
                    #print blocklist
                    #print hello
                    continue
    #print passlist
    
        
    #print blocklist
    if(passlist != []):
        #print(passlist)
        writer.writerow(passlist)
    else:
        break

for i in range(len(sq_shadertype)):
    
    while(sq_shadertype[i] != []):
        if(len(sq_shadertype[i]) < 6):
            #print (sq_shadertype[i])
            writer.writerow(sq_shadertype[i])
            break
        else:
            
            templist = []
            try:
                for j in range(6):
                    psblock = sq_shadertype[i].pop(0)
                    templist.append(psblock)

                    if(sq_shadertype[i] == []):
                        #print templist
                        continue
                        #writer.writerow(templist)
            except:
                continue
            #print (templist)
            writer.writerow(templist)

    
csvfile.close()
#print blocklist
#print blocklist






    



             
            

                              

