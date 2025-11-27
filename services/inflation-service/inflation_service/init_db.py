# backend/init_db.py
from backend.create_database import Base, engine
from backend.models import InflationData

Base.metadata.create_all(bind=engine)
print("Tables created.")
