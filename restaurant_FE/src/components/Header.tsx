import { BsFillBagFill, BsSearch } from 'react-icons/bs'
import styles from '../css/Header.module.css'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react';
import avatar from '../assets/avatar.png'
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import EditProfile from './UserProfile';

interface HeaderProps {
  fixed?: boolean;
  onCartToggle: () => void;
}

function Header({ fixed = false, onCartToggle }: HeaderProps) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownView, setDropdownView] = useState<'main' | 'editProfile' | 'changePassword'>('main'); //
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleSearch = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?name=${encodeURIComponent(searchTerm)}`);
    }
  };

  useEffect(() => {
    const token = Cookies.get('token') ?? null;
    setUserToken(token);

    if (token) {
      const decodedToken: any = jwtDecode(token);
      setUserImage(decodedToken.image);
      setIsAdmin(decodedToken.roleId == '67ac64afe072694cafa16e76');
    } else {
      setIsAdmin(false);
    }
  }, [userToken]);

  const handleLogout = () => {
    Cookies.remove('token');
    setUserToken(null);
    setIsDropdownOpen(false);
    navigate('/login');
  };

  // Xử lý click ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setDropdownView('main'); // Reset về main menu khi đóng Dropdown
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Hàm chuyển sang giao diện Edit Profile
  const showEditProfile = () => {
    setDropdownView('editProfile');
  };

  // Hàm quay lại Main Menu
  const showMainMenu = () => {
    setDropdownView('main');
  };

  // Hàm chuyển sang Change Password (sẽ được gọi từ EditProfile)
  const showChangePassword = () => {
    setDropdownView('changePassword');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className={`${styles.header} ${fixed ? styles.fixed : ''}`}>
      <div className={`${styles.container} ${styles.headerContainer}`}>
        <div className={styles.logoContainer}>
          <Link to="/" className={styles.logo}>
            Ambrosia
          </Link>

          <nav className={styles.nav}>
            <ul className={styles.navList}>
              <li>
                <Link to="/menu" className={styles.navLink}>
                  Menu
                </Link>
              </li>

              <li>
                <Link to="/about" className={styles.navLink}>
                  About Us
                </Link>
              </li>

              <li>
                <Link to="/news" className={styles.navLink}>
                  News
                </Link>
              </li>

              <li>
                <Link to="/contact" className={styles.navLink}>
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className={styles.other}>
          <form className={styles.searchContainer} onSubmit={handleSearch}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder='Searching dish....'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">
              <BsSearch className={styles.searchIcon} />
            </button>
          </form>

          <button className={styles.cartButton} onClick={onCartToggle}>
            <BsFillBagFill className={styles.cart} />
          </button>

          {userToken ? (
            <div className={styles.profileContainer} ref={dropdownRef}>
              <div
                className={styles.profile}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <img src={userImage || avatar} alt="" />
              </div>

              {isDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  {/* Main Menu */}
                  <div className={`${styles.dropdownContent} ${dropdownView === 'main' ? '' : styles.hidden}`} >
                    <div
                      className={styles.dropdownItem}
                      onClick={showEditProfile}
                    >
                      Profile
                    </div>
                    <Link
                      to="/history"
                      className={styles.dropdownItem}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      History
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/manage/dashboard"
                        className={styles.dropdownItem}
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Manage System
                      </Link>
                    )}
                    <button
                      className={styles.dropdownItem}
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>

                  {/* Edit Profile View */}
                  <div
                    className={`${styles.dropdownContent} ${dropdownView === 'editProfile' ? '' : styles.hidden
                      }`}
                  >
                    <div className={styles.backButton} onClick={showMainMenu}>
                      ⬅ Back
                    </div>
                    <EditProfile onChangePasswordClick={showChangePassword} />
                  </div>

                  {/* Change Password View */}
                  <div
                    className={`${styles.dropdownContent} ${dropdownView === 'changePassword' ? '' : styles.hidden
                      }`}
                  >
                    <div className={styles.backButton} onClick={showEditProfile}>
                      ⬅ Back
                    </div>
                    <EditProfile onChangePasswordClick={showChangePassword} isChangePassword={true} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => navigate('/login')} className={styles.loginButton}>
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
