import { Link } from "react-router-dom";
import { CATEGORIES } from "../data/products";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container-wide site-footer__grid">
        <div className="site-footer__brand">
          <Link to="/">
            <img src="/brand/vero-logo.png" alt="VÉRO" />
          </Link>
          <p>
            Editorial essentials — weaves, couch bags, colognes, and plain tees.
            Your signature.
          </p>
        </div>

        <div>
          <h3>Shop</h3>
          <ul>
            <li>
              <Link to="/shop">All</Link>
            </li>
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link to={`/shop/${c.id}`}>{c.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Help</h3>
          <ul>
            <li>
              <a href="mailto:hello@vero.store">Contact</a>
            </li>
            <li>
              <Link to="/shop">Shipping</Link>
            </li>
            <li>
              <Link to="/shop">Returns</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3>Follow</h3>
          <ul>
            <li>
              <a href="https://instagram.com" target="_blank" rel="noreferrer">
                Instagram
              </a>
            </li>
            <li>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer">
                TikTok
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-wide site-footer__bottom">
        <span>© {new Date().getFullYear()} VÉRO</span>
        <span>Your signature.</span>
      </div>
    </footer>
  );
}
