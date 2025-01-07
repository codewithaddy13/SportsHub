# SportsHub
A Turf Booking Platform <br>

-> An end to end Turf Booking platform with an interactive ChatBot assistent to manage upcoming  <br>
bookings and the existing bookings in the database. <br>
<br>
-> Uses the Big-Data Tool, Kafka to capture the users' behavoir on the platform and tunes in the  <br>
analytical results like peak booking timings wrt Morning, Afternoons, Evening, Night, and the most <br>
popular turfs with the highest number of bookings on the platform.  <br>
-> Makes use of Google's Auth0 authentication to authenticate the users through their verified Gmail IDs <br>

<br>
<br>

Project prerequisits:- <br>
-> verified account on Google Dialogflow <br>
->verified account on Ngrok <br>
-> pip installations : pip install fastapi, pip install uvicorn(pip install uvicorn wheel, alternatively) <br>
-> npm installations : npm install auth0, npm install nodemailer, npm install kafkajs <br>

<br>

Steps to build:- <br>
-> download the ngrok.exe file from https://download.ngrok.com/windows?tab=download for Windows 64 bit <br>
-> place the file in the 'server' folder <br>
-> run the FastAPI server in the 'server' directory using the command uvicorn main:app --reload <br>
-> run the ngrok command in the same directory to generate the https URL corresponding to the localhost server http URL <br>
-> ngrok command : ngrok http 8000 <br>
-> paste the ngrok url generated in thee Dialogflow chatbot, under the 'Fulfillments' section by enabling the webhook permission <br>
-> down load the kafka zip file from https://kafka.apache.org/downloads <br>
-> extract the kafka zip file and place the folder in the C-Drive <br>
-> navigate to the >config dir of the kafka folder and modify the server file by setting 'log.dirs=C:\kafka-logs2' . Make sure u have the logs folder in >bin>windows directory. <br>
-> open the terminal in >bin>windows and createa Kafka topic <br>
       command = kafka-topics.bat --create --topic turfBookings --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1 <br>
-> open the terminal in >bin>windows and run the kafka zookeeper <br>
       command = zookeeper-server-start.bat ..\..\config\zookeeper.properties <br>
-> open the terminal in >bin>windows and run the kafka broker <br>
       command = kafka-server-start.bat ..\..\config\server.properties <br
-> start the node.js server and run the React app
