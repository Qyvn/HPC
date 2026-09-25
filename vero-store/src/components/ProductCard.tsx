import { Link } from "react-router-dom";
import {
  formatPrice,
  getCategory,
  getProductImage,
  type Product,
} from "../data/products";

export function ProductCard({ product }: { product: Product }) {
  const category = getCategory(product.category);
  const image = getProductImage(product);
  const colorCount = product.colors?.length ?? 0;

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-card__media">
        {image ? (
          <img src={image} alt={product.name} />
        ) : (
          <div
            className="product-card__placeholder"
            style={{ background: category?.tone }}
          >
            <span>{product.name}</span>
          </div>
        )}
      </Link>
      <div className="product-card__meta">
        <p className="product-card__category">
          {category?.label}
          {product.version ? ` · ${product.version}` : ""}
        </p>
        <Link to={`/product/${product.id}`} className="product-card__name">
          {product.name}
        </Link>
        {colorCount > 0 ? (
          <div className="color-dots" aria-label={`${colorCount} colours`}>
            {product.colors!.slice(0, 5).map((c) => (
              <span
                key={c.id}
                className="color-dot"
                style={{ background: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        ) : null}
        {typeof product.price === "number" ? (
          <p className="product-card__price">{formatPrice(product.price)}</p>
        ) : (
          <p className="product-card__price product-card__price--soon">
            Price soon
          </p>
        )}
      </div>
    </article>
  );
}
