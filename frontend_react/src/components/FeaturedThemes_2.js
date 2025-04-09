import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Style/feature.css"; // Custom styles

import tshirt from "../assets/tshirt.png";
import mugs from "../assets/mugs.png";
import phoneCase from "../assets/phone-case.png";
import caps from "../assets/caps.png";
import hoodies from "../assets/hoodies.png";

const designs = [
  { img: tshirt, title: "T-Shirts", desc: "Premium quality custom t-shirts", bg: "bg-light-pink" },
  { img: mugs, title: "Mugs", desc: "Personalized mugs for every occasion", bg: "bg-light-blue" },
  { img: phoneCase, title: "Phone Cases", desc: "Stylish custom phone protection", bg: "bg-light-green" },
  { img: caps, title: "Caps", desc: "Custom headwear for any style", bg: "bg-light-yellow" },
  { img: hoodies, title: "Hoodies", desc: "Cozy custom hoodies", bg: "bg-light-purple" },
];

const FeaturedThemes_2 = () => {
  return (
    <div className="container mt-4">
      <div className="row justify-content-center gap-5 mt-4 pt-4 pb-4"> {/* Added gap- for spacing */}
        {designs.map((design, index) => (
          <div key={index} className="col-lg-2 col-md-4 col-sm-6 d-flex justify-content-center">
            <div className={`design-card ${design.bg} px-3 w-100 text-start rounded shadow-sm`}>
              <div className="design-image">
                <img src={design.img} alt={design.title} className="img-fluid" />
              </div>
              <h5 className="mt-3 fw-bold">{design.title}</h5>
              <p className="text-muted">{design.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedThemes_2;
