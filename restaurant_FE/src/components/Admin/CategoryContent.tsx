import type React from "react"
import { useEffect, useState } from "react"
import Modal from "react-modal"
import { FaEdit, FaEye, FaEyeSlash } from "react-icons/fa"
import StatusBadge from "./StatusBadge"
import { toast } from "react-toastify"

interface Category {
  _id: string
  name: string
  description: string
  isHidden?: boolean
}

const API_BASE = "http://localhost:3000/category"

const CategoryContent: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [editCategory, setEditCategory] = useState<Category | null>(null)

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/all`, {
        method: "GET",
        credentials: "include",
      })
      const data = await res.json()
      if (data.success) {
        setCategories(data.categories)
      } else {
        toast.error("Failed to fetch category!")
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("Failed to fetch category!")
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleAddCategory = async () => {
    if (!name.trim()) {
      toast.error("Please input category name!")
      return
    }

    try {
      const res = await fetch(`${API_BASE}/add`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Category added successful!")
        fetchCategories()
        setName("")
        setDescription("")
        setModalIsOpen(false)
      } else {
        toast.error(`Failed to add category: ${data.message}`)
      }
    } catch (error) {
      console.error("Error adding category:", error)
      toast.error("An error when adding category!")
    }
  }

  const handleUpdateCategory = async () => {
    if (!editCategory) return

    if (!editCategory.name.trim()) {
      toast.error("Category name cannot be blank!")
      return
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
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Category updated successful!")
        fetchCategories()
        setEditCategory(null)
      } else {
        toast.error(`Failed to update category: ${data.message}`)
      }
    } catch (error) {
      console.error("Error updating category:", error)
      toast.error("An error when updating category!")
    }
  }

  const handleToggleHide = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/hide/${id}`, {
        method: "PATCH",
        credentials: "include",
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Changed category status successful!")
        fetchCategories()
      } else {
        toast.error(`Status cannot be change: ${data.message}`)
      }
    } catch (error) {
      console.error("Error hiding category:", error)
      toast.error("An error when change category status!")
    }
  }

  const customModalStyles = {
    content: {
      position: "relative",
      outline: "none",
      padding: "0",
      border: "none",
      background: "transparent",
      overflow: "visible",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
  }

  return (
    <div className="w-[1200px] h-[567px] p-[20px_30px] max-w-[1210px] bg-white rounded-[15px] shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
      <div className="flex justify-between">
        <h3 className="mt-[5px]">List of category</h3>
        <button
          className="bg-[#f0f0f0] border border-[#ccc] py-[7px] px-[12px] rounded-md cursor-pointer transition-colors duration-200 hover:bg-[#F0924C]"
          onClick={() => setModalIsOpen(true)}
        >
          Add category
        </button>
      </div>

      <div className="mt-5">
        <table className="w-full border-collapse">
          <thead className="bg-[#f4f4f4]">
            <tr>
              <th className="p-[15px] text-center border-b border-[#ddd] font-bold">No</th>
              <th className="p-[15px] text-center border-b border-[#ddd] font-bold">Name</th>
              <th className="p-[15px] text-center border-b border-[#ddd] font-bold">Description</th>
              <th className="p-[15px] text-center border-b border-[#ddd] font-bold">Status</th>
              <th className="p-[15px] text-center border-b border-[#ddd] font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => (
              <tr key={category._id} className="last:border-b-0">
                <td className="p-[15px] text-center border-b border-[#ddd]">{index + 1}</td>
                <td className="p-[15px] text-center border-b border-[#ddd]">{category.name}</td>
                <td className="p-[15px] text-center border-b border-[#ddd]">{category.description || "-"}</td>
                <td className="p-[15px] text-center border-b border-[#ddd]">
                  <StatusBadge status={!category.isHidden} caseTrue="Available" caseFalse="Unavailable" />
                </td>
                <td className="p-[15px] text-center border-b border-[#ddd]">
                  <button
                    className="bg-transparent border-none cursor-pointer mr-5 text-xl text-gray-800 transition-transform duration-200 hover:scale-[1.2] hover:text-[#f0924c]"
                    onClick={() => setEditCategory(category)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="bg-transparent border-none cursor-pointer text-xl text-gray-800 transition-transform duration-200 hover:scale-[1.2] hover:text-[#f0924c]"
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
        style={customModalStyles}
        contentLabel="Add Category Modal"
      >
        <div className="bg-white p-[30px] rounded-[10px] w-[400px] max-w-[90%] shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
          <h2 className="mb-5 text-2xl text-gray-800 text-center">Add Category</h2>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2.5 mb-[15px] border border-[#ddd] rounded-md text-sm box-border transition-colors duration-200 focus:border-[#007bff] focus:outline-none"
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 mb-[15px] border border-[#ddd] rounded-md text-sm box-border transition-colors duration-200 focus:border-[#007bff] focus:outline-none"
          />
          <div className="flex justify-center gap-2.5">
            <button
              className="border-none py-2.5 px-5 rounded-md cursor-pointer text-sm transition-colors duration-200 bg-[#f0f0f0] hover:bg-[#F0924C]"
              onClick={handleAddCategory}
            >
              Add
            </button>
            <button
              className="bg-[#f0f0f0] text-gray-800 border border-[#ddd] py-2.5 px-5 rounded-md cursor-pointer text-sm transition-colors duration-200 hover:bg-[#F0924C]"
              onClick={() => setModalIsOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {editCategory && (
        <Modal
          isOpen={!!editCategory}
          onRequestClose={() => setEditCategory(null)}
          style={customModalStyles}
          contentLabel="Edit Category Modal"
        >
          <div className="bg-white p-[30px] rounded-[10px] w-[400px] max-w-[90%] shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
            <h2 className="mb-5 text-2xl text-gray-800 text-center">Update Category</h2>
            <input
              type="text"
              placeholder="Name"
              value={editCategory.name}
              onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
              className="w-full p-2.5 mb-[15px] border border-[#ddd] rounded-md text-sm box-border transition-colors duration-200 focus:border-[#007bff] focus:outline-none"
            />
            <input
              type="text"
              placeholder="Description"
              value={editCategory.description}
              onChange={(e) => setEditCategory({ ...editCategory, description: e.target.value })}
              className="w-full p-2.5 mb-[15px] border border-[#ddd] rounded-md text-sm box-border transition-colors duration-200 focus:border-[#007bff] focus:outline-none"
            />
            <div className="flex justify-center gap-2.5">
              <button
                className="border-none py-2.5 px-5 rounded-md cursor-pointer text-sm transition-colors duration-200 bg-[#f0f0f0] hover:bg-[#F0924C]"
                onClick={handleUpdateCategory}
              >
                Save
              </button>
              <button
                className="bg-[#f0f0f0] text-gray-800 border border-[#ddd] py-2.5 px-5 rounded-md cursor-pointer text-sm transition-colors duration-200 hover:bg-[#F0924C]"
                onClick={() => setEditCategory(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default CategoryContent
