import React, { useEffect, useState } from "react";
import "./Style/Banner.css";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  const [banner, setBanner] = useState({ image: "", title: "", description: "" });

  useEffect(() => {
    fetch("http://localhost:5005/api/banner")
      .then((response) => response.json())
      .then((data) => {
        if (data.image && data.title && data.description) {
          setBanner(data);
        }
      })
      .catch((error) => console.error("Error fetching banner:", error));
  }, []);

  return (
    <div className="container-fluid pb-4">
      <section
        className="banner-section"
        style={{ backgroundImage: banner.image ? `url(${banner.image})` : "none" }}
      >
        <div className="container">
          <h1 className="fw-bold">
            {banner.title}
          </h1>
          <p className="lead my-4">
            {banner.description}
          </p>
          <button
            className="btn btn-lg p-4"
            onClick={() => navigate("/process")}
            aria-label="Start designing custom merchandise"
          >
            Start Designing →
          </button>
        </div>
      </section>
    </div>
  );
};

export default HeroSection;
