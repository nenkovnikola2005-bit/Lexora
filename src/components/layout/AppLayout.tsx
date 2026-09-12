import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import "./AppLayout.scss";

// Zajednički okvir za sve prijavljene stranice: navigacija + sadržaj.
export function AppLayout() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-layout__content">
        <Outlet />
      </main>
    </div>
  );
}
