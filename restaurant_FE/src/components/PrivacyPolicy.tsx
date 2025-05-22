function PrivacyPolicy() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-10 text-[#5d4b3c]">
            <h2 className="text-3xl font-bold mb-6 text-center">Privacy Policy for Ambrosia</h2>

            <p className="text-center text-gray-600 mb-5">Last Updated: March 24, 2025</p>

            <div className="mb-8 text-base leading-relaxed bg-[#f5f2ed] rounded-md p-6">
                At Ambrosia, we value your privacy and are committed to protecting your personal information.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                when you visit our website <span className="italic">www.ambrosiarestaurant.com</span>, make a reservation,
                order online, or interact with us in other ways. Please read this policy carefully. By using
                our Site or services, you agree to the terms outlined below.
            </div>

            {[{
                key: "info-collect",
                title: "1. Information We Collect",
                intro: "We may collect the following types of information:",
                content: (
                    <>
                        <p className="mb-1 font-semibold">Personal Information</p>
                        <ul className="list-disc list-inside mb-4 space-y-1">
                            <li>Name, email address, phone number: When you make a reservation, place an online order, or sign up for our newsletter.</li>
                            <li>Payment Information: Such as credit card details when you make a purchase (processed securely through our payment partners).</li>
                            <li>Contact Information: If you reach out to us via email, phone, or contact forms.</li>
                        </ul>

                        <p className="mb-1 font-semibold">Non-Personal Information</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Browsing Data: Including IP address, browser type, device information, and pages visited on our Site, collected via cookies and similar technologies.</li>
                            <li>Preferences: Such as dietary preferences or favorite dishes, if shared with us.</li>
                        </ul>
                    </>
                )
            }, {
                key: "info-use",
                title: "2. How We Use Your Information",
                intro: "We use your information to:",
                content: (
                    <ul className="list-disc list-inside space-y-1">
                        <li>Process reservations, orders, and payments.</li>
                        <li>Send you confirmations, updates, or promotional offers (if you opt in).</li>
                        <li>Improve our website, menu, and customer service.</li>
                        <li>Respond to your inquiries or feedback.</li>
                        <li>Comply with legal obligations.</li>
                    </ul>
                )
            }, {
                key: "info-share",
                title: "3. How We Share Your Information",
                intro: "We do not sell your personal information. We may share it with:",
                content: (
                    <ul className="list-disc list-inside space-y-1">
                        <li><strong>Service Providers:</strong> Third parties who assist with payment processing, website hosting, or marketing (e.g., reservation platforms like OpenTable).</li>
                        <li><strong>Legal Authorities:</strong> If required by law or to protect our rights and safety.</li>
                        <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets.</li>
                    </ul>
                )
            }, {
                key: "cookies",
                title: "4. Cookies and Tracking Technologies",
                intro: "We use cookies to enhance your experience on our Site. These may include:",
                content: (
                    <ul className="list-disc list-inside space-y-1">
                        <li>Essential cookies for Site functionality.</li>
                        <li>Analytics cookies to understand how visitors use our Site. You can manage cookie preferences through your browser settings.</li>
                    </ul>
                )
            }, {
                key: "choices",
                title: "5. Your Choices",
                intro: null,
                content: (
                    <ul className="list-disc list-inside space-y-1">
                        <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails using the link in any email we send.</li>
                        <li><strong>Access or Update:</strong> Contact us to review or update your personal information.</li>
                        <li><strong>Cookies:</strong> Disable cookies in your browser, though this may affect Site functionality.</li>
                    </ul>
                )
            }, {
                key: "security",
                title: "6. Data Security & Third-Party Links",
                intro: null,
                content: (
                    <>
                        <p className="mb-4">
                            We implement reasonable measures to protect your information from unauthorized access,
                            loss, or misuse. However, no online transmission is 100% secure, and we cannot guarantee
                            absolute security.
                        </p>
                        <p>
                            Our Site may contain links to third-party websites (e.g., social media or review platforms).
                            We are not responsible for their privacy practices and encourage you to review their
                            policies.
                        </p>
                    </>
                )
            }, {
                key: "children",
                title: "7. Children’s Privacy",
                intro: null,
                content: (
                    <p>
                        Our services are not directed to individuals under 13. We do not knowingly collect
                        personal information from children. If we learn such data has been collected, we will
                        delete it promptly.
                    </p>
                )
            }, {
                key: "intl-users",
                title: "8. International Users",
                intro: null,
                content: (
                    <p>
                        Ambrosia is based in [insert country, e.g., the United States]. If you access our Site
                        from outside this country, your information may be transferred to and processed in
                        accordance with applicable local laws.
                    </p>
                )
            }, {
                key: "changes",
                title: "9. Changes to This Privacy Policy",
                intro: null,
                content: (
                    <p>
                        We may update this policy from time to time. Changes will be posted on this page with
                        an updated "Last Updated" date. Please check back periodically.
                    </p>
                )
            }].map(({ key, title, intro, content }) => (
                <section key={key} className="mb-10">
                    <h3 className="text-xl font-semibold mb-3">{title}</h3>
                    {intro && <p className="mb-2">{intro}</p>}
                    {content}
                </section>
            ))}

            <div className="mt-16 text-center text-lg font-semibold">Thank you for choosing Ambrosia. We’re delighted to serve you!</div>
        </div>
    )
}

export default PrivacyPolicy
