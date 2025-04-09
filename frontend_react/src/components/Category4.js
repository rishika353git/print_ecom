import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaStar, FaRegStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const itemsPerPage = 12;

const Category4 = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5005/api/product/category/4");

        // Ensure you access the products key in the response
        const data = response.data.products.map((item) => ({
          id: item.id,
          name: item.name,
          image: `http://localhost:5005/uploads/${item.images[0]}`,  
          price: parseFloat(item.price),
          originalPrice: parseFloat(item.price) * 1.2, 
          discount: 20,  
          rating: 4.5,  
          reviews: Math.floor(Math.random() * 200) + 50, 
        }));

        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const totalPages = Math.ceil(products.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {currentProducts.map((product) => (
          <div
            key={product.id}
            className="col-md-3 mb-4"
            onClick={() => navigate(`/products/detail1/${product.id}`)}
            style={{ cursor: "pointer" }}
          >
            <div className="card position-relative border-0 shadow-sm">
              {product.discount && (
                <span
                  className="position-absolute top-0 start-0 bg-danger text-white px-2 py-1"
                  style={{ fontSize: "12px", borderRadius: "5px 0px 10px 0px" }}
                >
                  -{product.discount}%
                </span>
              )}
              <img
                src={product.image}
                className="card-img-top"
                alt={product.name}
                style={{ height: "220px", objectFit: "cover" }}
              />
              <div className="card-body text-center">
                <h6 className="card-title">{product.name}</h6>
                <p className="card-text">
                  <strong>${product.price.toFixed(2)}</strong>{" "}
                  <span className="text-muted text-decoration-line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                </p>
                <div className="mb-2">
                  {Array.from({ length: 5 }, (_, i) =>
                    i < Math.floor(product.rating) ? (
                      <FaStar key={i} color="#ffc107" />
                    ) : (
                      <FaRegStar key={i} color="#ffc107" />
                    )
                  )}
                  <span className="ms-1 text-muted">({product.reviews})</span>
                </div>
                <button className="btn btn-warning w-100">Add to Cart</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <nav aria-label="Page navigation example">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
            >
              &laquo; Previous
            </button>
          </li>

          {[...Array(totalPages)].map((_, i) => (
            <li key={i} className="page-item">
              <button
                className={`page-link ${
                  currentPage === i + 1 ? "active" : ""
                }`}
                style={
                  currentPage === i + 1
                    ? { backgroundColor: "#8B5E3C", color: "white" }
                    : {}
                }
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            </li>
          ))}

          <li
            className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
          >
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next &raquo;
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Category4;
