import { Link, useLocation, useNavigate } from 'react-router';
import styles from '../../css/StaffCss/StaffSidebar.module.css';
import { BiUserPlus } from 'react-icons/bi';
import FeedbackIcon from '../../assets/feedback.png';
import IngredientIcon from '../../assets/ingredient.png';
import OrderIcon from '../../assets/checklist.png';
import Staffreservation from '../../assets/Staffreservation.png';
import LogOut from '../../assets/logout.png';
import waiterIcon from '../../assets/waiter.png';
import Cookies from 'js-cookie';
import { useState } from 'react';

function StaffSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowLogoutModal(true);
  };

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('userImage');
    navigate('/login');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo} onClick={() => navigate('/')}>
        <img src={waiterIcon} alt="Waiter" className={styles.logoIcon} />
        <span className={styles.logoText}>Ambrosia</span>
      </div>

      <nav className={styles.nav}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>MANAGEMENT</h3>
          {/* <ul className={styles.menu}>
            {[
              { path: '/staff/reservation', icon: Staffreservation, label: 'Reservation Order' },
              { path: '/staff/order', icon: OrderIcon, label: 'Order' },
              { path: '/staff/feedback', icon: FeedbackIcon, label: 'Feedback' },
              { path: '/staff/ingredient', icon: IngredientIcon, label: 'Ingredient' },
            ].map(({ path, icon, label }) => (
              <li key={path}>
                <Link to={path} className={`${styles.menuItem} ${location.pathname === path ? styles.active : ''}`}>
                  <img src={icon} alt={label} style={{ width: '24px', height: '24px' }} />
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul> */}

          <ul className={styles.menu}>
            <li>
              <Link
                to="/staff/reservation"
                className={`${styles.menuItem} ${location.pathname === '/staff' || location.pathname === '/staff/reservation'
                  ? styles.active
                  : ''
                  }`}
              >
                <img src={Staffreservation} alt="Reservation Order" style={{ width: '24px', height: '24px' }} />
                <span>Reservation Order</span>
              </Link>
            </li>

            {[
              { path: '/staff/order', icon: OrderIcon, label: 'Order' },
              { path: '/staff/feedback', icon: FeedbackIcon, label: 'Feedback' },
              { path: '/staff/ingredient', icon: IngredientIcon, label: 'Ingredient' },
            ].map(({ path, icon, label }) => (
              <li key={path}>
                <Link
                  to={path}
                  className={`${styles.menuItem} ${location.pathname === path ? styles.active : ''}`}
                >
                  <img src={icon} alt={label} style={{ width: '24px', height: '24px' }} />
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>

        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>AUTH</h3>
          <ul className={styles.menu}>
            <li>
              <Link
                to="/login"
                onClick={(e) => handleLogoutConfirm(e)}
                className={`${styles.menuItem} ${location.pathname === '/login' ? styles.active : ''}`}
              >
                <img src={LogOut} alt="Log Out" style={{ width: '24px', height: '24px' }} />
                <span>Log Out</span>
              </Link>
            </li>

            <li>
              <Link to="/staff/register" className={`${styles.menuItem} ${location.pathname === '/auth/register' ? styles.active : ''}`}>
                <BiUserPlus className={styles.icon} />
                <span>Other</span>
              </Link>
            </li>
          </ul>
        </div>

        {showLogoutModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Confirm Log Out</h3>
              <p>Are you sure you want to log out?</p>
              <div className={styles.modalActions}>
                <button className={styles.confirmBtn} onClick={handleLogout}>OK</button>
                <button className={styles.cancelBtn} onClick={() => setShowLogoutModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}

export default StaffSidebar;
