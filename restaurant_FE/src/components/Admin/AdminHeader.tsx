import styles from '../../css/AdminCss/AdminHeader.module.css'
import avt from '../../assets/avatar.png'
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

function AdminHeader(props: { title: string }) {
    const token = Cookies.get("token") ?? null;
    var decodeToken: any;
    
    if (token) {
        decodeToken = jwtDecode(token);
    }

    return (
        <div className={styles.adminHeader}>
            <h1 className={styles.h1}>{props.title}</h1>

            <div className={styles.avatarContainer}>
                <div className={styles.bellIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg"
                        className="icon icon-tabler icon-tabler-bell-ringing"
                        width="22px"
                        height="22px"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M10 5a2 2 0 0 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6"></path>
                        <path d="M9 17v1a3 3 0 0 0 6 0v-1"></path>   <path d="M21 6.727a11.05 11.05 0 0 0 -2.794 -3.727"></path>
                        <path d="M3 6.727a11.05 11.05 0 0 1 2.792 -3.727"></path>
                    </svg>
                </div>

                <div className={styles.avatar}>
                    <img src={decodeToken.image || avt} alt="User avatar" style={{ width: '35px', height: '35px' }} />
                </div>
            </div>
        </div>
    )
}

export default AdminHeader