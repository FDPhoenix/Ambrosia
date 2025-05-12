import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage"
import './App.css'
import MenuPage from "./pages/MenuPage"
import SearchPage from "./pages/SearchPage"
import Login from "./pages/Login"
import Register from "./pages/Register"
import { useEffect, useState } from "react"
import SelectDateTime from "./pages/SelectDateTime"
import SelectDishes from "./pages/SelectDishes"
import AddNote from "./pages/AddNote "
import ReviewBooking from "./pages/ReviewBooking"
import ReviewExperience from "./pages/ReviewExperience"
import BookingForm from "./pages/BookingForm"
import DishFeedback from "./pages/DishFeedback";
import HistoryDashboard from "./pages/HistoryDashboard";
import UserProfile from "./components/UserProfile";
import ChangePassword from "./components/ChangePassword";
import ViewRanks from "./components/ViewRanks";
import AdminPage from "./pages/AdminPage";
import Cookies from "js-cookie";
import DishDetailPage from "./pages/DishDetailPage";
import Checkout from "./pages/CheckoutPage";
import PaymentResult from "./pages/PaymentResult";
import ForgotPassword from "./pages/ForgotPassword";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import ChefPage from "./pages/ChefPage";
import StaffPage from "./pages/StaffPage";
import TermsOfService from "./components/TermsOfService";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import NewsPage from "./pages/NewsPage";
import TestTailwind from "./pages/TestTailwind";
import './index.css';


function App() {
  const [bookingId, setBookingId] = useState(() => Cookies.get("bookingId") || null);
  const [orderType, setOrderType] = useState("pre-order");

  useEffect(() => {
    if (bookingId) {
      Cookies.set("bookingId", bookingId);
      console.log("📌 Cập nhật bookingId vào Cookies:", bookingId);
    }
  }, [bookingId]);

  return (
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path="/booking" element={<BookingForm openSelectDateTimeModal={() => { }} closeModal={() => { }} />} />
      <Route path='/menu' element={<MenuPage />} />
      <Route path='/search' element={<SearchPage />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path="/select-date-time" element={<SelectDateTime onBookingSuccess={setBookingId} />} />
      <Route path="/select-dishes" element={<SelectDishes bookingId={bookingId || Cookies.get("bookingId")} orderType={orderType} onOrderTypeChange={setOrderType} />} />
      <Route path="/add-note" element={<AddNote bookingId={bookingId || Cookies.get("bookingId")} />} />
      <Route path="/review-booking/:bookingId" element={<ReviewBooking closeModal={() => { }} openReviewExperienceModal={() => { }} bookingId={""} />} />
      <Route path="/review-experience/:bookingId" element={<ReviewExperience closeModal={() => { }} bookingId={""} />} />
      <Route path="/feedback/:dishId" element={<DishFeedback />} />
      <Route path="/history" element={<HistoryDashboard />} />
      {/* <Route path="/profile" element={<UserProfile />} /> */}
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/ranks" element={<ViewRanks />} />
      <Route path="/manage/*" element={<AdminPage />} />
      <Route path="/dish/:id" element={<DishDetailPage />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/payment-result" element={<PaymentResult />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/chef/*" element={<ChefPage />} />
      <Route path="/staff/*" element={<StaffPage />} />
      <Route path="/terms" element={<TermsOfServicePage />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/taiwind" element={<TestTailwind />} />
    </Routes>
  )
}

export default App
