import { createBrowserRouter } from "react-router";
import App from "./App";
import Contact from "./Contact";

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
  },
  {
    path: "/contact",
    Component: Contact,
  }
]);

export default router;
