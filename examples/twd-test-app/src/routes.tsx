import { createBrowserRouter } from "react-router";
import App from "./pages/App/App";
import Contact from "./pages/Contact";
import Assertions from "./pages/Assertions/Assertions";
import { LoadShows } from "./pages/LoadShows";
import ScreenQueries from "./pages/ScreenQueries";
import MockComponent from "./pages/MockComponent";

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
    path: '/screen-queries',
    Component: ScreenQueries,
  },
  {
    path: '/mock-component',
    Component: MockComponent,
  },
  {
    path: "*",
    element: <div>404 Not Found</div>,
  }
]);

export default router;
