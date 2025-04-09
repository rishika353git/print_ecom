import { useState, useEffect, useRef } from "react";
import { FaUpload, FaUndo, FaRedo } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Process = () => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]); // Combine merchandise and accessories
  const [visibleProducts, setVisibleProducts] = useState(3); // Show 3 products at a time
  const [currentOffset, setCurrentOffset] = useState(0); // Offset for paginated products
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const fileInputRef = useRef(null);
  const [mergedImagePath, setMergedImagePath] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetching merchandise products
        const merchandiseResponse = await fetch("http://localhost:5005/api/merchandise");
        const merchandiseData = await merchandiseResponse.json();

        // Fetching accessories products
        const accessoriesResponse = await fetch("http://localhost:5005/api/accessories-customize");
        const accessoriesData = await accessoriesResponse.json();

        // Merge both arrays
        const combinedProducts = [...merchandiseData, ...accessoriesData].map((product) => ({
          ...product,
          variants: product.variants?.map((variant) => ({
            ...variant,
            sizes: JSON.parse(variant.sizes || "[]"),
          })),
        }));

        setProducts(combinedProducts);

        // Set default product for preview
        if (combinedProducts.length > 0) {
          setSelectedProduct(combinedProducts[0]);
          const firstVariant = combinedProducts[0].variants?.[0] || null;
          setSelectedColor(firstVariant?.color || null);
          setSelectedSize(firstVariant?.sizes?.[0] || null);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);


  const handleDoneClick = async () => {
    if (!uploadedImage || !selectedProduct) {
      alert("Please upload an image first!");
      return;
    }
  
    const selectedVariant = selectedProduct.variants.find((v) => v.color === selectedColor);
    const baseImageUrl = `http://localhost:5005/uploads/${selectedVariant?.image}`;
  
    const canvas = document.getElementById("mergeCanvas");
    const ctx = canvas.getContext("2d");
  
    const baseImg = new Image();
    const uploadedImg = new Image();
  
    baseImg.crossOrigin = "Anonymous";
    uploadedImg.crossOrigin = "Anonymous";
  
    baseImg.src = baseImageUrl;
    uploadedImg.src = uploadedImage;
  
    baseImg.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);
  
      uploadedImg.onload = () => {
        const designWidth = 200;
        const designHeight = 200;
        const x = (canvas.width - designWidth) / 2;
        const y = (canvas.height - designHeight) / 2;
  
        ctx.drawImage(uploadedImg, x, y, designWidth, designHeight);
  
        const mergedDataUrl = canvas.toDataURL("image/png");
        const mergedFile = dataURLtoFile(mergedDataUrl, "merged.png");
  
        const formData = new FormData();
        formData.append("image", mergedFile);
        formData.append("product_id", selectedProduct.id);
  
        const token = localStorage.getItem("jwtToken");
  
        fetch("http://localhost:5005/api/upload-merged-image", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })
          .then((res) => res.json())
          .then((data) => {
            alert("Merged image uploaded successfully!");
            console.log("Saved image:", data.image_url);
            setMergedImagePath(data.image_url); // 🔥 Store for use in Add to Cart
          })
          .catch((err) => {
            console.error("Upload error:", err);
            alert("Something went wrong");
          });
      };
    };
  };
  
  
  
  
  
  
  // Convert Base64 image to File
  const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };
  
  

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
  
      if (!token) {
        alert("You must be logged in to add to cart.");
        return;
      }
  
      // Decode token to extract user_id (Assuming token payload contains user_id)
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(atob(base64Payload));
      const user_id = payload.user_id;
  
      const selectedVariant = selectedProduct.variants.find(
        (variant) => variant.color === selectedColor
      );
  
      const cartData = {
        user_id: user_id, // number
        product_code: selectedProduct.product_code, // string
        name: selectedProduct.name, // string
        price: selectedProduct.price, // number or string
        original_price: selectedProduct.original_price, // number or string
        quantity: quantity, // number
        color: selectedColor, // string
        size: selectedSize, // string
        image: mergedImagePath || selectedVariant?.image || "", // merged image path takes priority

      };
  
      console.log("Sending to /api/cart:", cartData);
  
      const response = await fetch("http://localhost:5005/api/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cartData),
      });
  
      const result = await response.json();

      if (!response.ok) {
        if (result.message === "Invalid token.") {
          setAlertMessage("Please login first.");
        } else {
          setAlertMessage("Add to cart failed. Please try again.");
        }
        return;
      }

      console.log("Cart API response:", result);
      alert(`Cart added: ${JSON.stringify(result, null, 2)}`);
      navigate("/cart");
    } catch (error) {
      console.error("Add to cart error:", error);
      alert("Add to cart failed.");
    }
  };
  
  
  
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHistory([...history, uploadedImage]); // Save history before updating
        setUploadedImage(reader.result);
        setRedoStack([]); // Clear redo stack
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      setRedoStack([uploadedImage, ...redoStack]);
      setUploadedImage(history[history.length - 1]);
      setHistory(history.slice(0, -1));
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      setHistory([...history, uploadedImage]);
      setUploadedImage(redoStack[0]);
      setRedoStack(redoStack.slice(1));
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    const firstVariant = product.variants?.[0] || null;
    setSelectedColor(firstVariant?.color || null);
    setSelectedSize(firstVariant?.sizes?.[0] || null);
  };

  const showNextProducts = () => {
    setCurrentOffset((prevOffset) => Math.min(prevOffset + visibleProducts, products.length - visibleProducts));
  };

  const showPreviousProducts = () => {
    setCurrentOffset((prevOffset) => Math.max(prevOffset - visibleProducts, 0));
  };

  const renderProducts = () => {
    return products.slice(currentOffset, currentOffset + visibleProducts).map((product) => (
      <div key={product.id} className="card mb-3 product-card" onClick={() => handleProductSelect(product)}>
        <div className="card-body text-center">
          <img
            src={`http://localhost:5005/uploads/${product.variants?.[0]?.image || "default.jpg"}`}
            alt={product.name}
            className="img-fluid"
            style={{ maxHeight: "150px" }}
          />
          <p>{product.name}</p>
        </div>
      </div>
    ));
  };

  return (
    <div className="container py-4">
      {alertMessage && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          {alertMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setAlertMessage("")}
            aria-label="Close"
          ></button>
        </div>
      )}
      <div className="row">
        {/* Left Column - Product Selection */}
        <div className="col-md-3">
          <h4 className="mb-4">Select Product</h4>

          {/* Render Combined Products */}
          {renderProducts()}

          {/* Navigation buttons */}
          <div className="d-flex justify-content-between mt-3">
            <button className="btn btn-secondary" onClick={showPreviousProducts} disabled={currentOffset === 0}>
              Previous 3
            </button>
            <button className="btn btn-secondary" onClick={showNextProducts} disabled={currentOffset + visibleProducts >= products.length}>
              Next 3
            </button>
          </div>
        </div>



        {/* Middle Column - Product Preview */}
        <div className="col-md-6 mt-5 pt-2">
          <div className="card p-4 bg-light text-center position-relative">
            {selectedProduct ? (
              <div className="position-relative">
                <img
                  src={`http://localhost:5005/uploads/${selectedProduct?.variants?.find(variant => variant.color === selectedColor)?.image || "default.jpg"}`}
                  alt={selectedProduct?.name}
                  className="img-fluid d-block mx-auto"
                  style={{ maxHeight: "400px" }}
                />
                {/* Upload Box with Dotted Border */}
                <div
                  className="position-absolute d-flex align-items-center justify-content-center"
                  style={{
                    width: "100px",
                    height: "100px",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    border: "2px dashed gray",
                    cursor: "pointer",
                    zIndex: 10,
                  }}
                  onClick={handleUploadClick}
                >
                  {uploadedImage ? (
                    <img
                      src={uploadedImage}
                      alt="Uploaded Design"
                      className="img-fluid"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <FaUpload size={30} color="gray" />
                  )}
                </div>
              </div>
            ) : (
              <p>Select a product to preview</p>
            )}
          </div>


          <canvas id="mergeCanvas" style={{ display: "none" }} width="500" height="500" />

          {/* Upload, Undo, Redo Buttons */}
          <div className="d-flex justify-content-center gap-3 mt-3">
            <button className="btn btn-secondary" onClick={handleUndo} disabled={!history.length}>
              <FaUndo /> Undo
            </button>
            <button className="btn btn-secondary" onClick={handleRedo} disabled={!redoStack.length}>
              <FaRedo /> Redo
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="d-none"
              onChange={handleFileChange}
            />
          </div>

          <div className="d-flex justify-content-center gap-3 mt-3">
          <button className="btn btn-secondary" onClick={handleDoneClick}>
  Done
</button>



            
          </div>
        </div>

        {/* Right Column - Customize Options */}
        <div className="col-md-3 mt-5 pt-2">
  <h4 className="mb-3">Customize Options</h4>

  {/* Price Display */}
  <div className="mb-3">
    <h5 className="text-muted">
      <del>${selectedProduct?.original_price}</del>
    </h5>
    <h4 className="text-danger fw-bold">${selectedProduct?.price}</h4>
  </div>

  {/* Color Customization */}
  <div className="mb-3">
    <label className="form-label">Color</label>
    <div className="d-flex gap-2">
      {selectedProduct?.variants?.map((variant, index) => (
        <div
          key={index}
          className="rounded-circle border p-2"
          style={{
            backgroundColor: variant.color?.toLowerCase(),
            width: "30px",
            height: "30px",
            cursor: "pointer",
          }}
          onClick={() => setSelectedColor(variant.color)}
        />
      ))}
    </div>
  </div>

  {/* Sizes */}
  {selectedColor &&
    selectedProduct?.variants?.find((variant) => variant.color === selectedColor)?.sizes?.length > 0 && (
      <div className="mb-3">
        <label className="form-label">Size</label>
        <select
          className="form-select"
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
        >
          {selectedProduct?.variants
            .find((variant) => variant.color === selectedColor)
            ?.sizes?.map((size, index) => (
              <option key={index} value={size}>
                {size}
              </option>
            ))}
        </select>
      </div>
    )}

  {/* Quantity */}
  <div className="mb-3">
    <label className="form-label">Quantity</label>
    <div className="input-group">
      <button
        className="btn btn-outline-secondary"
        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
      >
        -
      </button>
      <input type="text" className="form-control text-center" value={quantity} readOnly />
      <button
        className="btn btn-outline-secondary"
        onClick={() => setQuantity((prev) => prev + 1)}
      >
        +
      </button>
    </div>
  </div>

  <button className="btn btn-warning w-100" onClick={handleAddToCart}>
  Add to Cart
</button>

</div>


      </div>
    </div>
  );
};

export default Process;
