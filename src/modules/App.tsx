import React, { Suspense, lazy } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { StaticRouter } from "react-router-dom/server";
import { Request } from "express";

import "../assets/styles/global.css";
import "../assets/styles/global.scss";

// Importar componentes lazy para mejorar el rendimiento de la carga
const Home = lazy(() => import("../pages/Home"));
const About = lazy(() => import("../pages/About"));
const Contact = lazy(() => import("../pages/Contact"));

// Definir las rutas de la aplicación
const AppRoutes = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  </Suspense>
);

// Componente principal de la aplicación
const App = ({ req }: { req?: Request }) => {
  // Verificar si se está ejecutando en el servidor (SSR)
  if (typeof window === "undefined") {
    // Renderizar la aplicación en el servidor utilizando StaticRouter
    return (
      <StaticRouter location={req?.url || "/"}>
        <AppRoutes />
      </StaticRouter>
    );
  }

  // Renderizar la aplicación en el cliente utilizando BrowserRouter
  return (
    <main className="relative h-screen bg-gray-950 flex justify-center items-center flex-col overflow-x-hidden mx-auto sm:px-10 px-5">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </main>
  );
};

export default App;
