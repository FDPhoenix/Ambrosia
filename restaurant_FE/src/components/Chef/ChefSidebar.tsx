import { Link, useLocation, useNavigate } from 'react-router';
import styles from '../../css/ChefCss/ChefSidebar.module.css';
import { BiUserPlus } from 'react-icons/bi';
import FeedbackIcon from '../../assets/feedback.png';
import IngredientIcon from '../../assets/ingredient.png';
import Reservation from '../../assets/reception.png';
import LogOut from '../../assets/logout.png';
import OrderIcon from '../../assets/checklist.png';
import ChefIcon from '../../assets/chef.png';
import Cookies from 'js-cookie';
import { useState } from 'react';

function ChefSidebar() {
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
        <img src={ChefIcon} alt="Chef" className={styles.logoIcon} />
        <span className={styles.logoText}>Ambrosia</span>

      </div>

      <nav className={styles.nav}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>MANAGEMENT</h3>
          <ul className={styles.menu}>
            <li>
              <Link
                to="/chef/reservation"
                className={`${styles.menuItem} ${location.pathname === '/chef' || location.pathname === '/chef/reservation' ? styles.active : ''
                  }`}
              >
                <img src={Reservation} alt="Reservation Order" style={{ width: '24px', height: '24px' }} />
                <span>Reservation Order</span>
              </Link>
            </li>

            <li>
              <Link
                to="/chef/order"
                className={`${styles.menuItem} ${location.pathname === '/chef/order' ? styles.active : ''}`}
              >
                <img src={OrderIcon} alt="Order" style={{ width: '24px', height: '24px' }} />
                <span>Order</span>
              </Link>
            </li>

            <li>
              <Link
                to="/chef/feedback"
                className={`${styles.menuItem} ${location.pathname === '/chef/feedback' ? styles.active : ''}`}
              >
                <img src={FeedbackIcon} alt="Feedback" style={{ width: '24px', height: '24px' }} />
                <span>Feedback</span>
              </Link>
            </li>

            <li>
              <Link
                to="/chef/ingredient"
                className={`${styles.menuItem} ${location.pathname === '/chef/ingredient' ? styles.active : ''}`}
              >
                <img src={IngredientIcon} alt="Ingredient" style={{ width: '24px', height: '24px' }} />
                <span>Ingredient</span>
              </Link>
            </li>
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
              <Link to="/chef/register" className={`${styles.menuItem} ${location.pathname === '/auth/register' ? styles.active : ''}`}>
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

export default ChefSidebar;
