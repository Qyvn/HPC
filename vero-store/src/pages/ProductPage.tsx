import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  formatPrice,
  getCategory,
  getProduct,
  getProductColor,
  getProductImage,
  relatedVersions,
} from "../data/products";
import { useCart } from "../context/CartContext";

export function ProductPage() {
  const { productId } = useParams();
  const product = getProduct(productId ?? "");
  const { addItem } = useCart();
  const category = product ? getCategory(product.category) : undefined;
  const sizes = product?.sizes ?? [];
  const colors = product?.colors ?? [];
  const [size, setSize] = useState(sizes[0] ?? "");
  const [colorId, setColorId] = useState(colors[0]?.id ?? "");
  const [qtyPreview, setQtyPreview] = useState(1);

  useEffect(() => {
    setSize(product?.sizes?.[0] ?? "");
    setColorId(product?.colors?.[0]?.id ?? "");
    setQtyPreview(1);
  }, [product?.id, product?.sizes, product?.colors]);

  const activeColor = product ? getProductColor(product, colorId) : undefined;
  const image = product ? getProductImage(product, colorId) : undefined;

  const otherVersions = useMemo(() => {
    if (!product) return [];
    return relatedVersions(product);
  }, [product]);

  const canAdd = useMemo(() => {
    if (!product) return false;
    if (sizes.length > 0 && !size) return false;
    if (colors.length > 0 && !colorId) return false;
    return true;
  }, [product, size, sizes.length, colorId, colors.length]);

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
          {image ? (
            <img
              src={image}
              alt={`${product.name}${activeColor ? ` — ${activeColor.name}` : ""}`}
            />
          ) : (
            <div
              className="product-card__placeholder"
              style={{
                background: activeColor?.hex ?? category.tone,
                minHeight: "100%",
              }}
            >
              <span>
                {product.name}
                {activeColor ? ` · ${activeColor.name}` : ""}
              </span>
            </div>
          )}
        </div>

        <div className="product-detail__info">
          <p className="section-eyebrow">
            {category.label}
            {product.version ? ` · ${product.version}` : ""}
          </p>
          <h1>{product.name}</h1>
          {typeof product.price === "number" ? (
            <p className="product-detail__price">{formatPrice(product.price)}</p>
          ) : (
            <p className="product-detail__price product-detail__price--soon">
              Price coming soon
            </p>
          )}
          <p className="product-detail__desc">{product.description}</p>

          {colors.length > 0 ? (
            <div>
              <p className="section-eyebrow" style={{ marginBottom: "0.65rem" }}>
                Colour — {activeColor?.name}
              </p>
              <div className="color-row" role="listbox" aria-label="Colours">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    role="option"
                    aria-selected={colorId === c.id}
                    className={`color-swatch${colorId === c.id ? " is-active" : ""}`}
                    style={{ background: c.hex }}
                    title={c.name}
                    onClick={() => setColorId(c.id)}
                  >
                    <span className="sr-only">{c.name}</span>
                  </button>
                ))}
              </div>
              {!activeColor?.image ? (
                <p className="section-copy" style={{ marginTop: "0.65rem" }}>
                  Photo for this colour coming soon.
                </p>
              ) : null}
            </div>
          ) : null}

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

          {otherVersions.length > 0 ? (
            <div>
              <p className="section-eyebrow" style={{ marginBottom: "0.65rem" }}>
                Other versions
              </p>
              <div className="version-row">
                <span className="version-chip is-active">
                  {product.version ?? product.name}
                </span>
                {otherVersions.map((v) => (
                  <Link
                    key={v.id}
                    to={`/product/${v.id}`}
                    className="version-chip"
                  >
                    {v.version ?? v.name}
                  </Link>
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
                addItem(product.id, {
                  size: size || undefined,
                  colorId: colorId || undefined,
                });
              }
            }}
          >
            Add to bag
          </button>
        </div>
      </div>
    </div>
  );
}
