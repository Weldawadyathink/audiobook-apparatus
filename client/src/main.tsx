import React from "react";
import ReactDOM from "react-dom/client";
import Layout from "./Layout.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <h1 className="text-3xl font-bold underline text-red-700">Hello world!</h1>
    <Layout />
  </React.StrictMode>,
);
