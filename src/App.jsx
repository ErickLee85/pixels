import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import MoviePage from './pages/MoviePage'
import PersonPage from './pages/PersonPage'
import './App.css'
import './pages/MoviePage.css'
import './pages/PersonPage.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/movie/:id" element={<MoviePage />} />
      <Route path="/person/:id" element={<PersonPage />} />
    </Routes>
  )
}

export default App
