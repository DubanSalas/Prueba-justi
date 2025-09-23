# app/utils.py
# Este archivo puede contener funciones auxiliares como la prueba directa con oracledb:
import oracledb
from .config import DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_SERVICE

# Construir el DSN dinámicamente
dsn = f"{DB_HOST}:{DB_PORT}/{DB_SERVICE}"

def test_oracle_connection():
    try:
        # Conectar a la base de datos Oracle
        conn = oracledb.connect(
            user=DB_USER,
            password=DB_PASS,
            dsn=dsn
        )
        
        # Crear un cursor para ejecutar la consulta
        with conn.cursor() as cursor:
            # Cambié la tabla de 'productos' a 'students'
            cursor.execute("SELECT * FROM Students")
            rows = cursor.fetchall()
            
            # Imprimir el resultado
            print("Estudiantes encontrados:" if rows else "⚠️ No hay registros.")
            for row in rows:
                print(row)  # Muestra los resultados encontrados
        
    except oracledb.DatabaseError as e:
        error, = e.args
        print(f"❌ Error: {error.message}")
    finally:
        # Asegurarse de cerrar la conexión si está abierta
        if 'conn' in locals() and conn:
            conn.close()
