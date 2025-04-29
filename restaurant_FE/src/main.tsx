import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { store } from "./redux/store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom"; // ✅ Đang có BrowserRouter ở đây

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter> {/* 🚨 Đây là Router 1 */}
        {typeof store !== "undefined" ? (
          <Provider store={store}>
            <App />
          </Provider>
        ) : (
          <App />
        )}
      </BrowserRouter>
    </React.StrictMode>
  );
}
