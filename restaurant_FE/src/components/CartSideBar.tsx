import type React from "react"
import styles from "../css/CartSideBar.module.css"
import { useNavigate } from "react-router"
import { useEffect, useState } from "react"
import { GoTrash } from "react-icons/go";
import { CiDeliveryTruck } from "react-icons/ci";
import Cookies from "js-cookie";
import { jwtDecode } from 'jwt-decode';
import { toast } from "react-toastify";

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<any[]>([])
  const token = Cookies.get('token');

  useEffect(() => {
    const loadCart = async () => {
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          const userId = decoded.id;

          const response = await fetch(`http://localhost:3000/cart/${userId}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) throw new Error("Failed to fetch cart");

          const data = await response.json();
          setCart(data.dishes);
        } catch (error) {
          console.error(error);
        }
      } else {
        const storedCart = localStorage.getItem("cart");
        setCart(storedCart ? JSON.parse(storedCart) : []);
      }
    };

    loadCart();
    window.addEventListener("cartUpdated", loadCart);

    return () => {
      window.removeEventListener("cartUpdated", loadCart);
    };
  }, [token]);


  const updateCart = (updatedCart: any) => {
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeFromCart = async (cartItemId: any) => {
    if (token) {
      try {
        const response = await fetch(`http://localhost:3000/cart/remove/${cartItemId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to remove item");

        setCart(cart.filter((item: any) => item._id !== cartItemId));
      } catch (error) {
        console.error(error);
      }
    } else {
      const updatedCart = cart.filter((item: any) => item._id !== cartItemId);
      updateCart(updatedCart);
    }
  };

  const updateQuantity = async (cartItemId: string, action: "increase" | "decrease") => {
    const item = cart.find((i: any) => i._id === cartItemId);
    if (!item) return;

    const newQuantity = action === "increase" ? item.quantity + 1 : item.quantity - 1;
    if (newQuantity < 1) return;

    if (token) {
      try {
        const response = await fetch("http://localhost:3000/cart/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cartItemId, action }),
        });

        if (!response.ok) throw new Error("Failed to update quantity");

        const updatedCart = cart.map((i: any) =>
          i._id === cartItemId ? { ...i, quantity: newQuantity } : i
        );
        setCart(updatedCart);
      } catch (error) {
        console.error(error);
      }
    } else {
      const updatedCart = cart.map((item: any) =>
        item._id === cartItemId ? { ...item, quantity: newQuantity } : item
      );
      updateCart(updatedCart);
    }
  };

  const totalPrice = cart.reduce((sum, item: any) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('There are no dish to checkout');
      return;
    }

    if (token) {
      navigate('/checkout');
    }
    else {
      toast.error('You must login to perform this action!')
    }
  }

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
      <div className={styles.cartHeader}>
        <p>Your Cart</p>
        <button className={styles.closeBtn} onClick={onClose}>✖</button>
      </div>

      <div className={styles.service}>
        <CiDeliveryTruck className={styles.deliverIcon} />
        <p>Free shipping for orders over <span style={{ fontWeight: 'bold' }}>800k</span> VND</p>
      </div>

      <div className={styles.cartContent}>
        {cart.length === 0 ? (
          <p className={styles.emptyCart}>There are no dish yet</p>
        ) : (
          cart.map((item: any) => (
            <div key={item._id} className={styles.cartItem}>
              <img src={item.imageUrl} alt={''} className={styles.cartItemImage} />

              <div className={styles.cartItemInfo}>
                <div className={styles.flexSpace}>
                  <div className={styles.groupInfor}>
                    <p className={styles.cartItemName}>{item.name}</p>
                    <p className={styles.cartCategory}>{item.categoryName}</p>
                  </div>

                  <button className={styles.removeBtn} onClick={() => removeFromCart(item._id)}>
                    <GoTrash />
                  </button>
                </div>

                <div className={styles.flexSpace} style={{ marginTop: '12px' }}>
                  <div className={styles.quantityControls}>
                    <button onClick={() => updateQuantity(item._id, "decrease")}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, "increase")}>+</button>
                  </div>

                  <p className={styles.cartItemPrice}>{item.price.toLocaleString()}₫</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.cartFooter}>
        <div className={styles.totalPrice}>
          <h3>TOTAL</h3>
          <h3>{totalPrice.toLocaleString()}₫</h3>
        </div>
        <button onClick={handleCheckout} className={styles.checkoutBtn}>Checkout</button>
      </div>
    </div>
  )
}

export default CartSidebar