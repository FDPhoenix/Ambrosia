import { useLocation } from "react-router";
import AdminHeader from "../components/Admin/AdminHeader";
import AdminSidebar from "../components/Admin/AdminSidebar";
import DashboardContent from "../components/Admin/DashboardContent";
import styles from '../css/AdminCss/AdminPage.module.css';
import UserContent from "../components/Admin/UserContent";
import EmployeeContent from "../components/Admin/EmployeeContent";
import TableContent from "../components/Admin/TableContent";
import DishContent from "../components/Admin/DishContent";
import CategoryContent from "../components/Admin/CategoryContent";
import RankContent from "../components/Admin/RankContent";
import FeedbackContent from "../components/Admin/FeedbackContent";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import IngredientContent from "../components/Admin/IngredientContent";
import SystemReviewContent from "../components/Admin/SystemReviewContent";
import OrderContent from "../components/Admin/OrderContent";
import { ToastContainer } from "react-toastify";
import VoucherContent from "../components/Admin/VoucherContent";
import NewsContent from "../components/Admin/NewsContent";

function AdminPage() {
  const location = useLocation();
  const token = Cookies.get('token')
  const decodedToken: any = jwtDecode(token);

  const getTitle = () => {
    switch (location.pathname) {
      case "/manage/user":
        return "User Management";
      case "/manage/employee":
        return "Employee Management";
      case "/manage/table":
        return "Table Management";
      case "/manage/dish":
        return "Dish Management";
      case "/manage/category":
        return "Category Management";
      case "/manage/rank":
        return "Rank Management";
      case "/manage/feedback":
        return "Feedback Management";
      case "/manage/ingredient":
        return "Ingredient Management";
      case "/manage/system-review":
        return "System Review Management"
      case "/manage/order":
        return "Order Management";
      case "/manage/voucher":
        return "Voucher Management";
      case "/manage/news":
        return "News Management"
      default:
        return "Dashboard";
    }
  };

  const getContentComponent = () => {
    switch (location.pathname) {
      case "/manage/user":
        return <UserContent />;
      case "/manage/employee":
        return <EmployeeContent />;
      case "/manage/table":
        return <TableContent />;
      case "/manage/dish":
        return <DishContent />;
      case "/manage/category":
        return <CategoryContent />;
      case "/manage/rank":
        return <RankContent />;
      case "/manage/feedback":
        return <FeedbackContent />;
      case "/manage/ingredient":
        return <IngredientContent />;
      case "/manage/system-review":
        return <SystemReviewContent />
      case "/manage/order":
        return <OrderContent />;
      case "/manage/voucher":
        return <VoucherContent />;
      case "/manage/news":
        return <NewsContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    token && decodedToken.roleId == '67ac64afe072694cafa16e76' ? (
      <div className={styles.pageContainer}>
        <AdminSidebar />

        <div className={styles.rightSide}>
          <AdminHeader title={getTitle()} />
          {getContentComponent()}
          <ToastContainer theme="colored" />
        </div>
      </div>
    ) : (
      <div>You don't have permission to access this page</div>
    )
  );
}

export default AdminPage;
