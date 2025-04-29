import { useState } from 'react'
import Contact from '../components/Contact'
import Footer from '../components/Footer'
import Header from '../components/Header'
import PageName from '../components/PageName'
import styles from '../css/PageCss/ContactPage.module.css'
import ContactDetail from '../components/ContactDetail'
import CartSidebar from '../components/CartSideBar'

function ContactPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <>
      <Header fixed={false} onCartToggle={toggleCart} />
      <PageName name='Contact' />
      <ContactDetail />
      <Contact />
      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={toggleCart}/>
      {isCartOpen && <div className={styles.overlay} onClick={toggleCart}></div>}
    </>
  )
}

export default ContactPage