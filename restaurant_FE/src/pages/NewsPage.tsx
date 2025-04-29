import { useState } from 'react'
import Header from '../components/Header'
import PageName from '../components/PageName';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import CartSidebar from '../components/CartSideBar';
import styles from '../css/PageCss/ContactPage.module.css'
import NewsDetail from '../components/NewsDetail';

function NewsPage() {
    const [isCartOpen, setIsCartOpen] = useState(false);

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
    };

    return (
        <>
            <Header fixed={false} onCartToggle={toggleCart} />
            <PageName name='News' />
            <NewsDetail />
            <Contact />
            <Footer />
            <CartSidebar isOpen={isCartOpen} onClose={toggleCart} />
            {isCartOpen && <div className={styles.overlay} onClick={toggleCart}></div>}
        </>
    )
}

export default NewsPage