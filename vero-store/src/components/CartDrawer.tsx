import { Link } from "react-router-dom";
import { formatPrice } from "../data/products";
import { useCart } from "../context/CartContext";

export function CartDrawer() {
  const {
    isOpen,
    closeCart,
    enriched,
    subtotal,
    setQty,
    removeItem,
    itemCount,
  } = useCart();

  return (
    <>
      <div
        className={`cart-overlay${isOpen ? " is-open" : ""}`}
        onClick={closeCart}
        aria-hidden={!isOpen}
      />
      <aside
        className={`cart-drawer${isOpen ? " is-open" : ""}`}
        aria-hidden={!isOpen}
        aria-label="Shopping bag"
      >
        <div className="cart-drawer__head">
          <h2 className="cart-drawer__title">Bag ({itemCount})</h2>
          <button type="button" className="site-header__link" onClick={closeCart}>
            Close
          </button>
        </div>

        <div className="cart-drawer__body">
          {enriched.length === 0 ? (
            <p className="cart-empty">Your bag is empty.</p>
          ) : (
            enriched.map((line) => (
              <div className="cart-line" key={line.key}>
                <Link
                  to={`/product/${line.product.id}`}
                  className="cart-line__thumb"
                  onClick={closeCart}
                >
                  {line.product.image ? (
                    <img src={line.product.image} alt={line.product.name} />
                  ) : (
                    <div
                      className="product-card__placeholder"
                      style={{ minHeight: "100%" }}
                    />
                  )}
                </Link>
                <div className="cart-line__meta">
                  <p className="cart-line__name">{line.product.name}</p>
                  {line.size ? (
                    <p className="cart-line__price">{line.size}</p>
                  ) : null}
                  <p className="cart-line__price">
                    {formatPrice(line.product.price)}
                  </p>
                  <div className="cart-line__actions">
                    <div className="qty-row">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQty(line.key, line.qty - 1)}
                      >
                        −
                      </button>
                      <span>{line.qty}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQty(line.key, line.qty + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="cart-line__remove"
                      onClick={() => removeItem(line.key)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-drawer__foot">
          <div className="cart-total">
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <button type="button" className="btn btn-ink btn-block" disabled>
            Checkout soon
          </button>
          <Link to="/shop" className="btn btn-outline btn-block" onClick={closeCart}>
            Continue shopping
          </Link>
        </div>
      </aside>
    </>
  );
}
