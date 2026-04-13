import { createBrowserRouter } from "react-router";
import App from "./pages/App/App";
import Contact from "./pages/Contact";
import Assertions from "./pages/Assertions/Assertions";
import { LoadShows } from "./pages/LoadShows";
import ScreenQueries from "./pages/ScreenQueries";
import MockComponent from "./pages/MockComponent";
import Responsive from "./pages/Responsive";
import BlurValidation from "./pages/BlurValidation";
import ComboboxSelect from "./pages/ComboboxSelect";

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
    path: '/responsive',
    Component: Responsive,
  },
  {
    path: '/blur-validation',
    Component: BlurValidation,
  },
  {
    path: '/combobox-select',
    Component: ComboboxSelect,
  },
  {
    path: "*",
    element: <div>404 Not Found</div>,
  }
]);

export default router;
