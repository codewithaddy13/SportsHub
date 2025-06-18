from fastapi import FastAPI
from fastapi import Request
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from datetime import datetime, timedelta
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import httpx
from googletrans import Translator

trans = Translator()

lang = 'en'

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
    global lang
    lang = 'en'
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
    qtext = payload['queryResult']['fulfillmentText']
    

    
    intent_handler_dict = {
        'Default Welcome Intent': say_hello,
        'Default Fallback Intent': fback,
        'enquiry': enq,
        'turfs.price': suggest_turf,
        'switch.lang': lang_check,
        'turf.description': describe_turf,
        'turf.rate': turf_rates,
        'turf.location': turf_location,
        'turf.details': fetch_details,
        'booking.details': get_details,
        'booking.confirm': save_db,
        'booking.cancel': discard,
        'booking.thx': thxx
    }

    # return intent_handler_dict[intent](parameters)
    if intent == 'booking.confirm':
        result = await intent_handler_dict[intent](parameters,qtext)
    else:
        result = intent_handler_dict[intent](parameters,qtext)

    return result

def lang_check(parameters: dict, qtext: str):
    global lang
    lang = parameters['languages']
    print(lang)
    

def say_hello(parameters: dict, qtext):
    global lang
    print(qtext)
    
    if lang != 'en':
        print(lang)
        translated = trans.translate(qtext, dest=lang)
        fulltext = translated.text

        return JSONResponse(content={
            "fulfillmentText": fulltext
        })
    

def fback(parameters: dict, qtext):
    global lang
    print(qtext)
    
    if lang != 'en':
        print(lang)
        translated = trans.translate(qtext, dest=lang)
        fulltext = translated.text

        return JSONResponse(content={
            "fulfillmentText": fulltext
        })

def enq(parameters: dict, qtext):
    global lang
    print(qtext)
    
    if lang != 'en':
        print(lang)
        translated = trans.translate(qtext, dest=lang)
        fulltext = translated.text

        return JSONResponse(content={
            "fulfillmentText": fulltext
        })

def thxx(parameters: dict, qtext):
    global lang
    print(qtext)
    
    if lang != 'en':
        print(lang)
        translated = trans.translate(qtext, dest=lang)
        fulltext = translated.text

        return JSONResponse(content={
            "fulfillmentText": fulltext
        })


def suggest_turf(parameters: dict, qtext):
    global lang
    turfprice = parameters['number']
    coll = database['turfs']

    if not turfprice:
        if lang != 'en':
            translated = trans.translate(qtext, dest=lang)
            fulltext = translated.text
        else:
            fulltext = qtext

        return JSONResponse(content={
            "fulfillmentText": fulltext
        })

    # Query the database for turfs under the given price
    turfs = list(coll.find({"price": {"$lt": turfprice}}))

    if turfs:
        # If turfs exist under the given price
        response_text = "Here are the turfs under your budget:\n\n"
        for index, turf in enumerate(turfs, start=1):
            # Format the turf name to stand out (using bold formatting)
            response_text += f"{index}. **{turf['name']}**\n   📍 Location: {turf['location']}\n\n"

        # Translate response if needed
        if lang != 'en':
            translated = trans.translate(response_text, dest=lang)
            response_text = translated.text

        return JSONResponse(content={
            "fulfillmentText": response_text
        })
    else:
        # If no turfs exist under the given price
        response_text = f"Sorry, there are no turfs available under ${turfprice}."

        # Translate response if needed
        if lang != 'en':
            translated = trans.translate(response_text, dest=lang)
            response_text = translated.text

        return JSONResponse(content={
            "fulfillmentText": response_text
        })




def discard(parameters: dict, qtext):
    global lang
    print(qtext)
    
    if lang != 'en':
        print(lang)
        translated = trans.translate(qtext, dest=lang)
        fulltext = translated.text

        return JSONResponse(content={
            "fulfillmentText": fulltext
        })



def describe_turf(parameters:dict, qtext):
    global lang
    coll = database['turfs']
    turfname = parameters['turf-names']
    print(parameters)
    print(turfname)
    print(type(turfname))

    if not turfname:
        if lang != 'en':
            translated = trans.translate(qtext, dest=lang)
            fulltext = translated.text
        else:
            fulltext = qtext

        return JSONResponse(content={
            "fulfillmentText": fulltext
        })
    
    turf = turfname[0]

    result = coll.find_one(
        { "name": turf},  # Filter criteria
        { "_id": 0, "description": 1 }  # Projection
    )

    if result and "description" in result:
        if lang != 'en':
            translated = trans.translate(result["description"], dest=lang)
            fulltext = translated.text
        else:
            fulltext = result["description"]

    else:
        if lang != 'en':
         translated = trans.translate(f"The turf {turf} is not available.", dest=lang)
         fulltext = translated.text

         return JSONResponse(content={
            "fulfillmentText": fulltext
         })
        else:
            fulltext = f"The turf {turf} is not available."

    
    return JSONResponse(content={
        "fulfillmentText": fulltext
    })


def turf_rates(parameters:dict, qtext):
    global lang
    coll = database['turfs']
    turfname = parameters['turf-names']
    print(parameters)
    print(turfname)
    print(type(turfname))
    turfname = [turfname]
    print(turfname)
    print(type(turfname))

    if not turfname:
        if lang != 'en':
            translated = trans.translate(qtext, dest=lang)
            fulltext = translated.text
        else:
            fulltext = qtext

        return JSONResponse(content={
            "fulfillmentText": fulltext
        })

    turf = turfname[0]

    result = coll.find_one(
        {"name": turf},  # Filter criteria
        {"_id": 0, "price": 1}  # Projection
    )

    if result and "price" in result:
        price_per_hour = result["price"]
        response_text = f"The rate for {turf} is {price_per_hour} per hour."

        if lang != 'en':
            translated = trans.translate(response_text, dest=lang)
            fulltext = translated.text
        else:
            fulltext = response_text
    else:
        response_text = f"The pricing details for {turf} are not available."

        if lang != 'en':
            translated = trans.translate(response_text, dest=lang)
            fulltext = translated.text
        else:
            fulltext = response_text

    return JSONResponse(content={
        "fulfillmentText": fulltext
    })

def turf_location(parameters:dict, qtext):
    global lang
    coll = database['turfs']
    turfname = parameters['turf-names']
    print(parameters)
    print(turfname)
    print(type(turfname))
    turfname = [turfname]
    print(turfname)
    print(type(turfname))

    if not turfname:
        if lang != 'en':
            translated = trans.translate(qtext, dest=lang)
            fulltext = translated.text
        else:
            fulltext = qtext

        return JSONResponse(content={
            "fulfillmentText": fulltext
        })

    turf = turfname[0]

    result = coll.find_one(
        {"name": turf},  # Filter criteria
        {"_id": 0, "location": 1}  # Projection
    )

    if result and "location" in result:
        location = result["location"]
        response_text = f"{turf} is located at {location}."

        if lang != 'en':
            translated = trans.translate(response_text, dest=lang)
            fulltext = translated.text
        else:
            fulltext = response_text
    else:
        response_text = f"The location details for {turf} are not available."

        if lang != 'en':
            translated = trans.translate(response_text, dest=lang)
            fulltext = translated.text
        else:
            fulltext = response_text

    return JSONResponse(content={
        "fulfillmentText": fulltext
    })





def fetch_details(parameters: dict, qtext):
    global lang
    print(qtext)
    booking_date = parameters['date']
    turf = parameters['turf-names']
    turf_coll = database['turfTimings']

    if not booking_date or not turf:
        if lang != 'en':
            translated = trans.translate(qtext, dest=lang)
            fulltext = translated.text
        else:
            fulltext = qtext

        return JSONResponse(content={
            "fulfillmentText": fulltext
        })

    # Validate the booking date
    today = datetime.today().date()
    max_date = today + timedelta(days=120)  # 4 months (~120 days)
    dt_object = datetime.fromisoformat(booking_date)
    formatted_date = dt_object.strftime('%Y-%m-%d')
    bookingdate = datetime.strptime(formatted_date, "%Y-%m-%d").date()

    #Extract the day of the week (e.g., "Monday", "Tuesday", etc.)
    booking_day = bookingdate.strftime("%A")

    # Fetch turf details (opening time, closing time, available days)
    turf_details = turf_coll.find_one({"turfName": turf})

    # Check if the turf is open on the selected day
    available_days = turf_details.get("days_available", [])  # List of available days
    available_days_str = ", ".join(available_days[:-1]) + " and " + available_days[-1] if len(available_days) > 1 else available_days[0]

    if booking_day not in available_days:
        if lang != 'en':
            translated = trans.translate(f"Turf '{turf}' is not available on {booking_day}. They operate on {available_days_str}.", dest=lang)
            fulltext = "🚫" + translated.text 
            return JSONResponse(content={"fulfillmentText": fulltext})
        else:
            return JSONResponse(content={"fulfillmentText": f"🚫 Turf '{turf}' is not available on {booking_day}. They operate on {available_days_str}."})

    if dt_object.date() < today:
        if lang != 'en':
            translated = trans.translate("The booking date cannot be in the past. Please choose a valid date.", dest=lang)
            fulltext = "🚫"+translated.text+"🚫"
        else:
            fulltext = "The booking date cannot be in the past. Please choose a valid date."

        return JSONResponse(content={
            "fulfillmentText": fulltext
        })

    if dt_object.date() > max_date:
        if lang != 'en':
            translated = trans.translate("The booking date cannot be more than 4 months from today. Please choose a valid date.", dest=lang)
            fulltext = "🚫"+translated.text+"🚫"
        else:
            fulltext = "🚫The booking date cannot be more than 4 months from today. Please choose a valid date.🚫"

        return JSONResponse(content={
            "fulfillmentText": fulltext
        })

    # Fetch booking details from the database
    coll = database['bookings']
    bookings = list(coll.find(
        {"turfName": turf, "date": formatted_date},
        {"_id": 0, "time": 1, "duration": 1}
    ))

    if bookings:
        # Construct the booking details response
        details = []
        for booking in bookings:
            details.append(f"Booked at {booking['time']} for {booking['duration']} hours.")

        if lang != 'en':
            translated = trans.translate(f"The turf '{turf}' is booked on {formatted_date} as follows:\n" + "\n".join(details), dest=lang)
            fulltext = translated.text
        else:
            fulltext = f"The turf '{turf}' is booked on {formatted_date} as follows:\n" + "\n".join(details)

        return JSONResponse(content={
        "fulfillmentText": fulltext
        })
    else:
        # Response when no bookings are found
        if lang != 'en':
            translated = trans.translate(f"The turf '{turf}' is available for any desired time on {formatted_date}.", dest=lang)
            fulltext = translated.text
        else:
            fulltext = f"The turf '{turf}' is available for any desired time on {formatted_date}."

        return JSONResponse(content={
        "fulfillmentText": fulltext
        })


def get_details(parameters:dict, qtext):
    print(qtext)
    print(parameters)
    duration = parameters['duration']
    time = parameters['time']
    sportname = parameters['sports-names']
    booking_date = parameters['date']
    turfname = parameters['turf-names']

    if not duration or not time or not sportname or not booking_date or not turfname:
        if lang != 'en':
            translated = trans.translate(qtext, dest=lang)
            fulltext = translated.text
        else:
            fulltext = qtext

        return JSONResponse(content={
            "fulfillmentText": fulltext
        })

    sport = sportname[0]
    turf = turfname[0]

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

    if lang != 'en':
        translated = trans.translate(qtext, dest=lang)
        fulltext = translated.text

        return JSONResponse(content={
        "fulfillmentText": fulltext
    })





async def save_db(parameters: dict, qtext):
    global lang
    print(qtext)
    print(f'{global_dict}')
    coll = database['bookings']
    turf_coll = database['turfTimings']
    turfName = global_dict[0]
    date = global_dict[1]
    time = str(global_dict[2])
    duration = int(global_dict[3])  # Convert duration to integer
    sport = global_dict[4]
    
    global_dict.clear()
    print(f"{global_dict}")

    if user_email is None:
        if lang != 'en':
            translated = trans.translate("Please log-in to SportsHub with your account to complete the booking!", dest=lang)
            fulltext = translated.text
            return JSONResponse(content={"fulfillmentText": fulltext})
        else:
            return JSONResponse(content={"fulfillmentText": "Please log-in to SportsHub with your account to complete the booking!"})
    
    # Validate the booking date range
    today = datetime.today().date()
    max_date = today + timedelta(days=120)  # Next 4 months (~120 days)
    booking_date = datetime.strptime(date, "%Y-%m-%d").date()

    #Extract the day of the week (e.g., "Monday", "Tuesday", etc.)
    booking_day = booking_date.strftime("%A")

    # Fetch turf details (opening time, closing time, available days)
    turf_details = turf_coll.find_one({"turfName": turfName})

    # Check if the turf is open on the selected day
    available_days = turf_details.get("days_available", [])  # List of available days

    if booking_date < today:
        if lang != 'en':
            translated = trans.translate("The booking date cannot be in the past. Please choose a valid date.", dest=lang)
            fulltext = "🚫" + translated.text + "🚫"
            return JSONResponse(content={"fulfillmentText": fulltext})
        else:
            return JSONResponse(content={"fulfillmentText": "🚫The booking date cannot be in the past. Please choose a valid date.🚫"})

    if booking_date > max_date:
        if lang != 'en':
            translated = trans.translate("The booking date cannot be more than 4 months from today. Please choose a valid date.", dest=lang)
            fulltext = "🚫" + translated.text + "🚫"
            return JSONResponse(content={"fulfillmentText": fulltext})
        else:
            return JSONResponse(content={"fulfillmentText": "🚫The booking date cannot be more than 4 months from today. Please choose a valid date.🚫"})
        

    if booking_day not in available_days:
        if lang != 'en':
            translated = trans.translate(f"Turf '{turfName}' is not available on {booking_day}. Please select another date.", dest=lang)
            fulltext = "🚫" + translated.text + "🚫"
            return JSONResponse(content={"fulfillmentText": fulltext})
        else:
            return JSONResponse(content={"fulfillmentText": f"🚫 Turf '{turfName}' is not available on {booking_day}. Please select another date. 🚫"})
    
    # Convert time into datetime object
    booking_time = datetime.strptime(time, "%H:%M")
    end_time = booking_time + timedelta(hours=duration)

    # Validate booking time within turf's opening and closing time
    opening_time = datetime.strptime(turf_details["openingTime"], "%H:%M")
    closing_time = datetime.strptime(turf_details["closingTime"], "%H:%M")

    if booking_time < opening_time or end_time > closing_time:
        if lang != 'en':
            translated = trans.translate(f"The selected time {time} - {end_time.strftime('%H:%M')} is outside the turf's working hours ({opening_time.strftime('%H:%M')} - {closing_time.strftime('%H:%M')}). Please choose a valid time slot.", dest=lang)
            fulltext = "🚫" + translated.text + "🚫"
            return JSONResponse(content={"fulfillmentText": fulltext})
        else:
            return JSONResponse(content={
            "fulfillmentText": f"🚫 The selected time {time} - {end_time.strftime('%H:%M')} is outside the turf's working hours ({opening_time.strftime('%H:%M')} - {closing_time.strftime('%H:%M')}). Please choose a valid time slot. 🚫"
        })

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
            if lang != 'en':
                translated = trans.translate(f"The turf '{turfName}' is already booked for this time slot on {date}. Please choose another time.", dest=lang)
                fulltext = translated.text
                return JSONResponse(content={"fulfillmentText": fulltext})
            else:    
                return JSONResponse(content={"fulfillmentText": f"The turf '{turfName}' is already booked for this time slot on {date}. Please choose another time."})

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
        booking_doc['_id'] = str(result.inserted_id)

        # Send booking confirmation email (awaiting the result)
        async with httpx.AsyncClient() as client:
            response = await client.post(
                'http://localhost:5000/send-booking-email',  # Node.js server endpoint
                json={
                    'userEmail': user_email,
                    'bookingDetails': booking_doc
                }
            )

            # Ensure email is successfully sent before returning a response
            if response.status_code == 200:
                if lang != 'en':
                    translated = trans.translate(qtext, dest=lang)
                    fulltext = translated.text
                    print(fulltext)
                    return JSONResponse(content={
                        "fulfillmentText": fulltext
                    })
                else:
                    fulltext = qtext
                    print(fulltext)
                    return JSONResponse(content={
                        "fulfillmentText": fulltext
                    })
            else:
                if lang != 'en':
                    translated = trans.translate("Booking confirmed, but there was an error sending the confirmation email.", dest=lang)
                    fulltext = translated.text
                    return JSONResponse(content={"fulfillmentText": fulltext})
                else:
                    return JSONResponse(content={"fulfillmentText": "Booking confirmed, but there was an error sending the confirmation email."})

    except Exception as e:
        print(f"Error saving to database: {e}")
        return JSONResponse(content={"fulfillmentText": "An error occurred while saving the booking."})













