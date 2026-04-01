from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from model import predict_traffic
import requests

app = FastAPI()

# ✅ Enable CORS (for React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Root endpoint
@app.get("/")
def root():
    return {"message": "Smart Traffic AI backend is running 🚀"}


# ✅ Simple traffic prediction endpoint
@app.get("/predict")
def predict(hour: int, day: int):
    traffic = predict_traffic(hour, day)

    if traffic < 70:
        level = "low"
    elif traffic < 90:
        level = "medium"
    else:
        level = "high"

    return {
        "traffic_level": level,
        "traffic_value": traffic
    }


# ✅ Smart route with AI + OSRM
@app.get("/route")
def get_route(lat1: float, lng1: float, lat2: float, lng2: float):
    try:
        # 1. Get real route from OSRM
        url = f"https://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}?overview=full&geometries=geojson"
        res = requests.get(url)
        data = res.json()

        coords = data["routes"][0]["geometry"]["coordinates"]

        # 2. Sample route points (reduce load)
        sample = coords[::10]

        total = 0

        # 3. AI prediction for each segment
        for _ in sample:
            traffic = predict_traffic(hour=12, day=1)
            total += traffic

        avg = total / len(sample)

        # 4. Decide traffic level + color
        if avg < 70:
            level = "low"
            color = "green"
        elif avg < 90:
            level = "medium"
            color = "orange"
        else:
            level = "high"
            color = "red"

        # 5. Adjust ETA based on traffic
        base_time = data["routes"][0]["duration"] / 60  # minutes
        eta = base_time * (avg / 70)

        return {
            "route": coords,
            "traffic_level": level,
            "color": color,
            "eta": round(eta, 2)
        }

    except Exception as e:
        return {"error": str(e)}