import { Link } from "react-router"
import styles from '../css/Contact.module.css'
import { BsFacebook, BsInstagram, BsLinkedin, BsTwitter, BsYoutube } from "react-icons/bs"

function Contact() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.contactEmail}>
            <Link to="/" className={styles.logo}>
              Ambrosia
            </Link>
            <p className={styles.description}>
              Subscribe to our newsletter for the latest updates on features and releases.
            </p>
            <form className={styles.form}>
              <input type="email" placeholder="Your Email Here" className={styles.input} />
              <button className={styles.joinButton}>Join</button>
            </form>
            <p className={styles.disclaimer}>
              By subscribing you agree to our Privacy Policy and agree to receive updates.
            </p>
          </div>

          <div className={styles.quickLink}>
            <h3 className={styles.columnTitle}>Quick Links</h3>
            <ul className={styles.columnList}>
              <li>
                <Link to="/about" className={styles.columnLink}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className={styles.columnLink}>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/services" className={styles.columnLink}>
                  Services
                </Link>
              </li>
              <li>
                <Link to="/blog" className={styles.columnLink}>
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/faqs" className={styles.columnLink}>
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.connect}>
            <h3 className={styles.columnTitle}>Connect With Us</h3>
            <ul className={styles.columnList}>
              <li>
                <Link to="/careers" className={styles.columnLink}>
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/support" className={styles.columnLink}>
                  Support
                </Link>
              </li>
              <li>
                <Link to="/testimonials" className={styles.columnLink}>
                  Testimonials
                </Link>
              </li>
              <li>
                <Link to="/gallery" className={styles.columnLink}>
                  Gallery
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.stayConnect}>
            <h3 className={styles.columnTitle}>Stay Connected</h3>
            <div className={styles.socialLinks}>
              <Link to="#" className={styles.columnLink}>
                <BsFacebook className="h-5 w-5" />
              </Link>
              <Link to="#" className={styles.columnLink}>
                <BsInstagram className="h-5 w-5" />
              </Link>
              <Link to="#" className={styles.columnLink}>
                <BsTwitter className="h-5 w-5" />
              </Link>
              <Link to="#" className={styles.columnLink}>
                <BsLinkedin className="h-5 w-5" />
              </Link>
              <Link to="#" className={styles.columnLink}>
                <BsYoutube className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Contact
