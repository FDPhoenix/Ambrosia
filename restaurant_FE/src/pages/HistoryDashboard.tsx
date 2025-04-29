import { useState } from "react";
import BookingHistory from "./BookingHistory";
import OrderHistory from './OrderHistory';
import styles from "../css/HistoryDashboard.module.css";
import Header from "../components/Header";
import CartSidebar from "../components/CartSideBar";
import PageName from "../components/PageName";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

export default function HistoryDashboard() {
  const [activeTab, setActiveTab] = useState("booking");
  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <>
      <Header fixed={false} onCartToggle={toggleCart} />

      <PageName name={'History'} />

      <div className={styles.backGround}>
        <div className={styles.container}>
          <ul className={styles.navTabs}>
            <li className={styles.navItem}>
              <button
                className={`${styles.navLink} ${activeTab === "booking" ? styles.active : ""}`}
                onClick={() => setActiveTab("booking")}
              >
                Booking History
              </button>
            </li>
            <li className={styles.navItem}>
              <button
                className={`${styles.navLink} ${activeTab === "order" ? styles.active : ""}`}
                onClick={() => setActiveTab("order")}
              >
                Order History
              </button>
            </li>
          </ul>

          <div className={styles.tabContent}>
            {activeTab === "booking" && <BookingHistory />}
            {activeTab === "order" && <OrderHistory />}
          </div>
        </div>
      </div>

      <Contact />

      <Footer />

      <CartSidebar isOpen={isCartOpen} onClose={toggleCart} />
      {isCartOpen && <div className={styles.overlay} onClick={toggleCart}></div>}
    </>
  );
}