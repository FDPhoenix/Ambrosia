import { useLocation } from "react-router";
import ChefHeader from "../components/Chef/ChefHeader";
import ChefSidebar from "../components/Chef/ChefSidebar";
import styles from '../css/ChefCss/ChefPage.module.css';
import FeedbackContent from "../components/Admin/FeedbackContent";
// import Cookies from "js-cookie";
import IngredientContent from "../components/Admin/IngredientContent";
import OrderContent from "../components/Admin/OrderContent";
import BookingOrderManagement from "../components/Chef/BookingOrderManagement";
import Cookies from "js-cookie";
import { ToastContainer } from "react-toastify";
import { jwtDecode } from "jwt-decode";

function ChefPage() {
    const location = useLocation();
    const token = Cookies.get('token')
    const decodedToken: any = jwtDecode(token);

    const getTitle = () => {
        switch (location.pathname) {
            case "/chef/reservation":
                return "Reservation Order";
            case "/chef/order":
                return "Order Management"
            case "/chef/feedback":
                return "Feedback Management";
            case "/chef/ingredient":
                return "Ingredient Management";
            default:
                return "Dashboard";
        }
    };

    const getContentComponent = () => {
        switch (location.pathname) {
            case "/chef/reservation":
                return <BookingOrderManagement />
            case "/chef/order":
                return <OrderContent />
            case "/chef/feedback":
                return <FeedbackContent />;
            case "/chef/ingredient":
                return <IngredientContent />;
            default:
                return <BookingOrderManagement />;
        }
    };


    return (
        token && decodedToken.roleId == '67ac667ae072694cafa16e7c' ? (
            <div className={styles.pageContainer}>
                <ChefSidebar />

                <div className={styles.rightSide}>
                    <ChefHeader title={getTitle()} />
                    {getContentComponent()}
                </div>

                <ToastContainer theme="colored" />
            </div>
        ) : (
            <div>You don't have permission to access this page</div>
        )
    );

}

export default ChefPage;
