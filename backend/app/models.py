from app import db

class Student(db.Model):
    __tablename__ = 'Students'  # Cambié el nombre de la tabla a 'students'

    identifier_Student = db.Column(db.Integer, primary_key=True)  # Identificador del estudiante
    name = db.Column(db.String(100), nullable=False)  # Nombre del estudiante
    email = db.Column(db.String(100), nullable=False)  # Correo del estudiante
    career = db.Column(db.String(50), nullable=False)  # Carrera del estudiante
    total_classes = db.Column(db.Integer, nullable=False)  # Total de clases
    absences = db.Column(db.Integer, nullable=False)  # Total de ausencias
    attendance_percentage = db.Column(db.Float, nullable=False)  # Porcentaje de asistencia
    asset = db.Column(db.String(1), nullable=False)  # Estado de activo (A/N)

    def __repr__(self):
        return f'<Student {self.name}>'
