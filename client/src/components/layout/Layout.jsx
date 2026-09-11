import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => (
  <div className="app-shell">
    <Navbar />
    <main className="app-main">{children}</main>
    <Footer />
  </div>
);

export default Layout;
