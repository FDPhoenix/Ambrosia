import { useLocation } from "react-router"
import Contact from "../components/Contact"
import Footer from "../components/Footer"
import Header from "../components/Header"
import LinkRoute from "../components/LinkRoute"
import SearchResult from "../components/SearchResult"
import { useState } from "react"
import CartSidebar from "../components/CartSideBar"
import styles from '../css/PageCss/ContactPage.module.css'

function SearchPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const name = params.get("name");
  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const link = [
    {
      id: 1,
      name: "search",
      path: `/search?name=${name}`
    },
  ]

  return (
    <>
      <Header fixed={false} onCartToggle={toggleCart} />
      <LinkRoute links={link} />
      <SearchResult />
      <Contact />
      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={toggleCart} />
      {isCartOpen && <div className={styles.overlay} onClick={toggleCart}></div>}
    </>
  )
}

export default SearchPage
