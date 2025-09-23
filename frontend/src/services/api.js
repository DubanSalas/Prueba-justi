import axios from 'axios'

const api = axios.create({
  baseURL: 'https://bookish-spork-449w56p7wvpc7q9v-5000.app.github.dev/api', // o tu dominio en producción
})

export default api
