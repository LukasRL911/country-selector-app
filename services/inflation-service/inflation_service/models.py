from sqlalchemy import Column, Integer, String, Float
from inflation_service.create_database import Base

class InflationData(Base):
    __tablename__ = "INFLATION_DATA"

    id = Column(Integer, primary_key=True, index=True)
    country_name = Column("COUNTRY_NAME_VARIABLE", String, index=True)
    country_code = Column("COUNTRY_CODE_VARIABLE", String, index=True)
    year = Column("YEAR_OF_DATA_VARIABLE", Integer, index=True)
    value = Column("ANNUAL_INFLATION_VARIABLE", Float)
