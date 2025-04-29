import { useState } from "react"
import {
    FaChevronDown,
    FaChevronUp,
    FaFileContract,
    FaUserShield,
    FaTools,
    FaFileAlt,
    FaTimesCircle,
    FaExclamationTriangle,
    FaBalanceScaleLeft,
    FaGlobe,
} from "react-icons/fa"
import styles from "../css/TermsOfService.module.css"
import { Link } from "react-router"


export default function TermsOfService() {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        definitions: false,
        general: false,
        account: false,
        usage: false,
        content: false,
        termination: false,
        liability: false,
        governing: false,
    })

    const toggleSection = (termSection: string) => {
        setExpandedSections((prev) => {
            const isCurrentlyOpen = prev[termSection]

            if (isCurrentlyOpen) {
                return {
                    ...prev,
                    [termSection]: false,
                }
            }

            const newState: Record<string, boolean> = {}
            Object.keys(prev).forEach((key) => {
                newState[key] = key === termSection
            })
            return newState
        })
    }

    return (
        <div className={styles.termContainer}>
            <div className={styles.termContent}>
                <div className={styles.termHeader}>
                    <h1>Terms of Service</h1>
                    <p>Ambrosia Restaurant Management System</p>
                </div>

                <div className={styles.termIntro}>
                    <p>
                        Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Ambrosia
                        Restaurant Management System (the "Service") operated by Ambrosia Solutions Inc. ("us", "we", or "our").
                    </p>
                    <p>
                        Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms.
                        These Terms apply to all visitors, users, and others who access or use the Service.
                    </p>
                    <p>
                        By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the
                        terms, then you may not access the Service.
                    </p>
                </div>

                <div className={styles.termSection}>
                    <div className={styles.termSectionHeader} onClick={() => toggleSection("definitions")}>
                        <div className={styles.termSectionTitle}>
                            <FaBalanceScaleLeft className={styles.termSectionIcon} />
                            <h2>1. Definitions</h2>
                        </div>
                        {expandedSections["definitions"] ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
                    </div>
                    {expandedSections["definitions"] && (
                        <div className={styles.termSectionContent}>
                            <p>For the purposes of these Terms of Service:</p>
                            <ul className={styles.termDefinitionsList}>
                                <li>
                                    <strong>Service</strong> refers to the Ambrosia Restaurant Management System.
                                </li>
                                <li>
                                    <strong>User</strong> refers to the individual accessing or using the Service, or the company, or
                                    other legal entity on behalf of which such individual is accessing or using the Service, as
                                    applicable.
                                </li>
                                <li>
                                    <strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement)
                                    refers to Ambrosia Solutions Inc.
                                </li>
                                <li>
                                    <strong>Account</strong> means a unique account created for You to access our Service or parts of our
                                    Service.
                                </li>
                                <li>
                                    <strong>Website</strong> refers to the Ambrosia Restaurant Management System, accessible from
                                    www.ambrosia-rms.com
                                </li>
                                <li>
                                    <strong>Content</strong> refers to content such as text, images, or other information that can be
                                    posted, uploaded, linked to or otherwise made available by You, regardless of the form of that
                                    content.
                                </li>
                                <li>
                                    <strong>Device</strong> means any device that can access the Service such as a computer, a cellphone
                                    or a digital tablet.
                                </li>
                            </ul>
                        </div>
                    )}
                </div>

                <div className={styles.termSection}>
                    <div className={styles.termSectionHeader} onClick={() => toggleSection("general")}>
                        <div className={styles.termSectionTitle}>
                            <FaFileContract className={styles.termSectionIcon} />
                            <h2>2. General Terms</h2>
                        </div>
                        {expandedSections["general"] ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
                    </div>
                    {expandedSections["general"] && (
                        <div className={styles.termSectionContent}>
                            <p>
                                Welcome to our Ambrosia Restaurant Management System. By accessing or using this service, you agree to comply
                                with and be bound by the terms and conditions set forth below.
                            </p>
                            <p>
                                We may change these terms at any time, and your continued use of the service after changes are posted
                                constitutes your acceptance of the modified terms.
                            </p>
                        </div>
                    )}
                </div>



                <div className={styles.termSection}>
                    <div className={styles.termSectionHeader} onClick={() => toggleSection("account")}>
                        <div className={styles.termSectionTitle}>
                            <FaUserShield className={styles.termSectionIcon} />
                            <h2>3. User Accounts</h2>
                        </div>
                        {expandedSections["account"] ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
                    </div>
                    {expandedSections["account"] && (
                        <div className={styles.termSectionContent}>
                            <p>
                                To use certain features of the service, you must create an account. You are responsible for maintaining
                                the security of your account and password.
                            </p>
                            <p>
                                You agree to provide accurate, complete, and updated information as required by the registration
                                process. Failure to do so may result in termination of your account on our service.
                            </p>
                        </div>
                    )}
                </div>

                <div className={styles.termSection}>
                    <div className={styles.termSectionHeader} onClick={() => toggleSection("usage")}>
                        <div className={styles.termSectionTitle}>
                            <FaTools className={styles.termSectionIcon} />
                            <h2>4. Service Usage</h2>
                        </div>
                        {expandedSections["usage"] ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
                    </div>
                    {expandedSections["usage"] && (
                        <div className={styles.termSectionContent}>
                            <p>
                                You agree to use the service only for lawful purposes and in a way that does not infringe the rights of
                                any third party.
                            </p>
                            <p>You must not use the service to:</p>
                            <ul>
                                <li>Violate any applicable laws or regulations</li>
                                <li>Send unsolicited advertising or promotional material</li>
                                <li>Impersonate any person or entity</li>
                                <li>Interfere with the normal operation of the service</li>
                            </ul>
                        </div>
                    )}
                </div>

                <div className={styles.termSection}>
                    <div className={styles.termSectionHeader} onClick={() => toggleSection("content")}>
                        <div className={styles.termSectionTitle}>
                            <FaFileAlt className={styles.termSectionIcon} />
                            <h2>5. User Content</h2>
                        </div>
                        {expandedSections["content"] ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
                    </div>
                    {expandedSections["content"] && (
                        <div className={styles.termSectionContent}>
                            <p>
                                Our service allows you to post, store, and share information, text, graphics, videos, or other materials
                                ("Content").
                            </p>
                            <p>
                                You retain all rights to the Content you post on our service. However, by posting Content, you grant us
                                a worldwide, non-exclusive, royalty-free license to use, copy, process, adapt, publish, transmit,
                                display, and distribute that Content on and through our service.
                            </p>
                        </div>
                    )}
                </div>

                <div className={styles.termSection}>
                    <div className={styles.termSectionHeader} onClick={() => toggleSection("termination")}>
                        <div className={styles.termSectionTitle}>
                            <FaTimesCircle className={styles.termSectionIcon} />
                            <h2>6. Termination</h2>
                        </div>
                        {expandedSections["termination"] ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
                    </div>
                    {expandedSections["termination"] && (
                        <div className={styles.termSectionContent}>
                            <p>
                                We may terminate or suspend your access to the service immediately, without prior notice, for any reason
                                whatsoever, including without limitation if you breach the Terms.
                            </p>
                            <p>
                                All provisions of the Agreement which by their nature should survive termination shall survive
                                termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and
                                limitations of liability.
                            </p>
                        </div>
                    )}
                </div>

                <div className={styles.termSection}>
                    <div className={styles.termSectionHeader} onClick={() => toggleSection("liability")}>
                        <div className={styles.termSectionTitle}>
                            <FaExclamationTriangle className={styles.termSectionIcon} />
                            <h2>7. Limitation of Liability</h2>
                        </div>
                        {expandedSections["liability"] ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
                    </div>
                    {expandedSections["liability"] && (
                        <div className={styles.termSectionContent}>
                            <p>
                                In no event shall we be liable to you or any third party for any indirect, consequential, incidental,
                                special, or punitive damages, including lost profit, whether arising from contract, tort (including
                                negligence), product liability or otherwise.
                            </p>
                            <p>
                                We do not guarantee that the service will be uninterrupted, timely, secure, or error-free or free from
                                viruses or other malicious code.
                            </p>
                        </div>
                    )}
                </div>

                <div className={styles.termSection}>
                    <div className={styles.termSectionHeader} onClick={() => toggleSection("governing")}>
                        <div className={styles.termSectionTitle}>
                            <FaGlobe className={styles.termSectionIcon} />
                            <h2>8. Governing Law</h2>
                        </div>
                        {expandedSections["governing"] ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
                    </div>
                    {expandedSections["governing"] && (
                        <div className={styles.termSectionContent}>
                            <p>
                                These Terms shall be governed and construed in accordance with the laws of the State of California,
                                United States, without regard to its conflict of law provisions.
                            </p>
                            <p>
                                Our failure to enforce any right or provision of these Terms will not be considered a waiver of those
                                rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining
                                provisions of these Terms will remain in effect.
                            </p>
                            <p>
                                These Terms constitute the entire agreement between us regarding our Service, and supersede and replace
                                any prior agreements we might have between us regarding the Service.
                            </p>
                            <div className={styles.termDisputeResolution}>
                                <h3>Dispute Resolution</h3>
                                <p>
                                    Any disputes arising out of or related to these Terms or the Service shall be resolved through binding
                                    arbitration in accordance with the rules of the American Arbitration Association. The arbitration
                                    shall be conducted in San Francisco, California.
                                </p>
                                <p>
                                    You agree that any dispute resolution proceedings will be conducted only on an individual basis and
                                    not in a class, consolidated, or representative action. If for any reason a claim proceeds in court
                                    rather than in arbitration, you waive any right to a jury trial.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.ctaSection}>
                    <h3 className={styles.ctaTitle}>Questions? We've got answers.</h3>

                    <p className={styles.ctaDescription}>Our team is ready to assist you with anything you need.</p>

                    <Link to='/contact' className={styles.ctaButton}>Contact</Link>
                </div>
            </div>
        </div>
    )
}

