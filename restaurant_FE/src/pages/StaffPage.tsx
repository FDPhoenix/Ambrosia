import { useLocation } from "react-router";
import ChefHeader from "../components/Staff/StaffHeader";
import ChefSidebar from "../components/Staff/StaffSidebar";
import TableReservationList from "../components/Staff/TableReservationList";
import styles from '../css/StaffCss/StaffPage.module.css';
import FeedbackContent from "../components/Admin/FeedbackContent";
// import Cookies from "js-cookie";
import IngredientContent from "../components/Admin/IngredientContent";
import OrderContent from "../components/Admin/OrderContent";
import Cookies from "js-cookie";
import { ToastContainer } from "react-toastify";
import { jwtDecode } from "jwt-decode";

function StaffPage() {
    const location = useLocation();
    const token = Cookies.get('token')
    const decodedToken: any = jwtDecode(token);

    const getTitle = () => {
        switch (location.pathname) {
            case "/staff/reservation":
                return "Reservation Order";
            case "/staff/order":
                return "Order Management"
            case "/staff/feedback":
                return "Feedback Management";
            case "/staff/ingredient":
                return "Ingredient Management";
            default:
                return "Dashboard";
        }
    };

    const getContentComponent = () => {
        switch (location.pathname) {
            case "/staff/reservation":
                return <TableReservationList />
            case "/staff/order":
                return <OrderContent />
            case "/staff/feedback":
                return <FeedbackContent />;
            case "/staff/ingredient":
                return <IngredientContent />;
            default:
                return <TableReservationList />;
        }
    };


    return (
        token && decodedToken.roleId == '67ac64c7e072694cafa16e7a' ? (
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

export default StaffPage;
