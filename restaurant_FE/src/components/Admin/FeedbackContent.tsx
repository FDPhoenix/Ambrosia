import type React from "react"
import { useEffect, useState } from "react"

interface Category {
  _id: string
  name: string
}

interface Feedback {
  _id: string
  userId: {
    fullname: string
    email: string
    profileImage?: string
  }
  rating: number
  comment: string
  isHided: boolean
  createdAt: string
}

interface Dish {
  _id: string
  name: string
  imageUrl: string
  price: number
  category: Category
  isAvailable: boolean
}

const BASE_IMAGE_URL = "http://localhost:3000/uploads/"

const FeedbackContent: React.FC = () => {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null)
  const [loadingFeedback, setLoadingFeedback] = useState<boolean>(false)
  const [ratingFilter, setRatingFilter] = useState<number | "">("")

  useEffect(() => {
    fetchDishes()
    fetchCategories()
  }, [selectedCategory])

  const fetchDishes = () => {
    const apiUrl = selectedCategory
      ? `http://localhost:3000/api/feedback/allDishes?categoryId=${selectedCategory}`
      : `http://localhost:3000/api/feedback/allDishes`

    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => setDishes(Array.isArray(data) ? data : []))
      .catch((error) => console.error("Error loading dishes:", error))
  }

  const fetchCategories = () => {
    fetch("http://localhost:3000/category/all")
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data.categories) ? data.categories : []))
      .catch((error) => console.error("Error loading categories:", error))
  }

  const fetchFeedbacks = (dishId: string) => {
    setLoadingFeedback(true)
    fetch(`http://localhost:3000/api/feedback/dish/${dishId}`)
      .then((res) => res.json())
      .then((data) => setFeedbacks(data.feedbacks || []))
      .catch(() => setFeedbacks([]))
      .finally(() => setLoadingFeedback(false))
  }

  const handleDishClick = (dish: Dish) => {
    setSelectedDish(dish)
    fetchFeedbacks(dish._id)
    setRatingFilter("")
  }

  const toggleVisibility = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/feedback/hide/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) throw new Error("Failed to update feedback visibility")

      const data = await response.json()

      setFeedbacks((prev) => prev.map((fb) => (fb._id === id ? { ...fb, isHided: data.feedback.isHided } : fb)))

      alert(data.feedback.isHided ? "Feedback has been hidden successfully!" : "Feedback is now visible!")
    } catch (error) {
      console.error("Error updating visibility:", error)
      alert("An error occurred while updating feedback visibility!")
    }
  }

  const filteredFeedbacks = ratingFilter ? feedbacks.filter((fb) => fb.rating === ratingFilter) : feedbacks

  return (
    <div className="w-[1200px] h-[567px]">
      <select
        className="w-[200px] p-2 mb-5 border border-gray-300 rounded-lg"
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category._id} value={category._id}>
            {category.name}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 max-h-[512px] overflow-y-auto pr-2 scrollbar-hide">
        {dishes.map((dish) => (
          <div
            key={dish._id}
            className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105"
            onClick={() => handleDishClick(dish)}
          >
            <img
              src={
                dish.imageUrl
                  ? dish.imageUrl.startsWith("http")
                    ? dish.imageUrl
                    : `${BASE_IMAGE_URL}${dish.imageUrl}`
                  : "https://tse4.mm.bing.net/th?id=OIP.1QDPhOmFezmjXmeTYkbOagHaE8&pid=Api&P=0&h=180"
              }
              alt={dish.name}
              className="w-full h-[150px] object-cover border-b border-gray-100"
            />
            <div className="p-3 text-center">
              <h2 className="text-lg font-semibold my-2">{dish.name}</h2>
              <p className="text-base text-gray-500">{dish.price.toLocaleString()} VND</p>
            </div>
          </div>
        ))}
      </div>

      {selectedDish && (
        <div
          className="fixed inset-0 bg-black/60 flex justify-center items-start pt-10 z-50"
          onClick={() => setSelectedDish(null)}
        >
          <div
            className="bg-white w-[95%] max-w-[1100px] rounded-2xl p-6 relative shadow-lg max-h-[85vh] overflow-y-auto z-[1100]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-center mb-4">Feedback for {selectedDish.name}</h2>

            <div className="flex justify-center items-center gap-2.5 mb-5">
              <label>Filter by Rating:</label>
              <select
                className="py-1.5 px-2.5 rounded-lg border border-gray-300"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value === "" ? "" : Number(e.target.value))}
              >
                <option value="">All</option>
                {[1, 2, 3, 4, 5].map((star) => (
                  <option key={star} value={star}>
                    {star} star{star > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            {loadingFeedback ? (
              <p className="text-center text-base text-blue-500 mt-5">Loading...</p>
            ) : filteredFeedbacks.length > 0 ? (
              <table className="w-full border-collapse mt-2.5">
                <thead>
                  <tr>
                    <th className="p-2.5 border border-gray-300 text-center bg-gray-100 font-bold">Fullname</th>
                    <th className="p-2.5 border border-gray-300 text-center bg-gray-100 font-bold">Email</th>
                    <th className="p-2.5 border border-gray-300 text-center bg-gray-100 font-bold">Rating</th>
                    <th className="p-2.5 border border-gray-300 text-center bg-gray-100 font-bold">Comment</th>
                    <th className="p-2.5 border border-gray-300 text-center bg-gray-100 font-bold">Created At</th>
                    <th className="p-2.5 border border-gray-300 text-center bg-gray-100 font-bold">Status</th>
                    <th className="p-2.5 border border-gray-300 text-center bg-gray-100 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeedbacks.map((fb) => (
                    <tr key={fb._id} className={fb.isHided ? "bg-gray-50 text-gray-400" : ""}>
                      <td className="p-2.5 border border-gray-300 text-center">{fb.userId.fullname}</td>
                      <td className="p-2.5 border border-gray-300 text-center">{fb.userId.email}</td>
                      <td className="p-2.5 border border-gray-300 text-center">⭐ {fb.rating}</td>
                      <td className="p-2.5 border border-gray-300 text-center">{fb.comment}</td>
                      <td className="p-2.5 border border-gray-300 text-center">
                        {new Date(fb.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-2.5 border border-gray-300 text-center">{fb.isHided ? "Hidden" : "Visible"}</td>
                      <td className="p-2.5 border border-gray-300 text-center">
                        <button
                          className="py-2 px-3 border-none rounded-lg bg-amber-400 text-white cursor-pointer transition-colors duration-200 hover:bg-amber-500"
                          onClick={() => toggleVisibility(fb._id)}
                        >
                          {fb.isHided ? "Show" : "Hide"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-base text-gray-500 mt-5">No feedback available</p>
            )}

            <button
              className="absolute top-2.5 right-2.5 bg-transparent border-none text-lg cursor-pointer text-gray-700"
              onClick={() => setSelectedDish(null)}
            >
              X
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default FeedbackContent
