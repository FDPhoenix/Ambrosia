import styles from '../css/DishMenu.module.css'
import { useNavigate } from 'react-router'
import { useEffect, useState } from 'react';
import { FaCartPlus } from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import Cookies from "js-cookie";
import { jwtDecode } from 'jwt-decode';

function DishMenu() {
  const [dishes, setDishes] = useState([]);
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const token = Cookies.get('token')

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    setCart(storedCart ? JSON.parse(storedCart) : []);

    fetch("http://localhost:3000/category/all")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.categories);
          console.log("Categories:", data.categories);
        }
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
      });
  }, []);

  useEffect(() => {
    fetchDishes(category, currentPage);
  }, [category, currentPage]);

  const fetchDishes = async (selectedCategory: string, page = 1) => {
    try {
      const query = selectedCategory ? `?categoryId=${selectedCategory}` : `all?page=${page}&limit=12`;
      const response = await fetch(`http://localhost:3000/dishes/${query}`);
      const data = await response.json();

      console.log('Fetched data successful:', data);

      if (data.success && Array.isArray(data.dishes)) {
        setDishes(data.dishes);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
      } else {
        setDishes([]);
      }

    } catch (error) {
      console.error('Error while fetching dishes:', error);
    }
  };


  const addToCart = async (dish: any) => {
    const quantity = 1;

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
            quantity
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
          item._id === dish._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updatedCart = [...cart, { ...dish, quantity: 1 }];
      }

      localStorage.setItem('cart', JSON.stringify(updatedCart));
      window.dispatchEvent(new Event('cartUpdated'));

      toast.success('Add to cart successfully!');
    }
  };

  return (
    <div className={styles.menuContainer}>
      <div className={styles.container}>
        <div className={styles.aside}>
          <div className={styles.asideItem}>
            <div className={styles.categoryHeader}>
              <h2>Categories</h2>
            </div>

            <form className={styles.categoryForm}>
              <div className={styles.formGroup}>
                <input type="radio" id="all" name='category' value='all'
                  checked={category === ''}
                  onChange={() => setCategory('')}
                />
                <label htmlFor='all'>All</label>
              </div>

              {categories.map((cat: any) => (
                <div className={styles.formGroup} key={cat._id}>
                  <input
                    type="radio"
                    id={cat.name}
                    name="category"
                    value={cat.name}
                    checked={category === cat._id}
                    onChange={() => setCategory(cat._id)}
                  />
                  <label htmlFor={cat.name}>{cat.name}</label>
                </div>
              ))}
            </form>
          </div>

          <div className={styles.asideItem}>
            <div className={styles.categoryHeader}>
              <h2>Price</h2>
            </div>

            <form className={styles.categoryForm}>
              <div className={styles.formGroup}>
                <input type="checkbox" id="first" name='price' value='Appetizer' />
                <label htmlFor='first'>above 1.000.000₫</label>
              </div>

              <div className={styles.formGroup}>
                <input type="checkbox" id="second" name='price' value='Main-dish' />
                <label htmlFor='second'>from 500.000 - 1.000.000₫</label>
              </div>

              <div className={styles.formGroup}>
                <input type="checkbox" id="third" name='price' value='Dessert' />
                <label htmlFor='third'>from 200.000 - 500.000₫</label>
              </div>

              <div className={styles.formGroup}>
                <input type="checkbox" id="fourd" name='price' value='Vegetarian' />
                <label htmlFor='fourd'>from 100.000 - 200.000₫</label>
              </div>

              <div className={styles.formGroup}>
                <input type="checkbox" id="fifth" name='price' value='Vegetarian' />
                <label htmlFor='fifth'>below 100.000₫</label>
              </div>
            </form>
          </div>
        </div>

        <div className={styles.rightSide}>
          <div className={styles.allDishes}>
            <h3>ALL DISHES</h3>
          </div>

          <div className={styles.menu}>
            {dishes.length > 0 ? (
              dishes.map((item: any) => (
                <div key={item._id} className={styles.link}>
                  <div className={styles.menuCard}>
                    <div onClick={() => navigate(`/dish/${item._id}`)} style={{cursor: 'pointer'}}>
                      <div className={styles.dishThumbnail}>
                        <img className={styles.imageUrl} src={item.imageUrl} alt='' />
                      </div>

                      <div className={styles.dishDescription}>
                        <p className={styles.name}>{item.name}</p>
                        <p className={styles.price}>{item.price.toLocaleString()}₫</p>
                      </div>
                    </div>

                    <button className={styles.addCartBtn} onClick={() => addToCart(item)}>
                      <FaCartPlus className={styles.addCartIcon} />
                      <p className={styles.addTitle}>Add to cart</p>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.err}>No dishes or drinks available.</p>
            )}
          </div>
        </div>
      </div >

      <div className={styles.page}>
        <button
          className={styles.arrButton}
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          &lt;
        </button>

        <ul className={styles.pageNumberContainer}>
          {[...Array(totalPages)].map((_, index) => (
            <li
              key={index + 1}
              className={`${styles.pageNumber} ${currentPage === index + 1 ? styles.active : ''}`}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </li>
          ))}
        </ul>

        <button
          className={styles.arrButton}
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          &gt;
        </button>
      </div>

      <ToastContainer theme="colored" />
    </div>
  )
}

export default DishMenu
