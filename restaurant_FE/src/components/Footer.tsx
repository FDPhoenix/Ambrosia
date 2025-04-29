import { Link } from 'react-router'
import styles from '../css/Footer.module.css'

function Footer() {
    return (
        <div className={styles.footer} style={{ borderTop: '1px solid #8B7355' }}>
            <p>© 2025 Ambrosia. All rights reserved</p>
            <div className={styles.footerLinks}>
                <Link to="/privacy" className={styles.columnLink}>
                    Privacy Policy
                </Link>
                <Link to="/terms" className={styles.columnLink}>
                    Terms of Service
                </Link>
                <Link to="/cookies" className={styles.columnLink}>
                    Cookie Settings
                </Link>
            </div>
        </div>
    )
}

export default Footer
