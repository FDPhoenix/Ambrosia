import { useState, useEffect } from "react";
import Header from "../components/Header";
import LinkRoute from "../components/LinkRoute";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import { useParams } from "react-router";
import CartSidebar from "../components/CartSideBar";
import styles from "../css/PageCss/HomePage.module.css";
import DishDetail from "../components/DishDetail";
import { ToastContainer } from "react-toastify";

interface Dish {
    _id: string;
    name: string;
    imageUrl: string;
    categoryName: string;
    description: string;
    price: number;
    isAvailable: boolean;
}

function DishDetailPage() {
    const { id } = useParams();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [dish, setDish] = useState<Dish | null>(null);

    const link = [
        { id: 1, name: "menu", path: `/menu` },
        { id: 2, name: dish ? dish.name : "Dish Detail", path: `/menu/${id}` },
    ];

    useEffect(() => {
        const fetchDish = async () => {
            try {
                const response = await fetch(`http://localhost:3000/dishes/detail/${id}`);
                if (!response.ok) {
                    throw new Error("Network response wasn't ok");
                }
                const data = await response.json();
                setDish(data.dish);
            } catch (error) {
                console.error("Error fetching dish:", error);
            }
        };

        fetchDish();
    }, [id]);

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
    };

    return (
        <>
            <Header fixed={false} onCartToggle={toggleCart} />
            <LinkRoute links={link} />
            {dish ? <DishDetail dishInfor={dish} /> : <p>Loading...</p>}
            <Contact />
            <Footer />
            <CartSidebar isOpen={isCartOpen} onClose={toggleCart} />
            {isCartOpen && <div className={styles.overlay} onClick={toggleCart}></div>}
            <ToastContainer theme="colored" />
        </>
    );
}

export default DishDetailPage;