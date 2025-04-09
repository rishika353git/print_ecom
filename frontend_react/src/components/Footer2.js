import React from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterestP } from "react-icons/fa";
import tshirt from "../assets/tshirt.png"; // Make sure this image is in the correct path
import "./Style/Footer2.css";

const Footer2 = () => {
  return (
    <footer className="footer2">
      <Container>
        <Row>
          {/* Left Section */}
          <Col md={3} sm={6} xs={12} className="footer2-about">
            <img src={tshirt} alt="Custom T-Shirts" className="footer2-image" />
            <p>Create unique custom merchandise that tells your story. Quality products, fast delivery, and exceptional service.</p>
          </Col>

          {/* Quick Links */}
          <Col md={3} sm={6} xs={12}>
            <h5>Quick Links</h5>
            <ul className="footer2-links">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Shipping Info</a></li>
            </ul>
          </Col>

          {/* Products */}
          <Col md={3} sm={6} xs={12}>
            <h5>Products</h5>
            <ul className="footer2-links">
              <li><a href="#">Custom T-Shirts</a></li>
              <li><a href="#">Custom Cups</a></li>
              <li><a href="#">Bulk Orders</a></li>
              <li><a href="#">Gift Cards</a></li>
            </ul>
          </Col>

          {/* Newsletter */}
          <Col md={3} sm={6} xs={12}>
            <h5>Newsletter</h5>
            <p>Subscribe for updates and exclusive offers</p>
            <Form className="footer2-form">
              <Form.Control type="email" placeholder="Your email" />
              <Button variant="warning">Subscribe</Button>
            </Form>
          </Col>
        </Row>

        {/* Footer Bottom Section */}
        <Row className="footer2-bottom">
          <Col md={6}>
            <p>© 2024 Custom Merchandise. All rights reserved.</p>
          </Col>
          <Col md={6} className="footer2-social">
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaPinterestP /></a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer2;
