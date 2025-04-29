import React, { useState } from 'react'
import Header from '../components/Header'
import LinkRoute from '../components/LinkRoute'
import TermsOfService from '../components/TermsOfService'
import Contact from '../components/Contact'
import Footer from '../components/Footer'
import CartSidebar from '../components/CartSideBar'
import styles from '../css/PageCss/ContactPage.module.css'


function TermsOfServicePage() {
    const [isCartOpen, setIsCartOpen] = useState(false);

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
    };

    const link = [
        {
            id: 1,
            name: "Terms of service",
            path: `/privacy`
        },
    ]

    return (
        <>
            <Header fixed={false} onCartToggle={toggleCart}/>
            <LinkRoute links={link}/>
            <TermsOfService />
            <Contact />
            <Footer />
            <CartSidebar isOpen={isCartOpen} onClose={toggleCart} />
            {isCartOpen && <div className={styles.overlay} onClick={toggleCart}></div>}
        </>
    )
}

export default TermsOfServicePage