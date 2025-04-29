import { useState } from 'react';
import styles from '../css/FAQ.module.css';
import { BsChevronDown } from "react-icons/bs";
import { Link } from 'react-router';

const faqs = [
  {
    question: "What is the system?",
    answer:
      "Our Restaurant Management System is a comprehensive web-based application designed to streamline restaurant operations. It caters to various user roles, including Admin, Customer, Staff, Chef, and Guest. This ensures efficient management of tasks such as bookings, orders, and inventory.",
  },
  {
    question: "How does booking work?",
    answer:
      "Customers can book tables in real-time by selecting their preferred date and time. They have the option to add notes and even pre-order dishes. Cancellations can be made easily if plans change.",
  },
  {
    question: "What payment methods are available?",
    answer:
      "Our system supports multiple payment methods, including cash and credit/debit cards. This flexibility allows customers to choose the option that suits them best. Secure transactions are ensured for a smooth payment experience.",
  },
  {
    question: "Can I provide feedback?",
    answer:
      "Yes, customers can easily provide feedback on their dining experience. This can be done through their account, where they can edit or delete their comments as needed. Your insights help us improve our services.",
  },
]

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.title}>FAQs</h2>

        <div className={styles.content}>
          <p className={styles.description}>
            Explore our frequently asked questions to better understand our restaurant.
          </p>

          <div className={styles.faqList}>
            {faqs.map((faq, index) => (
              <div key={index} className={styles.faqItem}>
                <div className={styles.faqButton} onClick={() => setOpenIndex(openIndex === index ? null : index)}>
                  <span className={styles.faqQuestion}>{faq.question}</span>
                  <BsChevronDown className={`${styles.faqIcon} ${openIndex === index ? styles.open : ""}`} />
                </div>

                {openIndex === index && (
                  <div className={styles.faqAnswer}>
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.ctaSection}>
          <h3 className={styles.ctaTitle}>Still have questions?</h3>

          <p className={styles.ctaDescription}>We're here to help with any inquiries you have.</p>
          
          <Link to='/contact' className={styles.ctaButton}>Contact</Link>
        </div>
      </div>
    </section>
  )
}

export default FAQ
