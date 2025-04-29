import { useEffect, useState } from 'react';
import styles from '../../css/AdminCss/DishContent.module.css'
import { FaEdit, FaEye, FaTimes } from 'react-icons/fa';
import { FaEyeSlash } from 'react-icons/fa6';
import StatusBadge from './StatusBadge';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

function DishContent() {
  const [dishes, setDishes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editLoading, setEditLoading] = useState(false)

  const [editDish, setEditDish] = useState({
    _id: "",
    name: "",
    category: "",
    price: "",
    image: "",
  })

  const [newDish, setNewDish] = useState({
    name: "",
    category: categories.length > 0 ? categories[0]._id : "",
    price: "",
    status: "Available",
    image: "",
  });

  const fetchDishes = () => {
    fetch("http://localhost:3000/dishes/admin/all", {
      method: "GET",
      headers: {
        authorization: `Bearer ${Cookies.get("token")}`,
      },
    }).then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDishes(data.response);
        }
      })
      .catch((err) => {
        console.error("Error fetching dishes:", err);
      });
  };

  const fetchCategory = () => {
    fetch("http://localhost:3000/category/all", {
      method: "GET",
      headers: {
        authorization: `Bearer ${Cookies.get("token")}`,
      },
    }).then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.categories);
          console.log("Categories:", data.categories);
        }
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
      });
  };

  //Hide
  const handleHideDish = (id: any) => {
    const dishToUpdate = dishes.find(dish => dish._id === id);
    const updatedStatus = !dishToUpdate.isAvailable;

    fetch(`http://localhost:3000/dishes/hide/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${Cookies.get("token")}`
      },
      body: JSON.stringify({ isAvailable: updatedStatus })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDishes(dishes.map(dish =>
            dish._id === id ? { ...dish, isAvailable: updatedStatus } : dish
          ));
        }
      })
      .catch(err => console.error("Error updating dish status:", err));
  };

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    setNewDish({ ...newDish, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setNewDish({ ...newDish, image: URL.createObjectURL(file) });
    }
  };

  const handleEditImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setEditDish({ ...editDish, image: URL.createObjectURL(file) });
    }
  };

  //Add
  const handleAddDish = () => {
    if (!newDish.name.trim()) {
      toast.error("Dish name cannot be empty!");
      return;
    }

    const price = Number(newDish.price)
    if (!price || isNaN(price) || price <= 1000) {
      toast.error("Price must be a valid number and higher than 1000!");
      return;
    }

    if (!selectedFile) {
      toast.error("Please select an image!");
      return;
    }

    if (!newDish.category || newDish.category.trim() === "") {
      toast.error("Please select a valid category!");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('name', newDish.name);
    formData.append('categoryId', newDish.category);
    formData.append('price', newDish.price);
    formData.append('image', selectedFile);

    fetch("http://localhost:3000/dishes/add", {
      method: "POST",
      headers: {
        contentType: "application/json",
        authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: formData,
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDishes([...dishes, data.dish]);
          setShowForm(false);
          setNewDish({ name: "", category: categories[0]._id, price: "", status: "Available", image: "" });
          setSelectedFile(null);
          toast.success('Added successfully')
          fetchDishes();
        } else {
          toast.error("Failed to add dish!");
        }
      })
      .catch(err => console.error("Error adding dish:", err))
      .finally(() => setLoading(false));
  };

  const handleEditDish = (dish: any) => {
    const category = categories.find((cat: any) => cat.name === dish.categoryName);

    setEditDish({
      _id: dish._id,
      name: dish.name,
      category: category?._id,
      price: dish.price,
      image: dish.imageUrl,
    });
    setShowEditForm(true);
  };

  //Update
  const handleUpdateDish = () => {
    if (!editDish.name.trim()) {
      toast.error("Dish name cannot be empty!");
      return;
    }

    const price = Number(editDish.price)
    if (!price || isNaN(price) || price <= 1000) {
      toast.error("Price must be a valid number and higher than 1000!");
      return;
    }

    console.log("Updating with category:", editDish.category);

    if (!categories.find((cat: any) => cat._id === editDish.category)) {
      toast.error("Invalid category selected!");
      return;
    }

    setEditLoading(true);

    const formData = new FormData();
    formData.append('name', editDish.name);
    formData.append('categoryId', editDish.category);
    formData.append('price', editDish.price);

    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    fetch(`http://localhost:3000/dishes/update/${editDish._id}`, {
      method: "PUT",
      headers: {
        contentType: "application/json",
        authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDishes(dishes.map(dish => dish._id === editDish._id ? data.dish : dish));
          setShowEditForm(false);
          toast.success('Upadated successfully')
          fetchDishes();
        } else {
          toast.error("Failed to update dish!");
        }
      })
      .catch((err) => console.error("Error updating dish:", err))
      .finally(() => setEditLoading(false));
  };

  useEffect(() => {
    fetchDishes();
    fetchCategory();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      setNewDish((prev) => ({ ...prev, category: categories[0]._id }));
    }
  }, [categories]);

  return (
    <div className={styles.contentContainer}>
      <div className={styles.contentTitle}>
        <h3>List of Dish</h3>
        <button onClick={() => setShowForm(true)}>Add dish</button>
      </div>

      <div className={styles.mainContent}>
        <table className={styles.dishTable}>
          <thead>
            <tr>
              <th>No</th>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price (VND)</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish: any, index) => (
              <tr key={dish._id}>
                <td>{index + 1}</td>
                <td><img src={dish.imageUrl} alt={''} className={styles.dishImage} /></td>
                <td>{dish.name}</td>
                <td>{dish.categoryName}</td>
                <td>{dish.price.toLocaleString()}</td>
                <td>
                  <div style={{ width: '106px', margin: '0 auto' }}>
                    <StatusBadge status={dish.isAvailable} caseTrue={"Available"} caseFalse={"Unavailable"} />
                  </div>
                </td>
                <td>
                  <button className={styles.actionButton} style={{ marginRight: '10px' }} onClick={() => handleEditDish(dish)}><FaEdit /></button>
                  <button className={styles.actionButton} onClick={() => handleHideDish(dish._id)}>
                    {dish.isAvailable ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className={styles.overlay}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h3>Add New Dish</h3>
              <button onClick={() => setShowForm(false)}><FaTimes /></button>
            </div>

            <div className={styles.formContent}>
              <div className={styles.imageUpload}>
                {newDish.image ? <img src={newDish.image} alt="Preview" /> : <span>Select Image</span>}
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </div>

              <div className={styles.formFields}>
                <input type="text" name="name" placeholder="Dish Name" value={newDish.name} onChange={handleInputChange} />

                <select name="category" value={newDish.category} onChange={handleInputChange}>
                  {categories.map((cat: any) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>

                <input className={styles.noSpinner} type="number" name="price" placeholder="Price" value={newDish.price} onChange={handleInputChange} />

                {!loading ?
                  (<button onClick={handleAddDish}>Add Dish</button>)
                  :
                  (<button>Adding...</button>)
                }

              </div>
            </div>
          </div>
        </div>
      )}

      {showEditForm && (
        <div className={styles.overlay}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h3>Edit Dish</h3>
              <button onClick={() => setShowEditForm(false)}><FaTimes /></button>
            </div>

            <div className={styles.formContent}>
              <div className={styles.imageUpload}>
                {editDish.image ? <img src={editDish.image} alt="Preview" /> : <span>Select Image</span>}
                <input type="file" accept="image/*" onChange={handleEditImageChange} />
              </div>

              <div className={styles.formFields}>
                <input
                  type="text"
                  name="name"
                  placeholder="Dish Name"
                  value={editDish.name}
                  onChange={(e) => setEditDish({ ...editDish, name: e.target.value })}
                />

                <select
                  name="category"
                  value={editDish.category}
                  onChange={(e) => setEditDish({ ...editDish, category: e.target.value })}
                >
                  {categories.map((cat: any) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <input
                  className={styles.noSpinner}
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={editDish.price}
                  onChange={(e) => setEditDish({ ...editDish, price: e.target.value })}
                />

                {!editLoading ?
                  (<button onClick={handleUpdateDish}>Save Changes</button>)
                  :
                  (<button>Saving...</button>)
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DishContent