from fastapi import FastAPI
from fastapi import Request
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from datetime import datetime, timedelta
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import httpx

global_dict = []
user_email = None

url = 'mongodb://localhost:27017'
client = MongoClient(url)
database = client['fsd_database']
app = FastAPI()

# Allow CORS for specific origins (adjust this based on your requirements)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins, or specify domains like ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allow all headers
)

class EmailPayload(BaseModel):
    email: str | None

@app.post("/api/send-email")
async def send_email(payload: EmailPayload):
    global user_email  # Explicitly declare global
    user_email = payload.email
    print(f"Received email: {user_email}")
    return {"message": "Email received successfully"}


@app.post("/")
async def handle_request(request: Request):
    # Retrieve the JSON data from the request
    payload = await request.json()

    # Extract the necessary information from the payload
    # based on the structure of the WebhookRequest from Dialogflow
    intent = payload['queryResult']['intent']['displayName']
    parameters = payload['queryResult']['parameters']
    output_contexts = payload['queryResult']['outputContexts']
    

    intent_handler_dict = {
        'turf.description': describe_turf,
        'turf.details': fetch_details,
        'booking.details': get_details,
        'booking.confirm': save_db
    }

    # return intent_handler_dict[intent](parameters)
    if intent == 'booking.confirm':
        result = await intent_handler_dict[intent](parameters)
    else:
        result = intent_handler_dict[intent](parameters)

    return result


def describe_turf(parameters:dict):
    coll = database['turfs']
    turf = parameters['turf-names'][0]

    result = coll.find_one(
        { "name": turf},  # Filter criteria
        { "_id": 0, "description": 1 }  # Projection
    )

    if result and "description" in result:
        fulltext = result["description"]
    else:
        fulltext = f"The turf {turf} is not available."

    return JSONResponse(content={
        "fulfillmentText": fulltext
    })


def fetch_details(parameters:dict):
    booking_date = parameters['date']
    turf = parameters['turf-names']
    dt_object = datetime.fromisoformat(booking_date)
    formatted_date = dt_object.strftime('%Y-%m-%d')
    coll = database['bookings']

    bookings = list(coll.find(
        { "turfName": turf, "date": formatted_date },
        { "_id": 0, "time": 1, "duration": 1 }
    ))

    if bookings:
        # Construct the booking details response
        details = []
        for booking in bookings:
            details.append(f"Booked at {booking['time']} for {booking['duration']} hours.")
        fulltext = f"The turf '{turf}' is booked on {formatted_date} as follows:\n" + "\n".join(details)
    else:
        # Response when no bookings are found
        fulltext = f"The turf '{turf}' is available for any desired time on {formatted_date}."

    
    return JSONResponse(content={
        "fulfillmentText": fulltext
    })

def get_details(parameters:dict):
    duration = parameters['duration']
    time = parameters['time']
    sport = parameters['sports-names'][0]
    booking_date = parameters['date']
    turf = parameters['turf-names'][0]

    dt_object = datetime.fromisoformat(booking_date)
    formatted_date = dt_object.strftime('%Y-%m-%d')

    dt_object = datetime.fromisoformat(time)
    formatted_time = dt_object.strftime('%H:%M')

    dur = int(duration[0]["amount"])

    global_dict.append(turf)
    global_dict.append(formatted_date)
    global_dict.append(formatted_time)
    global_dict.append(dur)
    global_dict.append(sport)



async def save_db(parameters:dict):
    print(f'{global_dict}')
    coll = database['bookings']
    turfName = global_dict[0]
    date = global_dict[1]
    time = str(global_dict[2])
    duration = int(global_dict[3])  # Convert duration to integer
    sport = global_dict[4]
    
    global_dict.clear()
    print(f"{global_dict}")

    if user_email is None:
        return JSONResponse(content={
            "fulfillmentText": "Please log-in to SportsHub with your account to complete the booking!"
        })
    
    # Convert time into datetime object
    booking_time = datetime.strptime(time, "%H:%M")
    end_time = booking_time + timedelta(hours=duration)

    # Check if there are overlapping bookings
    existing_bookings = list(coll.find(
        {"turfName": turfName, "date": date},
        {"_id": 0, "time": 1, "duration": 1}
    ))

    for booking in existing_bookings:
        existing_time = datetime.strptime(booking['time'], "%H:%M")
        existing_end_time = existing_time + timedelta(hours=float(booking['duration']))


        # Check if the times overlap
        if (booking_time < existing_end_time and end_time > existing_time):
            return JSONResponse(content={
                "fulfillmentText": f"The turf '{turfName}' is already booked for this time slot on {date}. Please choose another time."
            })

    # Proceed with saving the booking if no overlap is found
    booking_doc = {
        "turfName": turfName,
        "date": date,
        "time": time,
        "duration": str(duration),
        "sport": sport,
        "userEmail": user_email
    }

    try:
        # Insert the document into the collection
        result = coll.insert_one(booking_doc)

        # Ensure the ObjectId is serialized to string
        booking_doc['_id'] = str(result.inserted_id)  # Convert ObjectId to string

        # Send booking confirmation email
        async with httpx.AsyncClient() as client:
            response = await client.post(
                'http://localhost:5000/send-booking-email',  # Node.js server endpoint
                json={
                    'userEmail': user_email,
                    'bookingDetails': booking_doc
                }
            )
            if response.status_code == 200:
                return JSONResponse(content={
                    "fulfillmentText": "Booking confirmed and confirmation email sent."
                })
            else:
                return JSONResponse(content={
                    "fulfillmentText": "Booking confirmed, but there was an error sending the confirmation email."
                })

    except Exception as e:
        print(f"Error saving to database: {e}")
        return JSONResponse(content={
            "fulfillmentText": "An error occurred while saving the booking."
        })













