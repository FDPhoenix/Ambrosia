import { useEffect, useState } from "react";
import About from "../components/About";
import Banner from "../components/Banner";
import FAQ from "../components/FAQ";
import Header from "../components/Header";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import BookingForm from "./BookingForm";
import SelectDateTime from "./SelectDateTime";
import SelectDishes from "./SelectDishes";
import SelectTable from "./SelectTable";
import AddNote from "./AddNote ";
import ReviewBooking from "./ReviewBooking";
import ReviewExperience from "./ReviewExperience";
import styles from "../css/PageCss/HomePage.module.css";
import CartSidebar from "../components/CartSideBar";
import ChatWidget from "../components/ChatWidget";
import { ToastContainer } from "react-toastify";
import { useLocation } from "react-router";

function HomePage() {
  const [isBookingFormModalOpen, setIsBookingFormModalOpen] = useState(false);
  const [isSelectDateTimeModalOpen, setIsSelectDateTimeModalOpen] = useState(false);
  const [isSelectTableModalOpen, setIsSelectTableModalOpen] = useState(false);
  const [isSelectDishesModalOpen, setIsSelectDishesModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isReviewBookingModalOpen, setIsReviewBookingModalOpen] = useState(false);
  const [isReviewExperienceModalOpen, setIsReviewExperienceModalOpen] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false)
  const location = useLocation();

  useEffect(() => {
    if (location.state?.showReviewExperience && location.state?.bookingId) {
      setCurrentBookingId(location.state.bookingId);
      setIsReviewExperienceModalOpen(true);
    }
  }, [location.state]);

  const openReviewBookingModal = (bookingId: string) => {
    if (!bookingId) {
      console.error("Booking ID is missing!");
      return;
    }
    console.log("Opening ReviewBooking Modal with ID:", bookingId);
    setCurrentBookingId(bookingId);
    setIsReviewBookingModalOpen(true);
    setIsSelectDishesModalOpen(false);
    setIsAddNoteModalOpen(false);
  };


  const openBookingModal = () => {
    setIsBookingFormModalOpen(true);
    setIsSelectDateTimeModalOpen(false);
    setIsSelectTableModalOpen(false);
    setIsSelectDishesModalOpen(false);
    setIsAddNoteModalOpen(false);
    setIsReviewBookingModalOpen(false);
  };

  const openSelectDateTimeModal = () => {
    console.log("🔄 Closing SelectTable and opening SelectDateTime");
    setIsSelectTableModalOpen(false);
    setIsSelectDateTimeModalOpen(true);
    setIsSelectDishesModalOpen(false);
    setIsAddNoteModalOpen(false);
    setIsReviewBookingModalOpen(false);
    setIsBookingFormModalOpen(false);
  };


  const openSelectTableModal = () => {
    setIsSelectDateTimeModalOpen(false);
    setIsSelectTableModalOpen(true);
    setIsSelectDishesModalOpen(false);
    setIsAddNoteModalOpen(false);
    setIsReviewBookingModalOpen(false);
  };

  const openSelectDishesModal = () => {
    setIsSelectDateTimeModalOpen(false);
    setIsSelectTableModalOpen(false);
    setIsSelectDishesModalOpen(true);
    setIsAddNoteModalOpen(false);
    setIsReviewBookingModalOpen(false);
  };

  const openAddNoteModal = () => {
    setIsSelectDateTimeModalOpen(false);
    setIsSelectTableModalOpen(false);
    setIsSelectDishesModalOpen(false);
    setIsAddNoteModalOpen(true);
    setIsReviewBookingModalOpen(false);
  };

  const openReviewExperienceModal = (bookingId: string) => {
    console.log("Opening ReviewExperience Modal with ID:", bookingId);
    setCurrentBookingId(bookingId);
    setIsReviewExperienceModalOpen(true);
    setIsReviewBookingModalOpen(false);
  };

  const closeReviewExperienceModal = () => {
    console.log("Closing ReviewExperience Modal");
    setIsReviewExperienceModalOpen(false);
    setCurrentBookingId(null);
  };

  useEffect(() => {
    console.log("currentBookingId changed:", currentBookingId);
  }, [currentBookingId]);


  const closeModal = () => {
    setIsBookingFormModalOpen(false);
    setIsSelectDateTimeModalOpen(false);
    setIsSelectTableModalOpen(false);
    setIsSelectDishesModalOpen(false);
    setIsAddNoteModalOpen(false);
    setIsReviewBookingModalOpen(false);
    setCurrentBookingId(null);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <div>
      <Header fixed={true} onCartToggle={toggleCart} />
      <Banner />
      <About openBookingModal={openBookingModal} openSelectDateTimeModal={openSelectDateTimeModal} />
      <FAQ />
      <Contact />

      {isBookingFormModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <BookingForm openSelectDateTimeModal={openSelectDateTimeModal} closeModal={closeModal} />
            <button onClick={closeModal}>Cancel</button>
          </div>
        </div>
      )}

      {isSelectDateTimeModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <SelectDateTime
              onBookingSuccess={() => { }}
              openBookingModal={openBookingModal}
              openSelectDishesModal={openSelectDishesModal}
              closeModal={closeModal}
            />
          </div>
        </div>
      )}


      {isSelectTableModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <SelectTable
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onBookingSuccess={onBookingSuccess}
              onTableSelected={openSelectDishesModal}
              onBack={() => {
                console.log("🔄 Back to SelectDateTime");
                openSelectDateTimeModal();
              }}
            />
            <button onClick={closeModal}>Cancel</button>
          </div>
        </div>
      )}

      {isSelectDishesModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <SelectDishes onOrderTypeChange={() => { }} openAddNoteModal={openAddNoteModal} />
            <button onClick={closeModal}>Cancel</button>
          </div>
        </div>
      )}

      {isAddNoteModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <AddNote bookingId={currentBookingId!} openReviewBookingModal={openReviewBookingModal} />
            <button onClick={closeModal}>Cancel</button>
          </div>
        </div>
      )}

      {isReviewBookingModalOpen && currentBookingId ? (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <ReviewBooking
              bookingId={currentBookingId}
              closeModal={closeModal}
              openReviewExperienceModal={openReviewExperienceModal}
            />
            <button onClick={closeModal}>Cancel</button>
          </div>
        </div>
      ) : null}


      {isReviewExperienceModalOpen && currentBookingId ? (
        <div className={styles.modalOverlay} onClick={closeReviewExperienceModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <ReviewExperience
              bookingId={currentBookingId}
              closeModal={closeReviewExperienceModal}
            />
            <button onClick={closeReviewExperienceModal}>Close</button>
          </div>
        </div>
      ) : null}

      <CartSidebar isOpen={isCartOpen} onClose={toggleCart} />
      {isCartOpen && <div className={styles.overlay} onClick={toggleCart}></div>}

      <Footer />

      <ChatWidget />

      <ToastContainer theme="colored" />
    </div>
  );
}

export default HomePage;
