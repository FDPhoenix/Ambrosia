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
        <div className="max-w-7xl mx-auto bg-white rounded-xl overflow-hidden">
            <div className="px-10 py-10 bg-white rounded-xl max-w-full md:max-w-6xl mx-auto">
                {/* Header */}
                <header className="text-center pb-10 px-8 md:px-0 m-4">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-black tracking-tight leading-tight pb-3">
                        Terms of Service
                    </h2>
                    <p className="mt-3 text-gray-600 font-light text-lg md:text-xl opacity-90">
                        Ambrosia Restaurant Management System
                    </p>
                </header>

                {/* Intro */}
                <section className="bg-[#f5f2ed] border-l-4 border-[#8c7b6b] rounded-md p-8 mb-8 text-[#5d4b3c] leading-relaxed mb-10">
                    <p className="mb-4">
                        Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Ambrosia
                        Restaurant Management System (the "Service") operated by Ambrosia Solutions Inc. ("us", "we", or "our").
                    </p>
                    <p className="mb-4">
                        Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms.
                        These Terms apply to all visitors, users, and others who access or use the Service.
                    </p>
                    <p>
                        By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the
                        terms, then you may not access the Service.
                    </p>
                </section>

                {/* Sections */}
                {[
                    {
                        key: "definitions",
                        icon: FaBalanceScaleLeft,
                        title: "1. Definitions",
                        content: (
                            <>
                                <p>For the purposes of these Terms of Service:</p>
                                <ul className="list-disc list-inside mt-3 text-[#5d4b3c] space-y-3">
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
                            </>
                        ),
                    },
                    {
                        key: "general",
                        icon: FaFileContract,
                        title: "2. General Terms",
                        content: (
                            <>
                                <p>
                                    Welcome to our Ambrosia Restaurant Management System. By accessing or using this service, you agree to comply
                                    with and be bound by the terms and conditions set forth below.
                                </p>
                                <p>
                                    We may change these terms at any time, and your continued use of the service after changes are posted
                                    constitutes your acceptance of the modified terms.
                                </p>
                            </>
                        ),
                    },
                    {
                        key: "account",
                        icon: FaUserShield,
                        title: "3. User Accounts",
                        content: (
                            <>
                                <p>
                                    To use certain features of the service, you must create an account. You are responsible for maintaining
                                    the security of your account and password.
                                </p>
                                <p>
                                    You agree to provide accurate, complete, and updated information as required by the registration
                                    process. Failure to do so may result in termination of your account on our service.
                                </p>
                            </>
                        ),
                    },
                    {
                        key: "usage",
                        icon: FaTools,
                        title: "4. Service Usage",
                        content: (
                            <>
                                <p>
                                    You agree to use the service only for lawful purposes and in a way that does not infringe the rights of
                                    any third party.
                                </p>
                                <p>You must not use the service to:</p>
                                <ul className="list-disc list-inside mt-2">
                                    <li>Violate any applicable laws or regulations</li>
                                    <li>Send unsolicited advertising or promotional material</li>
                                    <li>Impersonate any person or entity</li>
                                    <li>Interfere with the normal operation of the service</li>
                                </ul>
                            </>
                        ),
                    },
                    {
                        key: "content",
                        icon: FaFileAlt,
                        title: "5. User Content",
                        content: (
                            <>
                                <p>
                                    Our service allows you to post, store, and share information, text, graphics, videos, or other materials
                                    ("Content").
                                </p>
                                <p>
                                    You retain all rights to the Content you post on our service. However, by posting Content, you grant us
                                    a worldwide, non-exclusive, royalty-free license to use, copy, process, adapt, publish, transmit,
                                    display, and distribute that Content on and through our service.
                                </p>
                            </>
                        ),
                    },
                    {
                        key: "termination",
                        icon: FaTimesCircle,
                        title: "6. Termination",
                        content: (
                            <>
                                <p>
                                    We may terminate or suspend your access to the service immediately, without prior notice, for any reason
                                    whatsoever, including without limitation if you breach the Terms.
                                </p>
                                <p>
                                    All provisions of the Agreement which by their nature should survive termination shall survive
                                    termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and
                                    limitations of liability.
                                </p>
                            </>
                        ),
                    },
                    {
                        key: "liability",
                        icon: FaExclamationTriangle,
                        title: "7. Liability Restriction",
                        content: (
                            <>
                                <p>
                                    In no event shall we be liable to you or any third party for any indirect, consequential, incidental,
                                    special, or punitive damages, including lost profit, whether arising from contract, tort (including
                                    negligence), product liability or otherwise.
                                </p>
                                <p>
                                    We do not guarantee that the service will be uninterrupted, timely, secure, or error-free or free from
                                    viruses or other malicious code.
                                </p>
                            </>
                        ),
                    },
                    {
                        key: "governing",
                        icon: FaGlobe,
                        title: "8. Governing Law",
                        content: (
                            <>
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
                                <div className="bg-[#f8f5f2] rounded-md p-6 mt-6 text-[#5d4b3c]">
                                    <h3 className="text-lg font-semibold mb-4">Dispute Resolution</h3>
                                    <p className="mb-4">
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
                            </>
                        ),
                    },
                ].map(({ key, icon: Icon, title, content }) => (
                    <section
                        key={key}
                        className="mb-6 rounded-xl border border-[#d6cfc5] bg-white shadow-sm hover:shadow-md transition-transform duration-300 hover:-translate-y-0.5 overflow-hidden"
                    >
                        <header
                            className="flex justify-between items-center px-6 py-5 bg-[#f5f2ed] cursor-pointer hover:bg-[#ece6df] transition-colors"
                            onClick={() => toggleSection(key)}
                        >
                            <div className="flex items-center gap-3 text-[#8c7b6b]">
                                <Icon className="text-xl" />
                                <h2 className="text-[#5d4b3c] font-semibold text-xl m-0">{title}</h2>
                            </div>
                            {expandedSections[key] ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
                        </header>
                        {expandedSections[key] && <div className="px-7 py-7 text-[#5d4b3c] leading-relaxed">{content}</div>}
                    </section>
                ))}

                {/* CTA */}
                <section className="text-center mt-14 mb-5">
                    <h3 className="text-2xl font-bold mb-4">Questions? We've got answers.</h3>
                    <p className="mb-8 text-gray-600">Our team is ready to assist you with anything you need.</p>
                    <Link
                        to="/contact"
                        className="inline-block bg-[#d6cfc5] text-black px-8 py-3 rounded-md border border-[#d6cfc5] hover:bg-[#c5c0b4] transition-colors"
                    >
                        Contact
                    </Link>
                </section>
            </div>
        </div>
    )
}

