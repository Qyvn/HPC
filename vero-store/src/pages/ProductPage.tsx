import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  formatPrice,
  getCategory,
  getProduct,
} from "../data/products";
import { useCart } from "../context/CartContext";

export function ProductPage() {
  const { productId } = useParams();
  const product = getProduct(productId ?? "");
  const { addItem } = useCart();
  const category = product ? getCategory(product.category) : undefined;
  const sizes = product?.sizes ?? [];
  const [size, setSize] = useState(sizes[0] ?? "");
  const [qtyPreview, setQtyPreview] = useState(1);

  useEffect(() => {
    setSize(product?.sizes?.[0] ?? "");
    setQtyPreview(1);
  }, [product?.id, product?.sizes]);

  const canAdd = useMemo(() => {
    if (!product) return false;
    if (sizes.length > 0 && !size) return false;
    return true;
  }, [product, size, sizes.length]);

  if (!product || !category) {
    return (
      <div className="page container-wide page-hero">
        <h1>Product not found</h1>
        <p className="section-copy" style={{ marginTop: "0.75rem" }}>
          This piece is no longer in the edit.
        </p>
        <Link to="/shop" className="btn btn-ink" style={{ marginTop: "1.5rem" }}>
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container-wide product-detail">
        <div className="product-detail__gallery">
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <div
              className="product-card__placeholder"
              style={{ background: category.tone, minHeight: "100%" }}
            >
              <span>{product.name}</span>
            </div>
          )}
        </div>

        <div className="product-detail__info">
          <p className="section-eyebrow">{category.label}</p>
          <h1>{product.name}</h1>
          <p className="product-detail__price">{formatPrice(product.price)}</p>
          <p className="product-detail__desc">{product.description}</p>

          {sizes.length > 0 ? (
            <div>
              <p className="section-eyebrow" style={{ marginBottom: "0.65rem" }}>
                Select
              </p>
              <div className="size-row">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`size-option${size === s ? " is-active" : ""}`}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="qty-row" aria-label="Quantity">
            <button
              type="button"
              onClick={() => setQtyPreview((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <span>{qtyPreview}</span>
            <button
              type="button"
              onClick={() => setQtyPreview((q) => q + 1)}
            >
              +
            </button>
          </div>

          <button
            type="button"
            className="btn btn-ink"
            disabled={!canAdd}
            onClick={() => {
              for (let i = 0; i < qtyPreview; i += 1) {
                addItem(product.id, size || undefined);
              }
            }}
          >
            Add to bag
          </button>

          <p className="section-copy">
            Photo placeholder — upload your image to{" "}
            <code>public/products/</code> and set the product{" "}
            <code>image</code> field.
          </p>
        </div>
      </div>
    </div>
  );
}
