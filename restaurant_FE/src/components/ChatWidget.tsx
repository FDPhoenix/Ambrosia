import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaComments, FaTimes, FaRobot, FaPaperPlane } from "react-icons/fa";
import styles from "../css/ChatWidget.module.css";

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<
        { user: string; bot: string; buttons?: { title: string; text: string; link: string }[] }[]
    >([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

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
            setMessages([
                { user: "", bot: "👋 Xin chào! Tôi có thể giúp gì cho bạn hôm nay?" },
            ]);
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
                updated[updated.length - 1].bot = "❌ Xin lỗi, có lỗi xảy ra.";
                return updated;
            });
        }
    };

    return (
        <>
            {/* Icon chat nổi */}
            <div
                className={styles.chatIcon}
                onClick={() => setIsOpen(!isOpen)}
                title={isOpen ? "Đóng chat" : "Mở chat"}
            >
                {isOpen ? <FaTimes size={22} /> : <FaComments size={24} />}
            </div>

            {/* Khung chat */}
            {isOpen && (
                <div className={styles.chatContainer}>
                    <div className={styles.chatHeader}>
                        <FaRobot size={20} style={{ marginRight: "80px" }} />{" "}
                        <span>Restaurant support</span>
                    </div>

                    <div className={styles.chatMessages}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={styles.messageGroup}>
                                {msg.user && (
                                    <div className={`${styles.message} ${styles.user}`}>
                                        <div className={`${styles.bubble} ${styles.userBubble}`}>
                                            {msg.user}
                                        </div>
                                    </div>
                                )}

                                <div className={`${styles.message} ${styles.bot}`}>
                                    <FaRobot className={styles.icon} />
                                    <div className={`${styles.bubble} ${styles.botBubble}`}>
                                        <strong>{msg.buttons?.length ? msg.buttons[0].title : ""}</strong>
                                        <p>{msg.bot}</p>

                                        {/* Hiển thị danh sách button nếu có */}
                                        {msg.buttons && msg.buttons.length > 0 && (
                                            <div className={styles.buttonContainer}>
                                                {msg.buttons.map((btn, i) => (
                                                    <a
                                                        key={i}
                                                        href={btn.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={styles.chatButton}
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

                    <div className={styles.chatInput}>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            placeholder="Nhập tin nhắn..."
                        />
                        <button onClick={sendMessage}>
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;