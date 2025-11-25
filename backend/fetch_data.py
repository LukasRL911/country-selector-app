import sqlite3
import requests

# 1️ Connect to (or create) the database
conn = sqlite3.connect('backend/inflation.db')
cursor = conn.cursor()

# 2️ Create table with unique constraint on country+year
cursor.execute('''
CREATE TABLE IF NOT EXISTS INFLATION_DATA (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    COUNTRY_NAME_VARIABLE TEXT,
    COUNTRY_CODE_VARIABLE TEXT,
    YEAR_OF_DATA_VARIABLE INTEGER,
    ANNUAL_INFLATION_VARIABLE REAL,
    UNIQUE(COUNTRY_CODE_VARIABLE, YEAR_OF_DATA_VARIABLE)
)
''')
conn.commit()
print("Database and table ready.")

# 3️ API setup
url = "https://api.worldbank.org/v2/country/all/indicator/FP.CPI.TOTL.ZG"
params = {"date": "1960:2025", "format": "json", "per_page": 1000, "page": 1}

# 4️ Loop through API pages and batch insert
while True:
    response = requests.get(url, params=params)
    metadata, records = response.json()

    batch = []
    for entry in records:
        batch.append((
            entry['country']['value'],
            entry['country']['id'],
            int(entry['date']),
            entry['value']
        ))

    # Bulk insert with IGNORE for duplicates
    cursor.executemany('''
    INSERT OR IGNORE INTO INFLATION_DATA
    (COUNTRY_NAME_VARIABLE, COUNTRY_CODE_VARIABLE, YEAR_OF_DATA_VARIABLE, ANNUAL_INFLATION_VARIABLE)
    VALUES (?, ?, ?, ?)
    ''', batch)

    print(f"Inserted page {params['page']} / {metadata['pages']}")

    if params['page'] >= metadata['pages']:
        break

    params['page'] += 1

# 5️ Commit and close
conn.commit()
conn.close()
print("Database fully updated (1960–2025) with batch inserts for speed.")
