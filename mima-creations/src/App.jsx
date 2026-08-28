import { Routes, Route, Navigate } from "react-router-dom";
import SiteLayout from "./components/SiteLayout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Category from "./pages/Category";
import About from "./pages/About";
import Feedback from "./pages/Feedback";
import Contact from "./pages/Contact";
import Enquiry from "./pages/Enquiry";

export default function App() {
  return (
    <SiteLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/category/:categoryId" element={<Category />} />
        <Route path="/about" element={<About />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/enquiry" element={<Enquiry />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </SiteLayout>
  );
}
