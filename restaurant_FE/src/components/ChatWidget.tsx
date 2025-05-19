import type React from "react"
import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { FaComments, FaTimes, FaRobot, FaPaperPlane } from "react-icons/fa"

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<
    { user: string; bot: string; buttons?: { title: string; text: string; link: string }[] }[]
  >([])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const history = localStorage.getItem("chatHistory")
    if (history) setMessages(JSON.parse(history))
  }, [])

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages))
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ user: "", bot: "👋 Xin chào! Tôi có thể giúp gì cho bạn hôm nay?" }])
    }
  }, [isOpen, messages.length])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMsg = input
    setMessages((prev) => [...prev, { user: userMsg, bot: "..." }])
    setInput("")

    try {
      const { data } = await axios.post("http://localhost:3000/api/chat/message", {
        message: userMsg,
      })

      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          user: userMsg,
          bot: data.reply,
          buttons: data.buttons || [],
        }
        return updated
      })
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1].bot = "Error"
        return updated
      })
    }
  }

  return (
    <>
      <div
        className="fixed bottom-5 right-5 bg-[#007bff] text-white w-[55px] h-[55px] rounded-full flex items-center justify-center cursor-pointer shadow-[0_5px_15px_rgba(0,0,0,0.2)] transition-all duration-200 ease-in-out hover:bg-[#0056b3] hover:scale-110"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Đóng chat" : "Mở chat"}
      >
        {isOpen ? <FaTimes size={22} /> : <FaComments size={24} />}
      </div>

      {isOpen && (
        <div className="fixed bottom-20 right-[35px] w-[360px] max-h-[450px] bg-white rounded-[15px] shadow-[0_8px_16px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden animate-[slideUp_0.3s_ease-in-out] mb-[5px]">
          <div className="flex items-center bg-[#007bff] text-white py-3 px-[15px] text-base font-bold relative rounded-t-[15px]">
            <FaRobot size={20} className="mr-20" /> <span>Restaurant support</span>
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
                    <strong>{msg.buttons?.length ? msg.buttons[0].title : ""}</strong>
                    <p>{msg.bot}</p>

                    {msg.buttons && msg.buttons.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.buttons.map((btn, i) => (
                          <a
                            key={i}
                            href={btn.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-3 py-1.5 bg-[#007bff] text-white text-xs rounded-md hover:bg-[#0056b3] transition-colors"
                            title={btn.title}
                          >
                            {btn.text}
                          </a>
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
              placeholder="Nhập tin nhắn..."
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
  )
}

export default ChatWidget
