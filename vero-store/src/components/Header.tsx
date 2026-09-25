import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { CATEGORIES } from "../data/products";
import { useCart } from "../context/CartContext";

export function Header() {
  const { itemCount, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  return (
    <>
      <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
        <div className="site-header__inner">
          <nav className="site-header__nav site-header__nav--left" aria-label="Primary">
            <NavLink
              to="/shop"
              className={({ isActive }) =>
                `site-header__link${isActive ? " is-active" : ""}`
              }
            >
              Shop
            </NavLink>
            {CATEGORIES.slice(0, 2).map((c) => (
              <NavLink
                key={c.id}
                to={`/shop/${c.id}`}
                className={({ isActive }) =>
                  `site-header__link${isActive ? " is-active" : ""}`
                }
              >
                {c.label}
              </NavLink>
            ))}
          </nav>

          <Link to="/" className="brand-mark" aria-label="VÉRO home">
            <img src="/brand/vero-logo.jpg" alt="VÉRO" />
          </Link>

          <div className="site-header__nav site-header__nav--right">
            {CATEGORIES.slice(2).map((c) => (
              <NavLink
                key={c.id}
                to={`/shop/${c.id}`}
                className={({ isActive }) =>
                  `site-header__link${isActive ? " is-active" : ""}`
                }
              >
                {c.label}
              </NavLink>
            ))}
            <button type="button" className="cart-trigger" onClick={openCart}>
              Bag
              {itemCount > 0 ? (
                <span className="cart-trigger__count">{itemCount}</span>
              ) : null}
            </button>
            <button
              type="button"
              className="menu-toggle"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span />
            </button>
          </div>
        </div>
      </header>

      <nav
        className={`mobile-nav${menuOpen ? " is-open" : ""}`}
        aria-label="Mobile"
      >
        <NavLink to="/shop" onClick={() => setMenuOpen(false)}>
          Shop All
        </NavLink>
        {CATEGORIES.map((c) => (
          <NavLink
            key={c.id}
            to={`/shop/${c.id}`}
            onClick={() => setMenuOpen(false)}
          >
            {c.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
