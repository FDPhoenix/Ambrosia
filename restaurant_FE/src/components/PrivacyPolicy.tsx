import styles from '../css/PrivacyPolicy.module.css'

function PrivacyPolicy() {
    return (
        <div className={styles.container}>
            <h2>Privacy Policy for Ambrosia</h2>

            <p style={{ textAlign: 'center', color: "#666", marginBottom: '20px' }}>Last Updated: March 24, 2025</p>

            <div className={styles.intro}>
                At Ambrosia, we value your privacy and are committed to protecting your personal information.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                when you visit our website <span className={styles.italic}>www.ambrosiarestaurant.com</span>, make a reservation,
                order online, or interact with us in other ways. Please read this policy carefully. By using
                our Site or services, you agree to the terms outlined below.
            </div>

            <div className={styles.section}>
                <h3>1. Information We Collect</h3>

                <p style={{marginBottom: '5px'}}>We may collect the following types of information:</p>

                <p><strong>Personal Information</strong></p>
                <ul>
                    <li>Name, email address, phone number: When you make a reservation, place an online order, or sign up for our newsletter.</li>
                    <li>Payment Information: Such as credit card details when you make a purchase (processed securely through our payment partners).</li>
                    <li>Contact Information: If you reach out to us via email, phone, or contact forms.</li>
                </ul>

                <p><strong>Non-Personal Information</strong></p>
                <ul>
                    <li>Browsing Data: Including IP address, browser type, device information, and pages visited on our Site, collected via cookies and similar technologies.</li>
                    <li>Preferences: Such as dietary preferences or favorite dishes, if shared with us.</li>
                </ul>
            </div>

            <div className={styles.section}>
                <h3>2. How We Use Your Information</h3>

                <p style={{marginBottom: '5px'}}>We use your information to:</p>

                <ul>
                    <li>Process reservations, orders, and payments.</li>
                    <li>Send you confirmations, updates, or promotional offers (if you opt in).</li>
                    <li>Improve our website, menu, and customer service.</li>
                    <li>Respond to your inquiries or feedback.</li>
                    <li>Comply with legal obligations.</li>
                </ul>
            </div>

            <div className={styles.section}>
                <h3>3. How We Share Your Information</h3>

                <p style={{marginBottom: '5px'}}>We do not sell your personal information. We may share it with:</p>

                <ul>
                    <li><strong>Service Providers:</strong> Third parties who assist with payment processing, website hosting, or marketing (e.g., reservation platforms like OpenTable).</li>
                    <li><strong>Legal Authorities:</strong> If required by law or to protect our rights and safety.</li>
                    <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets.</li>
                </ul>
            </div>

            <div className={styles.section}>
                <h3>4. Cookies and Tracking Technologies</h3>

                <p style={{marginBottom: '5px'}}>We use cookies to enhance your experience on our Site. These may include:</p>

                <ul>
                    <li>Essential cookies for Site functionality.</li>
                    <li>Analytics cookies to understand how visitors use our Site. You can manage cookie preferences through your browser settings.</li>
                </ul>
            </div>

            <div className={styles.section}>
                <h3>5. Your Choices</h3>

                <ul>
                    <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails using the link in any email we send.</li>
                    <li><strong>Access or Update:</strong> Contact us to review or update your personal information.</li>
                    <li><strong>Cookies:</strong> Disable cookies in your browser, though this may affect Site functionality.</li>
                </ul>
            </div>

            <div className={styles.section}>
                <h3>6. Data Security & Third-Party Links</h3>

                <p>
                    We implement reasonable measures to protect your information from unauthorized access,
                    loss, or misuse. However, no online transmission is 100% secure, and we cannot guarantee
                    absolute security.
                </p>

                <p>
                    Our Site may contain links to third-party websites (e.g., social media or review platforms).
                    We are not responsible for their privacy practices and encourage you to review their
                    policies.
                </p>
            </div>

            <div className={styles.section}>
                <h3>7. Children’s Privacy</h3>

                <p>
                    Our services are not directed to individuals under 13. We do not knowingly collect
                    personal information from children. If we learn such data has been collected, we will
                    delete it promptly.
                </p>
            </div>

            <div className={styles.section}>
                <h3>8. International Users</h3>

                <p>
                    Ambrosia is based in [insert country, e.g., the United States]. If you access our Site
                    from outside this country, your information may be transferred to and processed in
                    accordance with applicable local laws.
                </p>
            </div>

            <div className={styles.section}>
                <h3>9. Changes to This Privacy Policy</h3>

                <p>
                    We may update this policy from time to time. Changes will be posted on this page with
                    an updated "Last Updated" date. Please check back periodically.
                </p>
            </div>

            <div className={styles.thank}>Thank you for choosing Ambrosia. We’re delighted to serve you!</div>
        </div>
    )
}

export default PrivacyPolicy