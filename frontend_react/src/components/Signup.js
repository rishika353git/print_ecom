import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import logo from "../../src/assets/Logo.png";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // 'success' or 'danger'

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignUp = async () => {
        if (!formData.fullName || !formData.email || !formData.password) {
            setMessage("All fields are required.");
            setMessageType("danger");
            return;
        }

        try {
            const res = await axios.post("http://localhost:5005/api/auth/signup", formData);
            setMessage(res.data.message);
            setMessageType("success");
            setTimeout(() => navigate("/login"), 1500); // redirect after a short delay
        } catch (error) {
            setMessage(error.response?.data?.message || "Signup failed.");
            setMessageType("danger");
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await axios.post("http://localhost:5005/api/auth/google-signup", {
                token: credentialResponse.credential,
            });
            setMessage(res.data.message);
            setMessageType("success");
            setTimeout(() => navigate("/login"), 1500);
        } catch (error) {
            setMessage(error.response?.data?.message || "Google signup failed.");
            setMessageType("danger");
        }
    };

    return (
        <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100">
            <GoogleOAuthProvider clientId="433149329367-5hfdauqg0d0gpr3pf727i554n26qn120.apps.googleusercontent.com">
                <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100">
                    <div className="text-center mb-4">
                        <img src={logo} alt="Logo" className="mb-2" style={{ width: "150px", height: "auto" }} />
                    </div>
                    <h2 className="text-center">Create an Account</h2>
                    <p className="text-center text-dark">
                        Already have an account?
                        <a href="#" style={{ color: "#BE6E02", textDecoration: "none" }} onClick={() => navigate("/login")}> Sign in</a>
                    </p>

                    {/* Alert Message */}
                    {message && (
                        <div className={`alert alert-${messageType} w-100 text-center`} role="alert" style={{ maxWidth: "400px" }}>
                            {message}
                        </div>
                    )}

                    <div className="w-100" style={{ maxWidth: "400px" }}>
                        <input type="text" name="fullName" className="form-control mb-3" placeholder="Full Name" onChange={handleChange} />
                        <input type="email" name="email" className="form-control mb-3" placeholder="Email address" onChange={handleChange} />
                        <input type="password" name="password" className="form-control mb-3" placeholder="Password" onChange={handleChange} />
                        <button className="btn w-100 mb-3" style={{ backgroundColor: "#BE6E02", color: "white" }} onClick={handleSignUp}>
                            Sign Up
                        </button>
                        <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => {
                            setMessage("Google login failed.");
                            setMessageType("danger");
                        }} />
                    </div>
                </div>
            </GoogleOAuthProvider>
        </div>
    );
};


export default Signup;
