import { Link } from "react-router-dom";
import { CATEGORIES, getProductImage, products } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { Reveal } from "../components/Reveal";
import { WaterWordmark } from "../components/WaterWordmark";

const CATEGORY_IMAGES: Partial<Record<string, string>> = {
  "couch-bags": "/products/bags/tabby-taupe.jpg",
  weaves: "/products/bags/quilted-black.jpg",
};

export function HomePage() {
  const arrivals = products.filter((p) => p.newArrival).slice(0, 8);
  const tabby = products.find((p) => p.id === "bag-tabby-shoulder");
  const quilted = products.find((p) => p.id === "bag-quilted-chain");
  const tabbyImage = tabby ? getProductImage(tabby) : undefined;
  const quiltedImage = quilted ? getProductImage(quilted) : undefined;

  return (
    <div className="page">
      <section className="hero hero--campaign" aria-label="VÉRO campaign">
        <div
          className="hero__media"
          style={
            tabbyImage
              ? {
                  backgroundImage: `linear-gradient(180deg, rgba(8,8,8,0.25) 0%, rgba(8,8,8,0.55) 48%, rgba(8,8,8,0.78) 100%), url(${tabbyImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center 30%",
                }
              : undefined
          }
          aria-hidden="true"
        />
        <div className="hero__content">
          <WaterWordmark size="hero" className="hero__brand" />
          <h1 className="hero__headline">Your signature.</h1>
          <p className="hero__copy">
            Editorial essentials — weaves, couch bags, colognes, and plain tees.
          </p>
          <div className="hero__actions">
            <Link to="/shop" className="btn btn-primary">
              Shop the edit
            </Link>
            <Link to="/shop/couch-bags" className="btn btn-ghost">
              Couch bags
            </Link>
          </div>
        </div>
      </section>

      <section className="lookbook" aria-label="Bag versions">
        <Link to="/product/bag-tabby-shoulder" className="lookbook__panel">
          <div
            className="lookbook__media"
            style={
              tabbyImage
                ? {
                    backgroundImage: `url(${tabbyImage})`,
                  }
                : undefined
            }
          />
          <div className="lookbook__caption">
            <p className="section-eyebrow">Classic</p>
            <h2>Tabby Shoulder</h2>
            <span className="lookbook__cta">Shop colourways</span>
          </div>
        </Link>
        <Link to="/product/bag-quilted-chain" className="lookbook__panel">
          <div
            className="lookbook__media"
            style={
              quiltedImage
                ? {
                    backgroundImage: `url(${quiltedImage})`,
                  }
                : undefined
            }
          />
          <div className="lookbook__caption">
            <p className="section-eyebrow">Quilted</p>
            <h2>Chain Bag</h2>
            <span className="lookbook__cta">Shop colourways</span>
          </div>
        </Link>
      </section>

      <Reveal>
        <section className="section manifesto">
          <div className="container">
            <p className="section-eyebrow">The house</p>
            <h2 className="manifesto__title">
              Less noise. More presence. Pieces that feel like you.
            </h2>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container-wide">
            <div className="section-head">
              <p className="section-eyebrow">Shop by line</p>
              <h2 className="section-title">Four lines. One house.</h2>
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
      </Reveal>

      <Reveal>
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container-wide">
            <div className="section-head section-head--row">
              <div>
                <p className="section-eyebrow">New</p>
                <h2 className="section-title">Just in</h2>
              </div>
              <Link to="/shop" className="text-link">
                View all
              </Link>
            </div>
            <div className="product-grid">
              {arrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      <section className="values">
        <div className="container-wide values__grid">
          <Reveal>
            <article>
              <p className="section-eyebrow">01</p>
              <h3>Editorial cut</h3>
              <p>Clean lines and quiet detailing — built for everyday presence.</p>
            </article>
          </Reveal>
          <Reveal>
            <article>
              <p className="section-eyebrow">02</p>
              <h3>Colourways</h3>
              <p>Versions and shades to match your mood — taupe to noir.</p>
            </article>
          </Reveal>
          <Reveal>
            <article>
              <p className="section-eyebrow">03</p>
              <h3>Your signature</h3>
              <p>Weaves, bags, scent, and tees — one cohesive edit.</p>
            </article>
          </Reveal>
        </div>
      </section>

      {quilted && quiltedImage ? (
        <section className="spotlight-bleed">
          <div
            className="spotlight-bleed__media"
            style={{ backgroundImage: `url(${quiltedImage})` }}
          />
          <div className="spotlight-bleed__body">
            <p className="section-eyebrow">Featured</p>
            <h2 className="section-title">Quilted Chain</h2>
            <p className="section-copy">
              Puffy quilt. Brushed gold. Wear it short or long — your signature
              carry.
            </p>
            <Link to={`/product/${quilted.id}`} className="btn btn-primary">
              Explore versions
            </Link>
          </div>
        </section>
      ) : null}

      <Reveal>
        <section className="section newsletter">
          <div className="container">
            <div className="section-head">
              <p className="section-eyebrow">Newsletter</p>
              <h2 className="section-title">New drops, quietly announced.</h2>
              <p className="section-copy">Be first when the next edit lands.</p>
            </div>
            <form
              className="newsletter__form"
              onSubmit={(e) => {
                e.preventDefault();
                e.currentTarget.reset();
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
      </Reveal>
    </div>
  );
}
