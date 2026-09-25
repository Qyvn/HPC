import { Outlet, ScrollRestoration } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";

export function AppLayout() {
  return (
    <div className="app-shell">
      <Header />
      <Outlet />
      <Footer />
      <CartDrawer />
      <ScrollRestoration />
    </div>
  );
}
