import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Style/Cart.css";
import { FaTrash } from "react-icons/fa";
import axios from "axios";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [discountedTotal, setDiscountedTotal] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showCoupons, setShowCoupons] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);



  const fetchCart = async () => {
    const token = localStorage.getItem("jwtToken");
    try {
      const response = await axios.get("http://localhost:5005/api/cartdata", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCart(response.data.cart);
      calculateTotal(response.data.cart);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      setIsLoggedIn(true);
      fetchCart();
      fetchCoupons();
    } else {
      setIsLoggedIn(false);
    }
  }, []);
  

  const fetchCoupons = async () => {
    try {
      const response = await axios.get("http://localhost:5005/api/coupons");
      setCoupons(response.data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  const calculateTotal = (cartItems) => {
    const totalPrice = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setTotal(totalPrice);
    setDiscountedTotal(null);
    setSelectedCoupon(null);
  };

  const removeItem = async (id) => {
    const token = localStorage.getItem("jwtToken");
    try {
      await axios.delete(`http://localhost:5005/api/remove/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleQuantityChange = async (id, quantity) => {
    const token = localStorage.getItem("jwtToken");
    try {
      await axios.put(
        `http://localhost:5005/api/update-quantity/${id}`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const applyCoupon = (coupon) => {
    if (total >= parseFloat(coupon.min_cart_value)) {
      setSelectedCoupon(coupon);
      let discount = 0;

      if (coupon.type === "fixed") {
        discount = parseFloat(coupon.value);
      } else if (coupon.type === "percentage") {
        discount = (total * parseFloat(coupon.value)) / 100;
      }

      const newTotal = total - discount;
      setDiscountedTotal(newTotal);
      setShowCoupons(false);
    } else {
      alert(
        `Cart total must be at least $${coupon.min_cart_value} to use this coupon.`
      );
    }
  };

  useEffect(() => {
    fetchCart();
    fetchCoupons();
  }, []);

  return (
    <div className="container bg-light py-4">
      <div className="bg-white rounded p-4 shadow">
        <div className="col-12">
          <p className="text-dark review fw-bold">Review Your Order</p>
          <hr />

          {!isLoggedIn ? (
  <p className="text-danger">Please login. Your cart is empty.</p>
) : cart.length === 0 ? (
  <p className="text-muted">Your cart is empty.</p>
) : (
            cart.map((item, index) => (
              <div className="row align-items-center mb-3" key={index}>
                <div className="col-4 d-flex">
                  <img
                    src={
                      item.image
                        ? `http://localhost:5005/${item.image}`
                        : "https://via.placeholder.com/100"
                    }
                    alt={item.name}
                    className="img-fluid rounded"
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                  />
                  <div className="px-4">
                    <p className="text-dark">{item.name}</p>
                    <div className="d-flex align-items-center">
  {item.color ? (
    <>
      <div
        style={{
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          backgroundColor: item.color,
          border: "1px solid #ccc",
          marginRight: "8px"
        }}
      ></div>
      <span className="text-dark">{item.color}</span>
    </>
  ) : (
    <span className="text-muted">Color N/A</span>
  )}
  <span className="mx-2">•</span>
  <span className="text-dark">Size: {item.size || "N/A"}</span>
</div>

                    <div className="d-flex align-items-center">
                      <span className="me-2 text-dark">Qty:</span>
                      <select
                        className="form-select form-select-sm w-auto"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(item.id, parseInt(e.target.value))
                        }
                      >
                        {[...Array(10).keys()].map((num) => (
                          <option key={num + 1} value={num + 1}>
                            {num + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="col-8 d-flex justify-content-end">
                  <div className="d-flex flex-column justify-content-end align-items-end">
                    <p className="text-dark fw-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <FaTrash
                      style={{ color: "orange", cursor: "pointer" }}
                      onClick={() => removeItem(item.id)}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Subtotal */}
        <div className="col-12 pt-4">
          <div className="row align-items-center">
            <div className="col-6">
              <p className="text-dark">Subtotal</p>
              <p className="text-muted">
                Shipping and taxes calculated at checkout.
              </p>
              {selectedCoupon && (
                <p className="text-success">
                  Applied Coupon: <strong>{selectedCoupon.code}</strong> (
                  {selectedCoupon.type === "fixed"
                    ? `$${selectedCoupon.value}`
                    : `${selectedCoupon.value}%`}{" "}
                  off)
                </p>
              )}
            </div>
            <div className="col-6 text-end justify-content-end">
              {discountedTotal !== null ? (
                <>
                  <div className="text-dark text-decoration-line-through">
                    ${total.toFixed(2)}
                  </div>
                  <div className="text-danger fw-bold">
                    ${Math.abs(total - discountedTotal).toFixed(2)} off
                  </div>
                  <div className="text-dark fw-bold">
                    ${discountedTotal.toFixed(2)}
                  </div>
                </>
              ) : (
                <p className="text-dark fw-bold">
                  ${total.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Coupon Input + Show Coupons */}
          <div className="mt-4">
            <h5 className="fw-bold text-dark">Apply Coupon</h5>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Enter coupon code"
                value={selectedCoupon ? selectedCoupon.code : ""}
                readOnly
              />
              {selectedCoupon ? (
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    setSelectedCoupon(null);
                    setDiscountedTotal(null);
                  }}
                >
                  Remove
                </button>
              ) : (
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setShowCoupons(!showCoupons)}
                >
                  {showCoupons ? "Hide Coupons" : "Show Coupons"}
                </button>
              )}
            </div>

            {/* Coupon List */}
            {showCoupons && coupons.length > 0 && (
              <div className="coupon-list">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="border p-2 mb-2 rounded d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <p className="mb-0 fw-bold">
                        {coupon.code} -{" "}
                        {coupon.type === "fixed"
                          ? `$${coupon.value}`
                          : `${coupon.value}% off`}
                      </p>
                      <small className="text-muted">{coupon.description}</small>
                      <br />
                      <small>Min Cart Value: ${coupon.min_cart_value}</small>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => applyCoupon(coupon)}
                      disabled={!!selectedCoupon}
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col-12 mt-4">
          <button className="btn btn-warning w-100 py-2 fw-bold" disabled={!isLoggedIn || cart.length === 0}>
  Proceed to Checkout
</button>

            <div className="text-center mt-3">
              <a href="#" className="text-decoration-none">
                or <span className="text-warning">Continue Shopping</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
