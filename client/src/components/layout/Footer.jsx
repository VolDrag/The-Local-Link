import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="site-footer">
    <div className="site-footer-inner">
      <div>
        <strong className="footer-brand">The Local Link</strong>
        <p>Local services, held payments, and verified providers across Bangladesh.</p>
      </div>
      <div className="footer-links">
        <Link to="/categories">Browse services</Link>
        <Link to="/events">Events</Link>
        <Link to="/register">Create account</Link>
      </div>
      <p className="footer-copy">Prices in BDT. Payments via bKash sandbox.</p>
    </div>
  </footer>
);

export default Footer;
