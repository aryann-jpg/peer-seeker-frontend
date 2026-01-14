import Home from './pages/Home.jsx';
import { Routes, Route } from 'react-router';
import TutorProfile from './pages/TutorProfile.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import EditProfile from './pages/EditProfile.jsx';
import Profile from './pages/profile.jsx';
import Bookmarks from './pages/Bookmarks.jsx';
import Bookings from './pages/Bookings.jsx';
import './App.css';
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<PrivateRoute> <Home /> </PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tutor/:id" element={<TutorProfile />} />
        <Route path="/edit-profile" element={ <PrivateRoute> <EditProfile /> </PrivateRoute> } />
        <Route path="/profile" element={ <PrivateRoute> <Profile /> </PrivateRoute> } />
        <Route path="/bookmarks" element={ <PrivateRoute> <Bookmarks /> </PrivateRoute> } />
        <Route path="/bookings" element={ <PrivateRoute> <Bookings /> </PrivateRoute> } />
      </Routes>
    
    </>
  );
}

export default App;