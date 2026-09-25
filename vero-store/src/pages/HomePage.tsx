import { Link } from "react-router-dom";
import { CATEGORIES, getProductImage, products } from "../data/products";
import { ProductCard } from "../components/ProductCard";

const CATEGORY_IMAGES: Partial<Record<string, string>> = {
  "couch-bags": "/products/bags/tabby-taupe.jpg",
};

export function HomePage() {
  const arrivals = products.filter((p) => p.newArrival).slice(0, 8);
  const featuredBag = products.find((p) => p.id === "bag-quilted-chain");
  const featuredBagImage = featuredBag
    ? getProductImage(featuredBag)
    : undefined;

  return (
    <div className="page">
      <section className="hero" aria-label="VÉRO campaign">
        <div className="hero__media" aria-hidden="true" />
        <div className="hero__content">
          <img
            className="hero__brand"
            src="/brand/vero-logo.png"
            alt="VÉRO"
          />
          <h1 className="hero__headline">Your signature.</h1>
          <p className="hero__copy">
            Weaves, couch bags, colognes, and plain tees — pieces that mark how
            you show up.
          </p>
          <div className="hero__actions">
            <Link to="/shop" className="btn btn-primary">
              Shop the edit
            </Link>
            <Link to="/shop/couch-bags" className="btn btn-ghost">
              Explore bags
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-wide">
          <div className="section-head">
            <p className="section-eyebrow">Categories</p>
            <h2 className="section-title">Four lines. One house.</h2>
            <p className="section-copy">
              Browse the collection — more product photos welcome anytime.
            </p>
          </div>
          <div className="category-rail">
            {CATEGORIES.map((c) => (
              <Link key={c.id} to={`/shop/${c.id}`} className="category-tile">
                <div
                  className="category-tile__bg"
                  style={
                    CATEGORY_IMAGES[c.id]
                      ? {
                          backgroundImage: `url(${CATEGORY_IMAGES[c.id]})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : { background: c.tone }
                  }
                />
                <span className="category-tile__label">{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-wide">
          <div className="section-head">
            <p className="section-eyebrow">New</p>
            <h2 className="section-title">Just in</h2>
            <p className="section-copy">
              Fresh pieces across weaves, bags, scent, and tees.
            </p>
          </div>
          <div className="product-grid">
            {arrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {featuredBag ? (
        <section className="container-wide" style={{ paddingBottom: "5rem" }}>
          <div className="spotlight">
            <div
              className="spotlight__media"
              style={
                featuredBagImage
                  ? {
                      backgroundImage: `url(${featuredBagImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : {
                      background:
                        "linear-gradient(135deg, #0d0d0d, #2a2420 40%, #b8955a 120%)",
                    }
              }
            />
            <div className="spotlight__body">
              <p className="section-eyebrow">Couch bags</p>
              <h2 className="section-title">{featuredBag.name}</h2>
              <p className="section-copy">{featuredBag.description}</p>
              <div>
                <Link
                  to={`/product/${featuredBag.id}`}
                  className="btn btn-primary"
                >
                  View versions
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="section newsletter">
        <div className="container">
          <div className="section-head">
            <p className="section-eyebrow">Stay close</p>
            <h2 className="section-title">New drops, quietly announced.</h2>
            <p className="section-copy">
              Be first when the next edit lands.
            </p>
          </div>
          <form
            className="newsletter__form"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              form.reset();
            }}
          >
            <label className="sr-only" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email address"
              required
            />
            <button type="submit" className="btn btn-ink">
              Join
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
