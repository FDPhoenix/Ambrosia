import { Link, useLocation, useNavigate } from 'react-router';
import styles from '../../css/AdminCss/AdminSidebar.module.css';
import { BiLogIn, BiUserPlus } from 'react-icons/bi';
import UserIcon from '../../assets/user.png';
import EmployeeIcon from '../../assets/employees.png';
import DishIcon from '../../assets/dish.png';
import TableIcon from '../../assets/round-table.png';
import CategoryIcon from '../../assets/category.png';
import RankIcon from '../../assets/ranking.png';
import RestaurantIcon from '../../assets/cutlery.png';
import FeedbackIcon from '../../assets/feedback.png';
import IngredientIcon from '../../assets/ingredient.png';
import SystemReview from '../../assets/customer-experience.png';
import OrderIcon from '../../assets/checklist.png';
import VoucherIcon from '../../assets/coupon.png'
import NewsIcon from '../../assets/news.png'

function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo} onClick={() => navigate('/')}>
        <div className={styles.logoIcon}>
          <img src={RestaurantIcon} alt="logo" />
        </div>
        <span className={styles.logoText}>Ambrosia</span>
      </div>

      <nav className={styles.nav}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>HOME</h3>
          <ul className={styles.menu}>
            <li>
              <Link
                to="/manage/dashboard"
                className={`${styles.menuItem} ${location.pathname === '/manage/dashboard' ? styles.active : ''}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-layout-dashboard w-5 h-5"
                >
                  <rect width="7" height="9" x="3" y="3" rx="1"></rect>
                  <rect width="7" height="5" x="14" y="3" rx="1"></rect>
                  <rect width="7" height="9" x="14" y="12" rx="1"></rect>
                  <rect width="7" height="5" x="3" y="16" rx="1"></rect>
                </svg>
                <span>Dashboard</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>MANAGEMENT</h3>
          <ul className={styles.menu}>
            {[
              { path: '/manage/user', icon: UserIcon, label: 'User' },
              { path: '/manage/employee', icon: EmployeeIcon, label: 'Employee' },
              { path: '/manage/table', icon: TableIcon, label: 'Table' },
              { path: '/manage/dish', icon: DishIcon, label: 'Dish' },
              { path: '/manage/category', icon: CategoryIcon, label: 'Category' },
              { path: '/manage/order', icon: OrderIcon, label: 'Order' },
              { path: '/manage/rank', icon: RankIcon, label: 'Rank' },
              { path: '/manage/feedback', icon: FeedbackIcon, label: 'Feedback' },
              { path: '/manage/ingredient', icon: IngredientIcon, label: 'Ingredient' },
              { path: '/manage/voucher', icon: VoucherIcon, label: 'Voucher' },
              { path: '/manage/news', icon: NewsIcon, label: 'News' },
            ].map(({ path, icon, label }) => (
              <li key={path}>
                <Link to={path} className={`${styles.menuItem} ${location.pathname === path ? styles.active : ''}`}>
                  <img src={icon} alt={label} style={{ width: '24px', height: '24px' }} />
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>EXTRA</h3>
          <ul className={styles.menu}>
            <li>
              <Link to="/manage/system-review" className={`${styles.menuItem} ${location.pathname === '/manage/system-review' ? styles.active : ''}`}>
              <img src={SystemReview} alt={''} style={{ width: '24px', height: '24px' }} />
                <span>System Review</span>
              </Link>
            </li>
            <li>
              <Link to="/manage/register" className={`${styles.menuItem} ${location.pathname === '/auth/register' ? styles.active : ''}`}>
                <BiUserPlus className={styles.icon} />
                <span>Other</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
}

export default AdminSidebar;
