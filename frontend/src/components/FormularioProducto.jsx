export default function FormularioProducto({ onSubmit, form, setForm }) {
  return (
    <div className="space-y-2">
      <input type="text" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
      <input type="number" placeholder="Precio" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
      <input type="text" placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
      <button onClick={onSubmit}>Guardar</button>
    </div>
  )
}