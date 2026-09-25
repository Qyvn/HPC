import { Link } from "react-router-dom";
import {
  formatPrice,
  getCategory,
  getProductColor,
  getProductImage,
} from "../data/products";
import { useCart } from "../context/CartContext";

export function CartDrawer() {
  const {
    isOpen,
    closeCart,
    enriched,
    subtotal,
    hasPricedItems,
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
            enriched.map((line) => {
              const color = getProductColor(line.product, line.colorId);
              const image = getProductImage(line.product, line.colorId);
              const metaBits = [
                color?.name,
                line.size,
                line.product.version,
              ].filter(Boolean);

              return (
                <div className="cart-line" key={line.key}>
                  <Link
                    to={`/product/${line.product.id}`}
                    className="cart-line__thumb"
                    onClick={closeCart}
                  >
                    {image ? (
                      <img src={image} alt={line.product.name} />
                    ) : (
                      <div
                        className="product-card__placeholder"
                        style={{
                          minHeight: "100%",
                          background:
                            color?.hex ??
                            getCategory(line.product.category)?.tone,
                        }}
                        aria-hidden
                      />
                    )}
                  </Link>
                  <div className="cart-line__meta">
                    <p className="cart-line__name">{line.product.name}</p>
                    {metaBits.length ? (
                      <p className="cart-line__price">{metaBits.join(" · ")}</p>
                    ) : null}
                    <p className="cart-line__price">
                      {typeof line.product.price === "number"
                        ? formatPrice(line.product.price)
                        : "Price soon"}
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
              );
            })
          )}
        </div>

        <div className="cart-drawer__foot">
          <div className="cart-total">
            <span>Subtotal</span>
            <strong>
              {hasPricedItems ? formatPrice(subtotal) : "—"}
            </strong>
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
