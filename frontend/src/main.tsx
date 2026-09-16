import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { usingMocks } from "./api/client";
import "./index.css";

async function bootstrap() {
  if (usingMocks) {
    const { worker } = await import("./mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  }

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
