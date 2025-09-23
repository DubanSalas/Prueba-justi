# app/config.py
#Este archivo debe contener las variables de entorno y la URI para SQLAlchemy:
import os
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

# Variables de conexión
DB_USER = os.getenv("DB_USER", "DUBAN")
DB_PASS = os.getenv("DB_PASS", "Admin12345")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "1521")
DB_SERVICE = os.getenv("DB_SERVICE", "XEPDB1")

# URI para SQLAlchemy con Oracle
ORACLE_URI = f'oracle+oracledb://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/?service_name={DB_SERVICE}'

# Desactivar seguimiento de modificaciones
SQLALCHEMY_TRACK_MODIFICATIONS = False
