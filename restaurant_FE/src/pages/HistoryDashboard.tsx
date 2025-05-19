import { useState } from "react";
import BookingHistory from "./BookingHistory";
import OrderHistory from './OrderHistory';
import Header from "../components/Header";
import CartSidebar from "../components/CartSideBar";
import PageName from "../components/PageName";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

export default function HistoryDashboard() {
  const [activeTab, setActiveTab] = useState("booking")
  const [isCartOpen, setIsCartOpen] = useState(false)

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen)
  }

  return (
    <>
      <Header fixed={false} onCartToggle={toggleCart} />

      <PageName name={"History"} />

      <div className="bg-[#EFF4F8] py-12">
        <div className="w-full max-w-[1200px] mx-auto bg-[#EFF4F8] rounded-lg">
          <ul className="flex justify-center border-b-2 border-gray-300 list-none">
            <li className="mx-2.5">
              <button
                className={`bg-transparent border-none py-2.5 px-5 text-base cursor-pointer transition-all duration-300 ease-in-out border-b-3 ${
                  activeTab === "booking"
                    ? "text-[#8c6342] font-bold border-b-3 border-[#8c6342]"
                    : "text-gray-600 hover:text-gray-800 border-transparent"
                }`}
                onClick={() => setActiveTab("booking")}
              >
                Booking History
              </button>
            </li>
            <li className="mx-2.5">
              <button
                className={`bg-transparent border-none py-2.5 px-5 text-base cursor-pointer transition-all duration-300 ease-in-out border-b-3 ${
                  activeTab === "order"
                    ? "text-[#8c6342] font-bold border-b-3 border-[#8c6342]"
                    : "text-gray-600 hover:text-gray-800 border-transparent"
                }`}
                onClick={() => setActiveTab("order")}
              >
                Order History
              </button>
            </li>
          </ul>

          <div className="tab-content">
            {activeTab === "booking" && <BookingHistory />}
            {activeTab === "order" && <OrderHistory />}
          </div>
        </div>
      </div>

      <Contact />

      <Footer />

      <CartSidebar isOpen={isCartOpen} onClose={toggleCart} />
      {isCartOpen && <div className="fixed inset-0 bg-black/50 z-[998]" onClick={toggleCart}></div>}
    </>
  )
}
