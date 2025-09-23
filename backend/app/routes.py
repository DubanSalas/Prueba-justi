from flask import Blueprint, request, jsonify
from .models import Student  # Cambié de Producto a Student
from . import db

estudiantes_bp = Blueprint('estudiantes', __name__)  # Cambié de 'productos' a 'estudiantes'

# Ruta para listar estudiantes
@estudiantes_bp.route('/Students', methods=['GET'])
def listar_estudiantes():
    nombre = request.args.get('nombre')
    if nombre:
        estudiantes = Student.query.filter(Student.name.ilike(f'%{nombre}%')).all()  # Buscamos por nombre
    else:
        estudiantes = Student.query.all()  # Si no se pasa un nombre, listamos todos los estudiantes
    return jsonify([{
        'identifier_Student': e.identifier_Student,
        'name': e.name,
        'email': e.email,
        'career': e.career,
        'total_classes': e.total_classes,
        'absences': e.absences,
        'attendance_percentage': e.attendance_percentage,
        'asset': e.asset
    } for e in estudiantes])

# Ruta para agregar un estudiante
@estudiantes_bp.route('/Students', methods=['POST'])
def agregar_estudiante():
    data = request.json
    nuevo = Student(
        name=data['name'],
        email=data['email'],
        career=data['career'],
        total_classes=data['total_classes'],
        absences=data['absences'],
        attendance_percentage=data['attendance_percentage'],
        asset=data['asset']
    )
    db.session.add(nuevo)
    db.session.commit()
    return jsonify({'mensaje': 'Estudiante agregado'}), 201

# Ruta para modificar un estudiante
@estudiantes_bp.route('/Students/<int:id>', methods=['PUT'])
def modificar_estudiante(id):
    data = request.json
    estudiante = Student.query.get_or_404(id)
    estudiante.name = data['name']
    estudiante.email = data['email']
    estudiante.career = data['career']
    estudiante.total_classes = data['total_classes']
    estudiante.absences = data['absences']
    estudiante.attendance_percentage = data['attendance_percentage']
    estudiante.asset = data['asset']
    db.session.commit()
    return jsonify({'mensaje': 'Estudiante modificado'})

# Ruta para eliminar un estudiante
@estudiantes_bp.route('/Students/<int:id>', methods=['DELETE'])
def eliminar_estudiante(id):
    estudiante = Student.query.get_or_404(id)
    db.session.delete(estudiante)
    db.session.commit()
    return jsonify({'mensaje': 'Estudiante eliminado'})
