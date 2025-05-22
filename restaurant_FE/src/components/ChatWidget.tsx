import type React from "react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaComments, FaTimes, FaRobot, FaPaperPlane } from "react-icons/fa";

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    { user: string; bot: string; buttons?: { dishId: string; title: string; price: string; image: string }[] }[]
  >([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const history = localStorage.getItem("chatHistory");
    if (history) setMessages(JSON.parse(history));
  }, []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ user: "", bot: "👋 Hello! How can I assist you today?" }]);
    }
  }, [isOpen, messages.length]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages((prev) => [...prev, { user: userMsg, bot: "..." }]);
    setInput("");

    try {
      const { data } = await axios.post("http://localhost:3000/api/chat/message", {
        message: userMsg,
      });

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          user: userMsg,
          bot: data.reply,
          buttons: data.buttons || [],
        };
        return updated;
      });
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].bot = "Error";
        return updated;
      });
    }
  };

  const handleDishClick = (dishId: string) => {
    navigate(`/dish/${dishId}`);
  };

  return (
    <>
      <div
        className="fixed bottom-5 right-5 bg-[#007bff] text-white w-[55px] h-[55px] rounded-full flex items-center justify-center cursor-pointer shadow-[0_5px_15px_rgba(0,0,0,0.2)] transition-all duration-200 ease-in-out hover:bg-[#0056b3] hover:scale-110"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <FaTimes size={22} /> : <FaComments size={24} />}
      </div>

      {isOpen && (
        <div className="fixed bottom-20 right-[35px] w-[360px] max-h-[450px] bg-white rounded-[15px] shadow-[0_8px_16px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden animate-[slideUp_0.3s_ease-in-out] mb-[5px]">
          <div className="flex items-center bg-[#007bff] text-white py-3 px-[15px] text-base font-bold relative rounded-t-[15px]">
            <FaRobot size={20} className="mr-20" /> <span>Restaurant Support</span>
          </div>

          <div className="flex-grow p-[10px] overflow-y-auto max-h-[300px] scrollbar-thin">
            {messages.map((msg, idx) => (
              <div key={idx} className="mb-3">
                {msg.user && (
                  <div className="flex items-end gap-2 justify-end">
                    <div className="max-w-[75%] py-[10px] px-[14px] rounded-[20px] text-sm leading-[1.4] break-words bg-[#007bff] text-white rounded-br-[5px]">
                      {msg.user}
                    </div>
                  </div>
                )}

                <div className="flex items-end gap-2 justify-start">
                  <FaRobot className="text-[#007bff]" />
                  <div className="max-w-[75%] py-[10px] px-[14px] rounded-[20px] text-sm leading-[1.4] break-words bg-[#f1f1f1] text-[#333] rounded-bl-[5px]">
                    <p>{msg.bot}</p>

                    {msg.buttons && msg.buttons.length > 0 && (
                      <div className="mt-2">
                        {msg.buttons.map((btn, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-100 p-2 rounded-md"
                            onClick={() => handleDishClick(btn.dishId)}
                          >
                            <img
                              src={btn.image}
                              alt={btn.title}
                              className="w-[80px] h-[80px] object-cover rounded-md"
                              onError={(e) => {
                                e.currentTarget.src = "https://via.placeholder.com/150";
                              }}
                            />
                            <div>
                              <strong>{btn.title}</strong>
                              <p>{btn.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex p-2 border-t border-[#ddd] bg-[#f9f9f9]">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Enter your message..."
              className="flex-1 py-[10px] px-[10px] rounded-[20px] border border-[#ccc] text-sm outline-none"
            />
            <button
              onClick={sendMessage}
              className="ml-2 py-[10px] px-[14px] border-none rounded-[20px] bg-[#007bff] text-white cursor-pointer flex items-center transition-colors duration-300 hover:bg-[#0056b3]"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;