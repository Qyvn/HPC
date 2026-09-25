import { Link, useParams } from "react-router-dom";
import {
  CATEGORIES,
  type CategoryId,
  productsByCategory,
} from "../data/products";
import { ProductCard } from "../components/ProductCard";

const ALL = "all" as const;

function isCategoryId(value: string | undefined): value is CategoryId {
  return CATEGORIES.some((c) => c.id === value);
}

export function ShopPage() {
  const { categoryId } = useParams();
  const active: CategoryId | typeof ALL = isCategoryId(categoryId)
    ? categoryId
    : ALL;
  const list = productsByCategory(active);
  const activeMeta = CATEGORIES.find((c) => c.id === active);

  return (
    <div className="page">
      <div className="container-wide page-hero">
        <p className="section-eyebrow">Shop</p>
        <h1>{activeMeta?.label ?? "All products"}</h1>
        <p className="section-copy" style={{ marginTop: "0.75rem" }}>
          {activeMeta?.blurb ??
            "The full VÉRO edit — weaves, couch bags, colognes, and plain tees."}
        </p>
      </div>

      <div className="container-wide">
        <div className="filters" role="tablist" aria-label="Categories">
          <Link
            to="/shop"
            className={`filter-chip${active === ALL ? " is-active" : ""}`}
          >
            All
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to={`/shop/${c.id}`}
              className={`filter-chip${active === c.id ? " is-active" : ""}`}
            >
              {c.label}
            </Link>
          ))}
        </div>

        <div className="product-grid" style={{ paddingBottom: "4rem" }}>
          {list.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
