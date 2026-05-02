from datetime import datetime

from fastapi import FastAPI


app = FastAPI(title="SMS Analytics", version="0.1.0")


@app.get("/health")
def health():
    return {"status": "ok", "service": "sms-analytics", "timestamp": datetime.utcnow().isoformat()}


@app.get("/insights/attendance")
def attendance_insights():
    return {
        "trend": "stable",
        "risk_students": ["Noah Patel"],
        "recommended_actions": [
            "Notify parent about repeated late arrivals",
            "Schedule counselor check-in",
        ],
    }


@app.get("/insights/finance")
def finance_insights():
    return {
        "overdue_accounts": 18,
        "collection_rate": 0.962,
        "next_action": "Prioritize reminders for balances older than 14 days",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
