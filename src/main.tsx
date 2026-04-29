import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AiAssistantProvider } from "./context/AiAssistantContext";
import { AppProvider } from "./context/AppContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <AiAssistantProvider>
          <App />
        </AiAssistantProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
