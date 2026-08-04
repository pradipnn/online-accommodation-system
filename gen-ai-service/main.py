from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models import Property, PropertySearchRequest, PropertySearchFilters
from ai_service import generate_description, parse_search_query

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "Property AI Service Running"
    }

@app.post("/generate-description")
def generate_description_api(property_data: Property):
    try:
        desc = generate_description(property_data.model_dump())
        return {"description": desc}
    except Exception as e:
        print("AI generation error:", e)
        amenities_str = ", ".join(property_data.amenities) if property_data.amenities else "essential amenities"
        fallback_desc = f"Welcome to {property_data.title}, a premier {property_data.propertyType.lower()} located in {property_data.city}, {property_data.state}. Offering modern accommodation with features such as {amenities_str}."
        return {"description": fallback_desc}

@app.post("/property-search")
def parse_search_api(request: PropertySearchRequest):
    filters = parse_search_query(request.query)
    return filters