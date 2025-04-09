import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";

const Accessories = () => {
  const [accessories, setAccessories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccessory, setSelectedAccessory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newAccessory, setNewAccessory] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    color: "",
    quantity: "",
    images: null,
  });
  const [editData, setEditData] = useState({
    id: "",
    name: "",
    description: "",
    category: "",
    price: "",
    color: "",
    quantity: "",
    images: null,
  });

  const API_BASE_URL = "http://localhost:5005/api/accessories";

  // Fetch accessories
  const fetchAccessories = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setAccessories(response.data || []);
    } catch (error) {
      console.error("Error fetching accessories:", error);
    }
  };

  useEffect(() => {
    fetchAccessories();
  }, []);

  // Handle Edit Click
  const handleEditClick = (accessory) => {
    setSelectedAccessory(accessory);
    setEditData({
      id: accessory.id,
      name: accessory.name,
      description: accessory.description,
      category: accessory.category,
      price: accessory.price,
      color: accessory.color,
      quantity: accessory.quantity,
      images: accessory.images,
    });
    setShowModal(true);
  };

  // Handle Delete Click
  const handleDeleteClick = async (id) => {
    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmDelete.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        Swal.fire("Deleted!", "Accessory has been deleted.", "success");
        setAccessories(accessories.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Error deleting accessory:", error);
        Swal.fire("Error", "Failed to delete the accessory.", "error");
      }
    }
  };

  // Handle Add New Accessory
  const handleAddAccessory = async () => {
    const formData = new FormData();
    formData.append("name", newAccessory.name);
    formData.append("description", newAccessory.description);
    formData.append("category", newAccessory.category);
    formData.append("price", newAccessory.price);
    formData.append("color", newAccessory.color);
    formData.append("quantity", newAccessory.quantity);

    if (newAccessory.images) {
      for (let i = 0; i < newAccessory.images.length; i++) {
        formData.append("images", newAccessory.images[i]);
      }
    }

    try {
      await axios.post(API_BASE_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire("Success", "Accessory added successfully.", "success");
      fetchAccessories();
    } catch (error) {
      console.error("Error adding accessory:", error);
      Swal.fire("Error", "Failed to add the accessory.", "error");
    }
  };

  // Handle Update
  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("name", editData.name);
      formData.append("description", editData.description);
      formData.append("category", editData.category);
      formData.append("price", editData.price);
      formData.append("color", editData.color);
      formData.append("quantity", editData.quantity);

      if (editData.images) {
        for (let i = 0; i < editData.images.length; i++) {
          formData.append("images", editData.images[i]);
        }
      }

      await axios.put(`${API_BASE_URL}/${editData.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire("Success", "Accessory updated successfully.", "success");
      fetchAccessories();
      setShowModal(false);
    } catch (error) {
      console.error("Error updating accessory:", error);
      Swal.fire("Error", "Failed to update the accessory.", "error");
    }
  };

  // Filter by search term
  const filteredAccessories = accessories.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center col-11 mx-auto">
        <h2 className="fw-bold mt-4">Accessories Dashboard</h2>
      </div>

      <div className="col-md-11 mx-auto mt-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="row mt-4 col-12 mx-auto">
        <div className="col-md-11 mx-auto">
          <div className="bg-white shadow-sm rounded p-3">
            <h5 className="fw-bold mb-3">Accessory List</h5>
            <table className="table table-bordered table-striped">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Color</th>
                  <th>Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccessories.length > 0 ? (
                  filteredAccessories.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>
  {Array.isArray(item.images) ? (
    item.images.map((img, index) => (
      <img
        key={index}
        src={`http://localhost:5005/uploads/${img}`}
        alt="accessory"
        style={{ width: "70px", height: "70px" }}
        className="rounded me-1"
      />
    ))
  ) : typeof item.images === "string" ? (
    item.images.split(",").map((img, index) => (
      <img
        key={index}
        src={`http://localhost:5005/uploads/${img}`}
        alt="accessory"
        style={{ width: "70px", height: "70px" }}
        className="rounded me-1"
      />
    ))
  ) : (
    <span>No Image</span>
  )}
</td>

                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>${item.price}</td>
                      <td>{item.color}</td>
                      <td>{item.quantity}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm me-2"
                          onClick={() => handleEditClick(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteClick(item.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No accessories found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && selectedAccessory && (
        <div
          className="modal fade show d-blocqxk"
          tabIndex="-1"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Edit Accessory</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-success"
                  onClick={handleUpdate}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accessories;
