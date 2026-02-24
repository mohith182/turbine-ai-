# TurbineAI - Predictive Maintenance Dashboard (MOS101)

AI-Powered Predictive Maintenance Dashboard that monitors industrial machines and predicts failures 7-14 days in advance using machine learning.

## Features

- **OTP Email Authentication** - Secure login with email-based OTP verification
- **Machine Search** - Search and monitor any machine by ID
- **Real-time Sensor Monitoring** - Live temperature, vibration, and current readings
- **ML Predictions** - Random Forest model predicts Remaining Useful Life (RUL)
- **Health Classification** - Green (Healthy), Yellow (Warning), Red (Critical)
- **Predictive Alerts** - Automatic alerts when machines approach failure
- **Root Cause Analysis** - Identifies overheating, overload, abnormal vibration
- **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

### Frontend
- Next.js 16 (React 19)
- TypeScript
- Tailwind CSS
- shadcn/ui components

### Backend
- Python FastAPI
- Scikit-learn (Random Forest Regressor)
- JWT Authentication
- SMTP Email Service

## Project Structure

```
turbine-ai/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            
│   ├── login-page.tsx     # OTP login flow
│   ├── main-dashboard.tsx # Dashboard with search, graphs, alerts
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── auth-context.tsx   # Authentication state
│   └── machine-context.tsx # Machine data state
├── backend/
│   ├── main.py            # FastAPI server
│   ├── requirements.txt   # Python dependencies
│   └── .env.example       # Environment template
└── .env.local             # Frontend environment
```

## Setup Instructions

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Setup Backend

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env  # Windows
cp .env.example .env    # macOS/Linux
```

### 3. Configure Email (Optional)

Edit `backend/.env` with your SMTP settings for real OTP emails:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
JWT_SECRET=your-secret-key
```

**Note:** For Gmail, enable 2FA and create an App Password at https://myaccount.google.com/apppasswords

If email is not configured, OTP codes will be printed in the backend console.

### 4. Start Backend Server

```bash
cd backend
python main.py
```

Backend runs at: http://localhost:8000

### 5. Start Frontend

```bash
npm run dev
```

Frontend runs at: http://localhost:3000

## Usage

1. Open http://localhost:3000
2. Enter any email address (e.g., demo@example.com)
3. Check backend console for the 6-digit OTP (if email not configured)
4. Enter OTP to login
5. Search for machines using IDs like M001, M025, M050
6. View health status, sensor readings, and predictive insights

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/request-otp` | POST | Request OTP for email |
| `/api/auth/verify-otp` | POST | Verify OTP and get token |
| `/api/machines` | GET | List all machines |
| `/api/machines/{id}` | GET | Get machine details |
| `/api/predict` | POST | Run ML prediction |
| `/api/alerts` | GET | Get active alerts |
| `/api/dashboard/stats` | GET | Get dashboard statistics |

## Health Classification

| Status | Health Score | Color | Action |
|--------|--------------|-------|--------|
| Healthy | > 70% | 🟢 Green | Continue monitoring |
| Warning | 40-70% | 🟡 Yellow | Schedule maintenance |
| Critical | < 40% | 🔴 Red | Immediate action |

## ML Model

- **Algorithm:** Random Forest Regressor
- **Features:** Temperature, Vibration, Current
- **Output:** Remaining Useful Life (RUL) percentage
- **Training:** Automated on server startup
- **Accuracy:** ~85-95% R² score

## License

MIT
