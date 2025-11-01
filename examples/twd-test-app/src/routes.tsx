import { createBrowserRouter } from "react-router";
import App from "./pages/App/App";
import Contact from "./pages/Contact";
import Assertions from "./pages/Assertions/Assertions";
import { LoadShows } from "./pages/LoadShows";

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
  },
  {
    path: '/shows',
    Component: LoadShows,
  },
  {
    path: "*",
    element: <div>404 Not Found</div>,
  }
]);

export default router;
