import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />

        <main className="main-content">
          <AppRoutes />
        </main>

        <Footer />
      </div>

      <ToastContainer
        position="top-right"
        autoClose={2500}
        theme="colored"
      />
    </BrowserRouter>
  );
}

export default App;