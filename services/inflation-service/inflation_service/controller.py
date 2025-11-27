from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from inflation_service.create_database import SessionLocal
from inflation_service.models import InflationData

from sqlalchemy import text

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/testdb")
def testdb(db: Session = Depends(get_db)):
    try:
        r = db.execute(text("SELECT 1")).fetchone()
        return {"ok": r[0]}
    except Exception as e:
        return {"error": str(e)}

@app.get("/")
def root():
    return {"ok": True}

@app.get("/countries")
def get_countries(db: Session = Depends(get_db)):
    rows = db.query(
        InflationData.country_name,
        InflationData.country_code
    ).group_by(
        InflationData.country_name, InflationData.country_code
    ).all()
    return {"countries": [{"name": n, "code": c} for n, c in rows]}

@app.get("/inflation/{country_code}")
def get_country_inflation(country_code: str, db: Session = Depends(get_db)):
    rows = (
        db.query(InflationData.year, InflationData.value)
        .filter(InflationData.country_code == country_code.upper())
        .order_by(InflationData.year.asc())
        .all()
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Country not found")
    return {
        "country": country_code.upper(),
        "data": [{"year": y, "value": v if v is not None else 0} for y, v in rows]
    }
