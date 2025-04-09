import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import axios from "axios";
import "./Style/ProductDetail.css";
import { useNavigate } from "react-router-dom";


const ProductDetail2 = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [similarProducts, setSimilarProducts] = useState([]);
  const navigate = useNavigate();

  

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5005/api/product/${id}`)
        .then(response => {
          setProduct(response.data);
          setSelectedColor(response.data.variants[0]?.color || "");
          setSelectedSize(response.data.variants[0]?.sizes[0] || "");
        })
        .catch(error => console.error("Error fetching product data:", error));
    }
  }, [id]);

  useEffect(() => {
    if (product) {
      fetchSimilarProducts(product.category, product.id);
    }
  }, [product]);

  const fetchSimilarProducts = (category, productId) => {
    axios.get(`http://localhost:5005/api/product/category/${category}`)
      .then(response => {
        const filteredProducts = response.data.products
          .filter(p => p.id !== productId)
          .sort((a, b) => b.id - a.id)
          .slice(0, 4);
  
        setSimilarProducts(filteredProducts);
      })
      .catch(error => console.error("Error fetching similar products:", error));
  };

  const handleColorClick = (color) => setSelectedColor(color);
  const handleSizeClick = (size) => setSelectedSize(size);


  
  const handleAddToCart = () => {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
      alert("Please login to add items to the cart.");
      return;
    }

    const selectedVariant = product.variants.find(
      (variant) => variant.color === selectedColor
    );

    const cartData = {
      product_code: product.product_code,
      name: product.name,
      price: product.price,
      original_price: product.original_price,
      quantity: quantity,
      color: selectedColor,
      size: selectedSize,
      image: selectedVariant?.image || product.images[0],
    };

    axios.post("http://localhost:5005/api/add", cartData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    .then(() => {
      alert("Item added to cart successfully!");
      navigate("/cart"); // 👈 navigate to cart
    })
    
    
    .catch((error) => {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart.");
    });
  };

  if (!product) {
    return <div className="text-center my-5">Loading...</div>;
  }

  const selectedVariant = product.variants.find(
    (variant) => variant.color === selectedColor
  );

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false
  };
  let displayImages = product.images || [];
  if (displayImages.length === 1) {
    displayImages = [...displayImages, displayImages[0]]; // Duplicate if only one image
  }

  return (
    <div className="container product-detail">
      <div className="row my-4">
        {/* Product Image Slider */}
        <div className="col-md-6">
        <Slider {...settings}>
            {displayImages.map((img, index) => (
              <div key={index} className="product-image">
                <img
                  src={`http://localhost:5005/uploads/${img}`}
                  alt={product.description}
                  className="img-fluid"
                />
              </div>
            ))}
          </Slider>
        </div>

        {/* Product Details */}
        <div className="col-md-6">
          <h2 className="product-title my-4">{product.name}</h2>
          <h2 className="product-title my-4">{product.description}</h2>
          <div className="product-price my-4">
            <span className="current-price">${product.price}</span>
            <span className="original-price text-muted ms-2" style={{ color: "red", textDecoration: "line-through" }}>
              ${product.original_price || "0.00"}
            </span>
          </div>

          {/* Color Selection */}
          <div className="color-selection my-4">
            <p className="text-dark">Color:</p>
            <div className="color-options d-flex">
              {product.variants.map((variant, index) => (
                <div
                  key={index}
                  className="color-circle mx-1"
                  style={{
                    backgroundColor: variant.color,
                    width: "40px",
                    height: "40px",
                    border: selectedColor === variant.color ? "3px solid #000" : "1px solid #ccc",
                    cursor: "pointer"
                  }}
                  onClick={() => handleColorClick(variant.color)}
                ></div>
              ))}
            </div>
          </div>


          {/* Size Selection */}
          <div className="size-selection my-4">
  <p className="text-dark">Size:</p>
  <div className="row g-2">
    {selectedVariant?.sizes.map((size, index) => (
      <div key={index} className="col-3">
        <div
          className={`size-box p-2 border text-center ${selectedSize === size ? "bg-warning text-dark" : "bg-light"}`}
          style={{ cursor: "pointer" }}
          onClick={() => handleSizeClick(size)}
        >
          {size}
        </div>
      </div>
    ))}
  </div>
</div>



          {/* Quantity and Add to Cart */}
          <div className="row align-items-center my-4">
            <div className="col-3 bg-light border d-flex justify-content-around align-items-center p-2">
              <button className="btn bg-light text-dark" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span className="quantity bg-white">{quantity}</span>
              <button className="btn bg-light text-dark" onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            <div className="col-9">
              <button className="btn btn-warning w-100 p-3 fw-bold" onClick={handleAddToCart}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products Section */}
      <h3 className="my-4">Similar Products</h3>
      <div className="row">
        {similarProducts.map((item) => (
          <div key={item.id} className="col-md-3 mb-4">
            <div className="card">
              <Link to={`/products/detail1/${item.id}`}>
                <img src={`http://localhost:5005/uploads/${item.images[0]}`} alt={item.description} className="card-img-top" />
              </Link>
              <div className="card-body">
                <h5 className="card-title">{item.name}</h5>
                <p className="card-text">${item.price}</p>
                <Link to={`/products/detail1/${item.id}`}>
                  <button className="btn btn-warning w-100">View Product</button>
                </Link>  
              </div>        
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductDetail2;

