import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";

import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import Reminders from "./pages/Reminders";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import NotificationBell from "./components/NotificationBell";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import AdminDashboard from "./pages/AdminDashboard";
import PharmacyDashboard from "./pages/PharmacyDashboard";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import AdminPanel from "./pages/AdminPanel";

function Router() {
  const { user } = useAuth();
  return (
    <>
      {user && (
        <div className="fixed top-4 right-4 z-40">
          <NotificationBell />
        </div>
      )}
      <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/products"} component={Products} />
      <Route path={"/product"} component={ProductDetail} />
      <Route path={"/cart"} component={Cart} />
      <Route path={"/checkout"} component={Checkout} />
      <Route path={"/order"} component={OrderTracking} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/pharmacy"} component={PharmacyDashboard} />
      <Route path={"/delivery"} component={DeliveryDashboard} />
      <Route path={"/admin-panel"} component={AdminPanel} />
      <Route path={"/doctors"} component={Doctors} />
      <Route path={"/appointments"} component={Appointments} />
        <Route path={"/reminders"} component={Reminders} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/notifications"} component={Notifications} />
      <Route path={"404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
      </Switch>
    </>
  );
  }

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
