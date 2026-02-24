"""
AI-Powered Predictive Maintenance Backend
FastAPI server with OTP authentication and ML prediction
"""

import os
import random
import string
import asyncio
from datetime import datetime, timedelta
from typing import Optional, Dict, List
from contextlib import asynccontextmanager

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr

from jose import jwt, JWTError
from passlib.context import CryptContext
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "default-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

# In-memory storage (use Redis/DB in production)
otp_storage: Dict[str, dict] = {}
users_db: Dict[str, dict] = {
    "admin@turbineai.com": {"email": "admin@turbineai.com", "name": "Admin User"},
    "operator@turbineai.com": {"email": "operator@turbineai.com", "name": "Operator"},
    "demo@example.com": {"email": "demo@example.com", "name": "Demo User"},
}

# ML Model storage
ml_model: Optional[RandomForestRegressor] = None
scaler: Optional[StandardScaler] = None
model_accuracy: float = 0.0

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


# =============================================================================
# SENSOR DATA GENERATION
# =============================================================================

def generate_sensor_dataset() -> pd.DataFrame:
    """Generate synthetic sensor data for multiple machines"""
    np.random.seed(42)
    machines = [f"M{i:03d}" for i in range(1, 51)]
    data = []
    
    for machine_id in machines:
        # Each machine has different baseline characteristics
        base_temp = np.random.uniform(40, 60)
        base_vib = np.random.uniform(0.3, 0.8)
        base_current = np.random.uniform(8, 14)
        degradation = np.random.uniform(0, 1)  # How degraded the machine is
        
        # Generate 100 time points per machine
        for t in range(100):
            # Simulate gradual degradation
            time_factor = t / 100
            degrade = degradation * time_factor
            
            temp = base_temp + degrade * 50 + np.random.normal(0, 2)
            vib = base_vib + degrade * 5 + np.random.normal(0, 0.1)
            current = base_current + degrade * 20 + np.random.normal(0, 1)
            
            # Calculate RUL based on sensor readings
            rul = max(0, 100 - (temp - 45) * 1.2 - vib * 8 - (current - 10) * 2)
            rul = min(100, rul + np.random.normal(0, 3))
            
            data.append({
                "machine_id": machine_id,
                "timestamp": datetime.now() - timedelta(hours=100-t),
                "temperature": round(temp, 2),
                "vibration": round(vib, 3),
                "current": round(current, 2),
                "rul": round(max(0, min(100, rul)), 1)
            })
    
    return pd.DataFrame(data)


# Generate dataset on startup
sensor_df = generate_sensor_dataset()


# =============================================================================
# ML MODEL
# =============================================================================

def train_ml_model():
    """Train the Random Forest model for RUL prediction"""
    global ml_model, scaler, model_accuracy
    
    # Prepare features and target
    features = sensor_df[["temperature", "vibration", "current"]].values
    target = sensor_df["rul"].values
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        features, target, test_size=0.2, random_state=42
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model
    ml_model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1
    )
    ml_model.fit(X_train_scaled, y_train)
    
    # Calculate accuracy (R² score)
    model_accuracy = ml_model.score(X_test_scaled, y_test)
    print(f"Model trained with R² score: {model_accuracy:.4f}")


def predict_rul(temperature: float, vibration: float, current: float) -> dict:
    """Predict RUL and health status from sensor readings"""
    if ml_model is None or scaler is None:
        raise HTTPException(status_code=500, detail="Model not trained")
    
    # Prepare input
    features = np.array([[temperature, vibration, current]])
    features_scaled = scaler.transform(features)
    
    # Get prediction
    rul_prediction = ml_model.predict(features_scaled)[0]
    rul_prediction = max(0, min(100, rul_prediction))
    
    # Calculate health score
    health_score = rul_prediction
    
    # Determine status
    if health_score > 70:
        status = "healthy"
        risk_level = "low"
    elif health_score > 40:
        status = "warning"
        risk_level = "medium"
    else:
        status = "critical"
        risk_level = "high"
    
    # Predict days until failure (RUL to days conversion)
    # Assuming 100% health = 30 days, 0% = immediate failure
    days_until_failure = max(1, int(rul_prediction * 0.3))
    
    # Root cause analysis
    root_causes = []
    if temperature > 75:
        root_causes.append("Overheating detected")
    if vibration > 3.0:
        root_causes.append("Abnormal vibration patterns")
    if current > 25:
        root_causes.append("Electrical overload")
    if not root_causes:
        root_causes.append("Normal operation")
    
    return {
        "rul": round(rul_prediction, 1),
        "health_score": round(health_score, 1),
        "status": status,
        "risk_level": risk_level,
        "days_until_failure": days_until_failure,
        "root_causes": root_causes,
        "model_confidence": round(model_accuracy * 100, 1)
    }


# =============================================================================
# PYDANTIC MODELS
# =============================================================================

class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class PredictionRequest(BaseModel):
    temperature: float
    vibration: float
    current: float

class MachineQuery(BaseModel):
    machine_id: str


# =============================================================================
# EMAIL SERVICE
# =============================================================================

async def send_otp_email(email: str, otp: str):
    """Send OTP via email"""
    try:
        import aiosmtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        
        if not SMTP_USER or not SMTP_PASSWORD:
            print(f"[DEV MODE] OTP for {email}: {otp}")
            return
        
        msg = MIMEMultipart()
        msg["From"] = SMTP_USER
        msg["To"] = email
        msg["Subject"] = "TurbineAI - Your Login OTP"
        
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background: #1a1a2e; color: #fff; padding: 20px;">
            <div style="max-width: 500px; margin: 0 auto; background: #16213e; padding: 30px; border-radius: 10px;">
                <h1 style="color: #00d9ff; margin-bottom: 20px;">TurbineAI</h1>
                <h2 style="color: #fff;">Your Login Code</h2>
                <p style="font-size: 32px; font-weight: bold; color: #00d9ff; letter-spacing: 8px; text-align: center; padding: 20px; background: #0f3460; border-radius: 8px;">
                    {otp}
                </p>
                <p style="color: #aaa; margin-top: 20px;">This code expires in 5 minutes.</p>
                <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
            </div>
        </body>
        </html>
        """
        msg.attach(MIMEText(body, "html"))
        
        await aiosmtplib.send(
            msg,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
            start_tls=True
        )
        print(f"OTP sent to {email}")
    except Exception as e:
        print(f"Failed to send email: {e}")
        print(f"[FALLBACK] OTP for {email}: {otp}")


# =============================================================================
# AUTH HELPERS
# =============================================================================

def generate_otp() -> str:
    """Generate 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))

def create_access_token(data: dict) -> str:
    """Create JWT token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Verify JWT token"""
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# =============================================================================
# FASTAPI APP
# =============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    print("Training ML model...")
    train_ml_model()
    print("Server ready!")
    yield
    print("Shutting down...")

app = FastAPI(
    title="TurbineAI Predictive Maintenance API",
    description="AI-powered predictive maintenance for industrial machines",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", os.getenv("FRONTEND_URL", "*")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# AUTH ENDPOINTS
# =============================================================================

@app.post("/api/auth/request-otp")
async def request_otp(request: OTPRequest, background_tasks: BackgroundTasks):
    """Request OTP for login"""
    email = request.email.lower()
    
    # For demo, allow any email
    if email not in users_db:
        users_db[email] = {"email": email, "name": email.split("@")[0].title()}
    
    # Generate OTP
    otp = generate_otp()
    otp_storage[email] = {
        "otp": otp,
        "expires": datetime.utcnow() + timedelta(minutes=5),
        "attempts": 0
    }
    
    # Send OTP email in background
    background_tasks.add_task(send_otp_email, email, otp)
    
    return {
        "message": "OTP sent successfully",
        "email": email,
        "expires_in": 300  # 5 minutes in seconds
    }

@app.post("/api/auth/verify-otp", response_model=TokenResponse)
async def verify_otp(request: OTPVerify):
    """Verify OTP and return JWT token"""
    email = request.email.lower()
    
    if email not in otp_storage:
        raise HTTPException(status_code=400, detail="OTP not requested")
    
    stored = otp_storage[email]
    
    # Check expiration
    if datetime.utcnow() > stored["expires"]:
        del otp_storage[email]
        raise HTTPException(status_code=400, detail="OTP expired")
    
    # Check attempts
    if stored["attempts"] >= 3:
        del otp_storage[email]
        raise HTTPException(status_code=400, detail="Too many attempts")
    
    # Verify OTP
    if request.otp != stored["otp"]:
        stored["attempts"] += 1
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Success - remove OTP and create token
    del otp_storage[email]
    
    user = users_db.get(email, {"email": email, "name": "User"})
    token = create_access_token({"sub": email, "name": user["name"]})
    
    return TokenResponse(
        access_token=token,
        user=user
    )

@app.get("/api/auth/me")
async def get_current_user(payload: dict = Depends(verify_token)):
    """Get current user info"""
    email = payload.get("sub")
    user = users_db.get(email, {"email": email, "name": "User"})
    return user


# =============================================================================
# MACHINE DATA ENDPOINTS
# =============================================================================

@app.get("/api/machines")
async def list_machines(payload: dict = Depends(verify_token)):
    """List all machines"""
    machines = sensor_df.groupby("machine_id").agg({
        "temperature": "last",
        "vibration": "last",
        "current": "last",
        "rul": "last"
    }).reset_index()
    
    result = []
    for _, row in machines.iterrows():
        prediction = predict_rul(row["temperature"], row["vibration"], row["current"])
        result.append({
            "machine_id": row["machine_id"],
            "latest_readings": {
                "temperature": row["temperature"],
                "vibration": row["vibration"],
                "current": row["current"]
            },
            "health": prediction
        })
    
    return result

@app.get("/api/machines/{machine_id}")
async def get_machine(machine_id: str, payload: dict = Depends(verify_token)):
    """Get machine details and sensor history"""
    machine_id = machine_id.upper()
    machine_data = sensor_df[sensor_df["machine_id"] == machine_id]
    
    if machine_data.empty:
        raise HTTPException(status_code=404, detail=f"Machine {machine_id} not found")
    
    # Get latest readings
    latest = machine_data.iloc[-1]
    
    # Get prediction
    prediction = predict_rul(latest["temperature"], latest["vibration"], latest["current"])
    
    # Get sensor history (last 50 readings)
    history = machine_data.tail(50).to_dict(orient="records")
    for record in history:
        record["timestamp"] = record["timestamp"].isoformat()
    
    return {
        "machine_id": machine_id,
        "latest_readings": {
            "temperature": latest["temperature"],
            "vibration": latest["vibration"],
            "current": latest["current"],
            "timestamp": latest["timestamp"].isoformat()
        },
        "health": prediction,
        "history": history
    }

@app.get("/api/machines/{machine_id}/history")
async def get_machine_history(machine_id: str, limit: int = 100, payload: dict = Depends(verify_token)):
    """Get machine sensor history"""
    machine_id = machine_id.upper()
    machine_data = sensor_df[sensor_df["machine_id"] == machine_id]
    
    if machine_data.empty:
        raise HTTPException(status_code=404, detail=f"Machine {machine_id} not found")
    
    history = machine_data.tail(limit).to_dict(orient="records")
    for record in history:
        record["timestamp"] = record["timestamp"].isoformat()
    
    return history


# =============================================================================
# PREDICTION ENDPOINTS
# =============================================================================

@app.post("/api/predict")
async def predict(request: PredictionRequest, payload: dict = Depends(verify_token)):
    """Run ML prediction on sensor data"""
    return predict_rul(request.temperature, request.vibration, request.current)

@app.get("/api/model/status")
async def model_status():
    """Get ML model status"""
    return {
        "trained": ml_model is not None,
        "accuracy": round(model_accuracy * 100, 2),
        "features": ["temperature", "vibration", "current"],
        "algorithm": "Random Forest Regressor",
        "n_estimators": 100
    }


# =============================================================================
# ALERTS ENDPOINTS
# =============================================================================

@app.get("/api/alerts")
async def get_alerts(payload: dict = Depends(verify_token)):
    """Get all active alerts"""
    alerts = []
    
    # Check each machine
    machines = sensor_df.groupby("machine_id").last().reset_index()
    
    for _, row in machines.iterrows():
        prediction = predict_rul(row["temperature"], row["vibration"], row["current"])
        
        if prediction["status"] != "healthy":
            alerts.append({
                "machine_id": row["machine_id"],
                "severity": prediction["risk_level"],
                "status": prediction["status"],
                "health_score": prediction["health_score"],
                "days_until_failure": prediction["days_until_failure"],
                "root_causes": prediction["root_causes"],
                "message": f"Machine {row['machine_id']} likely to fail within {prediction['days_until_failure']} days. Schedule maintenance.",
                "timestamp": datetime.utcnow().isoformat()
            })
    
    # Sort by severity
    severity_order = {"high": 0, "medium": 1, "low": 2}
    alerts.sort(key=lambda x: severity_order.get(x["severity"], 3))
    
    return alerts


# =============================================================================
# DASHBOARD STATS
# =============================================================================

@app.get("/api/dashboard/stats")
async def dashboard_stats(payload: dict = Depends(verify_token)):
    """Get dashboard statistics"""
    machines = sensor_df.groupby("machine_id").last().reset_index()
    
    healthy_count = 0
    warning_count = 0
    critical_count = 0
    total_health = 0
    
    for _, row in machines.iterrows():
        prediction = predict_rul(row["temperature"], row["vibration"], row["current"])
        total_health += prediction["health_score"]
        
        if prediction["status"] == "healthy":
            healthy_count += 1
        elif prediction["status"] == "warning":
            warning_count += 1
        else:
            critical_count += 1
    
    return {
        "total_machines": len(machines),
        "healthy": healthy_count,
        "warning": warning_count,
        "critical": critical_count,
        "average_health": round(total_health / len(machines), 1),
        "model_accuracy": round(model_accuracy * 100, 1)
    }


# =============================================================================
# RUN SERVER
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
