import { Link } from "react-router-dom";
import { formatPrice, getCategory, type Product } from "../data/products";

export function ProductCard({ product }: { product: Product }) {
  const category = getCategory(product.category);

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-card__media">
        {product.image ? (
          <img src={product.image} alt={product.name} />
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
        <p className="product-card__category">{category?.label}</p>
        <Link to={`/product/${product.id}`} className="product-card__name">
          {product.name}
        </Link>
        <p className="product-card__price">{formatPrice(product.price)}</p>
      </div>
    </article>
  );
}
