import React from "react";
import { Link } from "react-router-dom";
import { BedDouble, ArrowLeft } from "lucide-react";
import Footer from "../components/Footer";

export default function NotFound() {
  return (
    <main className="page-shell">
      <div className="empty-state not-found-state">
        <BedDouble size={48} />
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The sanctuary you are looking for has been moved or does not exist.</p>
        <Link to="/" className="btn btn-dark">
          <ArrowLeft size={16} /> Return to Homepage
        </Link>
      </div>
      <Footer />
    </main>
  );
}
