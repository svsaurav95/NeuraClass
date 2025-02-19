import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "./components/Login/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Header from "./components/Header/Header";
import HeroSection from "./components/Herosection/Herosection";
import Dashboard from "./components/Dashboard/Dashboard";
import Testimonials from "./components/Testimonials/Testimonials";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import About from "./components/About/About";  // New Page
import Contact from "./components/Contact/Contact"; // New Page
import Features from "./components/Features/Features"; // New Page

function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("User state changed:", currentUser);
      setUser(currentUser || null);
    });

    return () => unsubscribe();
  }, []);

  if (user === undefined) return <div>Loading...</div>; // Show a loading message while auth state is being determined

  return (
    <Router>
      <AppContent user={user} />
    </Router>
  );
}

function AppContent({ user }) {
  const location = useLocation();
  const showHeader = location.pathname !== "/dashboard"; // Hide header on Dashboard

  return (
    <>
      {showHeader && <Header user={user} />}
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/about" element={<About />} /> {/* New Route */}
        <Route path="/contact" element={<Contact />} /> {/* New Route */}
        <Route path="/features" element={<Features />} /> {/* New Route */}
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      </Routes>
    </>
  );
}

export default App;
