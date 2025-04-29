import { useState } from "react";
import Header from "../components/Header";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import CartSidebar from "../components/CartSideBar";
import styles from '../css/PageCss/ContactPage.module.css'
import LinkRoute from "../components/LinkRoute";
import PrivacyPolicy from "../components/PrivacyPolicy";

function PrivacyPolicyPage() {
    const [isCartOpen, setIsCartOpen] = useState(false);

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
    };

    const link = [
        {
            id: 1,
            name: "Privacy Policy",
            path: `/privacy`
        },
    ]

    return (
        <>
            <Header fixed={false} onCartToggle={toggleCart} />
            <LinkRoute links={link}/>
            <PrivacyPolicy />
            <Contact />
            <Footer />
            <CartSidebar isOpen={isCartOpen} onClose={toggleCart} />
            {isCartOpen && <div className={styles.overlay} onClick={toggleCart}></div>}
        </>
    )
}

export default PrivacyPolicyPage