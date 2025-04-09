import React, { useState, useEffect } from "react";
import axios from "axios";

const Stock_4 = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    original_price: "",
    quantity: "",
    colors: [{ color: "#000000" }],
    images: [],
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:5005/api/categories");
        if (Array.isArray(response.data.categories)) {
          setCategories(response.data.categories);
        } else {
          console.error("Invalid data format:", response.data);
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prevState) => ({
      ...prevState,
      images: [...prevState.images, ...files],
    }));
  };

  const handleColorChange = (index, value) => {
    const updatedColors = [...formData.colors];
    updatedColors[index].color = value;
    setFormData({ ...formData, colors: updatedColors });
  };

  const addColor = () => {
    setFormData({ ...formData, colors: [...formData.colors, { color: "" }] });
  };

  const removeColor = (index) => {
    const updatedColors = formData.colors.filter((_, i) => i !== index);
    setFormData({ ...formData, colors: updatedColors });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    if (formData.colors.length !== formData.images.length) {
      setValidationError("Please upload the same number of images as the number of selected colors.");
      return;
    }
  
    setLoading(true);
    

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("price", formData.price);
    data.append("original_price", formData.original_price);
    data.append("quantity", formData.quantity);
    data.append("colors", JSON.stringify(formData.colors));

    formData.images.forEach((image) => {
      data.append("files", image);
    });

    try {
      const response = await axios.post(
        "http://localhost:5005/api/accessories-customize",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("API Response:", response.data);
      alert("Accessory added successfully!");
      setFormData({
        name: "",
        description: "",
        category: "",
        price: "",
        quantity: "",
        original_price: "",
        colors: [{ color: "#000000" }],
        images: [],
      });
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert("Failed to add accessory. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid mt-4 col-11 mx-auto">

{validationError && (
  <div className="alert alert-danger" role="alert">
    {validationError}
  </div>
)}

      <div className="card p-4 shadow border">
        <h2 className="fw-bold text-center text-primary mb-4">Add Accessory</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="mb-3">
            <label className="form-label fw-bold text-primary">Product Name</label>
            <input
              name="name"
              className="form-control"
              placeholder="Enter product name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold text-primary">Description</label>
            <textarea
              name="description"
              className="form-control"
              rows="3"
              placeholder="Enter description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mb-3">
  <label className="form-label fw-bold text-primary">Product Category</label>
  <select
    name="category"
    className="form-control"
    value={formData.category}
    onChange={handleInputChange}
    required
  >
    <option value="">Select Category</option>
    {categories
      .filter((cat) => cat.id === 2 || cat.id === 6|| cat.id === 8)
      .map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
  </select>
</div>


          <div className="mb-3">
            <label className="form-label fw-bold text-primary">Price ($)</label>
            <input
              type="number"
              name="price"
              className="form-control"
              placeholder="Enter product price"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold text-primary">Original Price ($)</label>
            <input
              type="number"
              name="original_price"
              className="form-control"
              placeholder="Enter original price"
              value={formData.original_price}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold text-primary">Quantity</label>
            <input
              type="number"
              name="quantity"
              className="form-control"
              placeholder="Enter product quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mb-3">
  <label className="form-label fw-bold text-primary">Colors</label>
  {formData.colors.map((colorObj, index) => (
    <div key={index} className="d-flex align-items-center gap-2">
      <input
        type="color"
        value={colorObj.color}
        onChange={(e) => handleColorChange(index, e.target.value)}
        className="form-control"
        style={{ width: '50px' }}
      />
      <button
        type="button"
        className="btn btn-sm"
        onClick={() => removeColor(index)}
      >
        Remove
      </button>
    </div>
  ))}
  <button type="button" className="btn btn-primary mt-2" onClick={addColor}>
    Add Color
  </button>
</div>



          <div className="mb-3">
            <label className="form-label fw-bold text-primary">Upload Images</label>
            <input type="file" name="files" className="form-control" multiple onChange={handleFileChange} required />
          </div>

          <button type="submit" className="btn btn-success w-100" disabled={loading}>
            {loading ? "Adding..." : "Add Accessory"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Stock_4;
