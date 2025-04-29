import { useState, useEffect } from 'react';
import styles from '../css/DishDetail.module.css';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface DishDetailProps {
  dishInfor: {
    _id: string;
    name: string;
    imageUrl: string;
    categoryName: string;
    description: string;
    price: number;
    isAvailable: boolean;
  };
}

interface Feedback {
  _id: string;
  userId: {
    _id: string;
    fullname: string;
    email: string;
    profileImage: string;
    createdAt: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface Ingredient {
  _id: string;
  dishId: string;
  name: string;
  description: string;
  quantity: number;
  status: string;
}

function DishDetail({ dishInfor }: DishDetailProps) {
  const [activeTab, setActiveTab] = useState("DESCRIPTION");
  const [quantity, setQuantity] = useState(1);
  const [ingredients, setIngredients] = useState<Ingredient[] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [feedbackData, setFeedbackData] = useState<{
    totalFeedback: number;
    averageRating: number;
    feedbacks: Feedback[];
  } | null>(null);
  const [editingFeedback, setEditingFeedback] = useState<string | null>(null);
  const [editedComment, setEditedComment] = useState<string>('');
  const [editedRating, setEditedRating] = useState<number>(0);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState<number>(0);

  useEffect(() => {
    const userToken = Cookies.get('token') ?? null;
    setToken(userToken);
    if (userToken) {
      const decoded: any = jwtDecode(userToken);
      setUserId(decoded.id);
    }
  }, []);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/feedback/dish/${dishInfor._id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch feedback data");
        }

        const data = await response.json();
        if (data.success) {
          setFeedbackData({
            totalFeedback: data.totalFeedback,
            averageRating: data.averageRating,
            feedbacks: data.feedbacks,
          });
        }
      } catch (err: any) {
        console.error(err.message);
      }
    };

    const fetchIngredient = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/ingredients/${dishInfor._id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch ingredients");
        }

        const data = await response.json();
        if (data.success) {
          setIngredients(data.ingredients || []);
        }
      } catch (err: any) {
        console.error(err.message);
        setIngredients([]);
      }
    }

    fetchIngredient();
    fetchFeedback();
  }, [dishInfor._id]);

  useEffect(() => {
    const userToken = Cookies.get('token') ?? null;
    setToken(userToken);
  }, []);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const decimal = rating - fullStars;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className={styles.star}>★</span>);
    }

    if (decimal > 0 && stars.length < 5) {
      stars.push(
        <span key="partial" className={styles.starPartial}>
          <span
            className={styles.starFill}
            style={{ width: `${decimal * 100}%` }}
          >
            ★
          </span>
          <span className={styles.starEmpty}>★</span>
        </span>
      );
    }

    while (stars.length < 5) {
      stars.push(<span key={`empty-${stars.length}`} className={styles.star}>☆</span>);
    }

    return stars;
  };

  const renderEmptyStars = () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(<span key={`empty-${i}`} className={styles.star}>☆</span>);
    }
    return stars;
  };

  const renderEditableStars = () => {
    const stars = [];
    const currentRating = hoverRating || editedRating;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`${styles.star} ${styles.editableStar} ${i <= currentRating ? styles.filledStar : ''}`}
          onClick={() => setEditedRating(i)}
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decreaseQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
  }

  const addToCart = async (dish: any, dishQuantity: number) => {
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const userId = decoded.id;

        const response = await fetch('http://localhost:3000/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: userId,
            dishId: dish._id,
            quantity: dishQuantity
          })
        });

        const data = await response.json();

        if (data.success) {
          toast.success('Added to cart successfully!');
          window.dispatchEvent(new Event('cartUpdated'));
        } else {
          toast.error(data.message || 'Failed to add item to cart.');
        }
      } catch (error) {
        console.error('Error adding item to cart:', error);
        toast.error('An error occurred while adding item to cart.');
      }
    } else {
      const storedCart = localStorage.getItem('cart');
      const cart = storedCart ? JSON.parse(storedCart) : [];

      const existingItem = cart.find((item: { _id: any; }) => item._id === dish._id);
      let updatedCart;

      if (existingItem) {
        updatedCart = cart.map((item: { _id: any; quantity: number; }) =>
          item._id === dish._id ? { ...item, quantity: item.quantity + dishQuantity } : item
        );
      } else {
        updatedCart = [...cart, { ...dish, quantity: dishQuantity }];
      }

      localStorage.setItem('cart', JSON.stringify(updatedCart));
      window.dispatchEvent(new Event('cartUpdated'));

      toast.success('Add to cart successfully!');
    }
  };

  const handleEditFeedback = (feedback: Feedback) => {
    setEditingFeedback(feedback._id);
    setEditedComment(feedback.comment);
    setEditedRating(feedback.rating);
    setShowMenu(null);
  };

  const handleSaveFeedback = async (feedbackId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/feedback/update/${feedbackId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: editedRating,
          comment: editedComment
        })
      });

      const data = await response.json();
      if (data.success) {
        setFeedbackData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            feedbacks: prev.feedbacks.map(fb =>
              fb._id === feedbackId ? { ...fb, rating: editedRating, comment: editedComment } : fb
            )
          };
        });
        setEditingFeedback(null);
        toast.success('Feedback updated successfully!');
      } else {
        toast.error(data.message || 'Failed to update feedback');
      }
    } catch (error) {
      toast.error('Error updating feedback');
      console.error(error);
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/feedback/delete/${feedbackId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setFeedbackData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            totalFeedback: prev.totalFeedback - 1,
            feedbacks: prev.feedbacks.filter(fb => fb._id !== feedbackId)
          };
        });
        setShowMenu(null);
        toast.success('Feedback deleted successfully!');
      } else {
        toast.error(data.message || 'Failed to delete feedback');
      }
    } catch (error) {
      toast.error('Error deleting feedback');
      console.error(error);
    }
  };

  return (
    <div className={styles.backGround}>
      <div className={styles.detailContainer}>
        <div className={styles.productDetails}>
          <div className={styles.productImage}>
            <img
              src={dishInfor.imageUrl}
              alt={dishInfor.name}
              className={styles.mainImage}
            />
          </div>

          <div className={styles.productInfo}>
            <h1 className={styles.productTitle}>{dishInfor.name}</h1>

            <div className={styles.ratingContainer}>
              <div className={styles.stars}>
                {feedbackData?.averageRating ? renderStars(feedbackData.averageRating) : renderEmptyStars()}
              </div>
              <span className={styles.reviewCount}>
                {`(${feedbackData?.totalFeedback || 0} customer reviews)`}
              </span>
            </div>

            <div className={styles.priceContainer}>
              <h2 className={styles.price}>{dishInfor.price.toLocaleString()}₫</h2>
            </div>

            <p className={styles.description}>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque lauatium.
            </p>

            <div className={styles.actionContainer}>
              <div className={styles.quantityWrapper}>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                  className={styles.quantityInput}
                />
                <div className={styles.quantityControls}>
                  <button onClick={increaseQuantity} className={styles.quantityButton} aria-label="Increase quantity">
                    ▲
                  </button>
                  <button onClick={decreaseQuantity} className={styles.quantityButton} aria-label="Decrease quantity">
                    ▼
                  </button>
                </div>
              </div>
              <button
                className={styles.addToCartButton}
                onClick={() => addToCart(dishInfor, quantity)}
              >
                ADD TO CART
              </button>
            </div>

            <div className={styles.metaContainer}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Category</span>
                <span className={styles.metaValue}>{dishInfor.categoryName}</span>
              </div>

              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Availability</span>
                <span className={styles.metaValue}>{dishInfor.isAvailable ? "In Stock" : "Out of Stock"}</span>
              </div>
            </div>

            <div className={styles.tabsContainer}>
              <div className={styles.tabsHeader}>
                <button
                  className={`${styles.tabButton} ${activeTab === "DESCRIPTION" ? styles.activeTab : ""}`}
                  onClick={() => setActiveTab("DESCRIPTION")}
                >
                  DESCRIPTION
                </button>
                <button
                  className={`${styles.tabButton} ${activeTab === "INGREDIENT" ? styles.activeTab : ""}`}
                  onClick={() => setActiveTab("INGREDIENT")}
                >
                  INGREDIENTS
                </button>
                <button
                  className={`${styles.tabButton} ${activeTab === "REVIEWS" ? styles.activeTab : ""}`}
                  onClick={() => setActiveTab("REVIEWS")}
                >
                  REVIEWS ({feedbackData?.totalFeedback || 0})
                </button>
              </div>

              <div className={styles.tabContent}>
                {activeTab === "DESCRIPTION" && (
                  <div style={{ padding: '0px 10px' }}>
                    <p>{dishInfor.description}</p>
                  </div>
                )}

                {activeTab === "INGREDIENT" && (
                  <div className={styles.ingredients}>
                    {ingredients ? (
                      (() => {
                        const availableIngredients = ingredients.filter(
                          ingredient => ingredient.status === "Available"
                        );
                        return availableIngredients.length > 0 ? (
                          <ul className={styles.ingredientList}>
                            {availableIngredients.map((ingredient) => (
                              <li key={ingredient._id} className={styles.ingredientItem}>
                                <strong>{ingredient.name}</strong>: <span>{ingredient.description}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className={styles.noIngredient}>
                            <p>No available ingredients for this dish.</p>
                          </div>
                        );
                      })()
                    ) : (
                      <div className={styles.noIngredient}>
                        <p>No ingredients available for this dish.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "REVIEWS" && (
                  <div className={styles.reviews}>
                    {feedbackData && feedbackData.feedbacks.length > 0 ? (
                      feedbackData.feedbacks.map((feedback) => (
                        <div key={feedback._id} className={styles.review}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p>
                              <strong>{feedback.userId.fullname}</strong> -{" "}
                              {new Date(feedback.createdAt).toLocaleDateString()}
                            </p>
                            {userId && feedback.userId._id === userId && (
                              <div style={{ position: 'relative' }}>
                                <button
                                  className={styles.menuButton}
                                  onClick={() => setShowMenu(showMenu === feedback._id ? null : feedback._id)}
                                >
                                  ⋮
                                </button>
                                {showMenu === feedback._id && (
                                  <div className={styles.dropdownMenu}>
                                    <button
                                      onClick={() => handleEditFeedback(feedback)}
                                      className={styles.menuItem}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteFeedback(feedback._id)}
                                      className={styles.menuItem}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className={styles.stars}>
                            {editingFeedback === feedback._id ? (
                              renderEditableStars()
                            ) : (
                              renderStars(feedback.rating)
                            )}
                          </div>
                          {editingFeedback === feedback._id ? (
                            <div>
                              <textarea
                                value={editedComment}
                                onChange={(e) => setEditedComment(e.target.value)}
                                className={styles.editTextarea}
                              />
                              <button
                                onClick={() => handleSaveFeedback(feedback._id)}
                                className={styles.saveButton}
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <p>{feedback.comment}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className={styles.noReview}>
                        <p>No reviews yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DishDetail;