import os
import json
import re
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain.messages import HumanMessage, SystemMessage

load_dotenv()

llm = init_chat_model(
    model="groq:llama-3.1-8b-instant",
    api_key=os.getenv("GROQ_API_KEY")
)

SYSTEM_PROMPT = """
You are a professional content writer for an online accommodation portal.

Generate a professional property description using ONLY the values provided in the JSON.

Rules:
- Never use placeholders such as [Property Name], [Address], [City], etc.
- Use the exact values from the JSON.
- If a field contains a generic placeholder like "Property name", "Address", or is empty, simply omit it.
- Do not invent any information.
- Do not include capacity
- Keep the description between 60 and 80 words.
- Return only the description text.
"""

SEARCH_PARSER_SYSTEM_PROMPT = """
You convert user natural language accommodation search requests into a structured JSON filter object.

Output MUST be a single raw JSON object only. Do NOT output markdown formatting (no ```json code blocks), no explanations.

Supported Property Types (must be UPPERCASE or null):
- "PG"
- "HOSTEL"
- "HOTEL"
- "APARTMENT"

Supported Amenities (exact spelling):
["WiFi", "Parking", "Laundry", "Food", "AC", "CCTV", "Security", "Hot Water", "Power Backup", "Attached Bathroom", "Housekeeping", "Gym"]

Output JSON Schema:
{
  "city": string or null,
  "propertyType": string or null,
  "minRent": number or null,
  "maxRent": number or null,
  "minCapacity": number or null,
  "keyword": string or null,
  "amenities": array of strings
}

Rules:
- "below 8000" or "under 8000" or "max 8000" means maxRent = 8000
- "above 5000" or "min 5000" means minRent = 5000
- "between 5000 and 10000" means minRent = 5000, maxRent = 10000
- "paying guest" or "pg" -> propertyType = "PG"
- "hostel" -> propertyType = "HOSTEL"
- "hotel" -> propertyType = "HOTEL"
- "flat" or "apartment" -> propertyType = "APARTMENT"
- "wifi" -> "WiFi"
- "meals" or "food" or "breakfast" -> "Food"
- "ac" or "air conditioning" -> "AC"
- "parking" -> "Parking"
- "laundry" -> "Laundry"
- "cctv" -> "CCTV"
- "security" -> "Security"
- "hot water" or "geyser" -> "Hot Water"
- "power backup" or "generator" -> "Power Backup"
- "attached bathroom" -> "Attached Bathroom"
- "housekeeping" or "cleaning" -> "Housekeeping"
- "gym" -> "Gym"
- Words like "boys", "girls", "working men", "students", "family", "luxury" should be extracted as "keyword" if present.
- Use null for any field not specified.
"""

ALLOWED_PROPERTY_TYPES = {"PG", "HOSTEL", "HOTEL", "APARTMENT"}

AMENITY_MAP = {
    "wifi": "WiFi",
    "parking": "Parking",
    "laundry": "Laundry",
    "food": "Food",
    "meals": "Food",
    "ac": "AC",
    "air conditioning": "AC",
    "cctv": "CCTV",
    "security": "Security",
    "hot water": "Hot Water",
    "geyser": "Hot Water",
    "power backup": "Power Backup",
    "attached bathroom": "Attached Bathroom",
    "housekeeping": "Housekeeping",
    "gym": "Gym"
}

def generate_description(property_data):
    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=json.dumps(property_data, indent=2))
    ]
    response = llm.invoke(messages)
    return response.content

def parse_search_query(query_text: str) -> dict:
    if not query_text or not query_text.strip():
        return {
            "city": None,
            "propertyType": None,
            "minRent": None,
            "maxRent": None,
            "minCapacity": None,
            "keyword": None,
            "amenities": []
        }

    try:
        messages = [
            SystemMessage(content=SEARCH_PARSER_SYSTEM_PROMPT),
            HumanMessage(content=query_text.strip())
        ]
        response = llm.invoke(messages)
        content = response.content.strip()

        # Clean markdown code blocks if returned
        content = re.sub(r"^```json\s*", "", content, flags=re.MULTILINE)
        content = re.sub(r"^```\s*", "", content, flags=re.MULTILINE)
        content = content.strip()

        parsed = json.loads(content)

        # Validate propertyType
        p_type = parsed.get("propertyType")
        if p_type and str(p_type).upper() in ALLOWED_PROPERTY_TYPES:
            parsed["propertyType"] = str(p_type).upper()
        else:
            parsed["propertyType"] = None

        # Normalize amenities
        raw_amenities = parsed.get("amenities") or []
        normalized_amenities = []
        for item in raw_amenities:
            item_lower = str(item).strip().lower()
            if item_lower in AMENITY_MAP:
                normalized_amenities.append(AMENITY_MAP[item_lower])
            elif item in AMENITY_MAP.values():
                normalized_amenities.append(item)

        parsed["amenities"] = list(dict.fromkeys(normalized_amenities))

        return {
            "city": parsed.get("city") or None,
            "propertyType": parsed.get("propertyType"),
            "minRent": float(parsed["minRent"]) if parsed.get("minRent") is not None else None,
            "maxRent": float(parsed["maxRent"]) if parsed.get("maxRent") is not None else None,
            "minCapacity": int(parsed["minCapacity"]) if parsed.get("minCapacity") is not None else None,
            "keyword": parsed.get("keyword") or None,
            "amenities": parsed["amenities"]
        }
    except Exception as e:
        print("Error parsing search query with LLM:", e)
        # Fallback simple keyword parsing
        lower_q = query_text.lower()
        found_type = None
        for p in ALLOWED_PROPERTY_TYPES:
            if p.lower() in lower_q or (p == "PG" and "paying guest" in lower_q):
                found_type = p
                break

        found_amenities = []
        for key, val in AMENITY_MAP.items():
            if key in lower_q:
                found_amenities.append(val)

        return {
            "city": None,
            "propertyType": found_type,
            "minRent": None,
            "maxRent": None,
            "minCapacity": None,
            "keyword": None,
            "amenities": list(dict.fromkeys(found_amenities))
        }