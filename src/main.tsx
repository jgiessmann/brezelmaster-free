import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const MIN_LOADING_TIME = 3000;
const ERROR_MESSAGE_TIME = 20000;

const loadingElement = document.getElementById("app-loading");
const errorElement = document.getElementById("app-loading-error");
const rootElement = document.getElementById("root");

const startTime = Date.now();

const errorTimer = window.setTimeout(() => {
  if (errorElement) {
    errorElement.style.display = "block";
  }
}, ERROR_MESSAGE_TIME);

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

function removeLoaderWhenReady() {
  const elapsed = Date.now() - startTime;
  const remaining = Math.max(0, MIN_LOADING_TIME - elapsed);

  window.setTimeout(() => {
    window.requestAnimationFrame(() => {
      if (loadingElement) {
        loadingElement.remove();
      }

      window.clearTimeout(errorTimer);
    });
  }, remaining);
}

removeLoaderWhenReady();