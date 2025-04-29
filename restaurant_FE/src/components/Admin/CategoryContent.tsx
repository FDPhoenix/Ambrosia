import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import styles from "../../css/AdminCss/CategoryContent.module.css";
import { FaEdit, FaEye, FaEyeSlash } from "react-icons/fa";
import StatusBadge from "./StatusBadge";
import { toast } from "react-toastify";

interface Category {
  _id: string;
  name: string;
  description: string;
  isHidden?: boolean;
}

const API_BASE = "http://localhost:3000/category";

const CategoryContent: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/all`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      } else {
        toast.error("Failed to fetch category!");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch category!");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!name.trim()) {
      toast.error("Please input category name!");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/add`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Category added successful!");
        fetchCategories();
        setName("");
        setDescription("");
        setModalIsOpen(false);
      } else {
        toast.error(`Failed to add category: ${data.message}`);
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("An error when adding category!");
    }
  };

  const handleUpdateCategory = async () => {
    if (!editCategory) return;

    if (!editCategory.name.trim()) {
      toast.error("Category name cannot be blank!");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/update/${editCategory._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editCategory.name,
          description: editCategory.description,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Category updated successful!");
        fetchCategories();
        setEditCategory(null);
      } else {
        toast.error(`Failed to update category: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("An error when updating category!");
    }
  };

  const handleToggleHide = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/hide/${id}`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Changed category status successful!");
        fetchCategories();
      } else {
        toast.error(`Status cannot be change: ${data.message}`);
      }
    } catch (error) {
      console.error("Error hiding category:", error);
      toast.error("An error when change category status!");
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3 style={{ marginTop: "5px" }}>List of category</h3>
        <button
          className={styles.addButton}
          onClick={() => setModalIsOpen(true)}
        >
          Add category
        </button>
      </div>

      <div className={styles.mainContent}>
        <table className={styles.categoryTable}>
          <thead>
            <tr>
              <th>No</th>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => (
              <tr key={category._id}>
                <td>{index + 1}</td>
                <td>{category.name}</td>
                <td>{category.description || '-'}</td>
                <td>
                  <StatusBadge
                    status={!category.isHidden}
                    caseTrue="Available"
                    caseFalse="Unavailable"
                  />
                </td>
                <td>
                  <button
                    className={styles.actionButton}
                    onClick={() => setEditCategory(category)}
                    style={{marginRight: "20px"}}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleToggleHide(category._id)}
                  >
                    {category.isHidden ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className={styles.modal}
        overlayClassName={styles.modalOverlay}
      >
        <h2>Add Category</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className={styles.modalButtons}>
          <button className={styles.addButton} onClick={handleAddCategory}>
            Add
          </button>
          <button
            className={styles.cancelButton}
            onClick={() => setModalIsOpen(false)}
          >
            Cancel
          </button>
        </div>
      </Modal>

      {editCategory && (
        <Modal
          isOpen={!!editCategory}
          onRequestClose={() => setEditCategory(null)}
          className={styles.modal}
          overlayClassName={styles.modalOverlay}
        >
          <h2>Update Category</h2>
          <input
            type="text"
            placeholder="Name"
            value={editCategory.name}
            onChange={(e) =>
              setEditCategory({ ...editCategory, name: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Description"
            value={editCategory.description}
            onChange={(e) =>
              setEditCategory({ ...editCategory, description: e.target.value })
            }
          />
          <div className={styles.modalButtons}>
            <button className={styles.addButton} onClick={handleUpdateCategory}>
              Save
            </button>
            <button
              className={styles.cancelButton}
              onClick={() => setEditCategory(null)}
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CategoryContent;