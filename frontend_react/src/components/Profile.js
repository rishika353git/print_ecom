import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import './Style/Profile.css';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaVenus, FaIdCard, FaShieldAlt, FaRulerVertical, FaWeight } from 'react-icons/fa';
import { FiEdit } from 'react-icons/fi';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      setError('No token');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const userId = decoded.id;

      fetch(`http://localhost:5005/api/auth/profile/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then(response => {
          if (!response.ok) throw new Error('Failed to fetch profile');
          return response.json();
        })
        .then(data => setProfile(data.user))
        .catch(err => setError(err.message));
    } catch (err) {
      setError('Invalid token');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    window.location.reload();
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  if (error === 'No token') {
    return (
      <div className="error-message">
        <p>No token found. Please log in.</p>
        <button onClick={handleLoginRedirect} className="login-btn">Login</button>
      </div>
    );
  }

  if (error) return <div className="error-message">{error}</div>;
  if (!profile) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-card-container">
      <div className="profile-card-custom">
        <img className="profile-pic" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtXVyIMR7o6upYXFIPCqIv8KkxyUJs0q3WzQ&s" alt="Profile" />
        <div className="profile-details">
          <p><FaEnvelope /> {profile.full_name}</p>
          <p><FaEnvelope /> {profile.email}</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Profile;
