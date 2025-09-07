import { createBrowserRouter } from "react-router";
import App from "./pages/App/App";
import Contact from "./pages/Contact";
import Assertions from "./pages/Assertions/Assertions";

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
  },
  {
    path: "/assertions",
    Component: Assertions,
  },
  {
    path: "/contact",
    Component: Contact,
  }
]);

export default router;
