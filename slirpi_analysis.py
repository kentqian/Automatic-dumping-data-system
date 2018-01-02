import sys
import time
import os
import socket
import csv
import MySQLdb as mysqldb

db = mysqldb.connect("localhost","root","","slirpidb",3306)
cursor = db.cursor()
hostname = socket.gethostname()

def slirpi_search_all():
    for root,dirs,files in os.walk("D:\SlirpiNextV2_Results"):
        if len(dirs) == 0:
            for i in files:
                if "SlirpiNextSummary" in i and os.path.getsize(os.path.join(root,i)) > 0 and len(files) >= 19 :
                    print i
                    print "for config\n"
                    config_path = os.path.join(root,"SlirpiNext_Configs.csv").replace('\\','/')
                    config_content = config_csv(config_path)
                    save_to_config_database(config_content,hostname,root.replace('\\','/'))
                    print "for apps\n"
                    apps_path = os.path.join(root,"SlirpiNext_Apps.csv").replace('\\','/')
                    apps_content = apps_csv(apps_path)
                    save_to_apps_database(apps_content,hostname,root.replace('\\','/'))

def config_csv(path):
    csvfile = file(path,"rb")
    reader = csv.reader(csvfile)
    content = []
    for line in reader:
        content.append(line[0])
    return content

def apps_csv(path):
    csvfile = file(path,"rb")
    reader = csv.reader(csvfile)
    content = []
    for line in reader:
        if line[1] == 'yes':
            content.append(line[0])
    return content

def save_to_config_database(content,hostname,path):
    for i in range(2,len(content)):
        if i == 2:
            sql = "Insert Into slirpi_config(hostname, config, path, isbased)\
                    Values('"+ hostname +"', '"+ content[i] +"', '"+ path +"', true)"
        else:
            sql = "Insert Into slirpi_config(hostname, config, path, isbased)\
                    Values('"+ hostname +"', '"+ content[i] +"', '"+ path +"', false)"
        try:
            cursor.execute(sql)
            db.commit()
        except:
            print "Slirpi Next Insert Problem!"
            db.rollback()

def save_to_apps_database(content,hostname,path):
    for i in content:
        sql = "Insert Into slirpi_apps(hostname, app, path)\
                Values('"+ hostname +"', '"+ i +"', '"+ path +"')"
        try:
            cursor.execute(sql)
            db.commit()
        except:
            print "Slirpi Next Insert Problem!"
            db.rollback()
