import { createBrowserRouter } from "react-router";
import ContactsPage from "./pages/contacts/Contacts";
import ContactForm from "./pages/contacts/ContactForm";
import { loadContacts } from "./pages/contacts/loader";
import ContactsSkeletonPage from "./Layouts/HomeSkeleton";
import ContactDetail from "./pages/contacts/ContactDetail";
import { contactDetailActions, newContactAction } from "./pages/contacts/actions";
import Helloworld from "./pages/Helloworld/Helloworld";
import TodoList from "./pages/TodoList/TodoList";
import { loadTodos } from "./pages/TodoList/loader";
import { todoActions } from "./pages/TodoList/action";

const AppRoutes = createBrowserRouter([
  {
    path: "/",
    Component: Helloworld,
  },
  {
    path: "/contacts",
    loader: loadContacts,
    id: "root",
    HydrateFallback: ContactsSkeletonPage,
    Component: ContactsPage,
    children: [
      {
        path: "contacts/:contactId",
        action: contactDetailActions,
        Component: ContactDetail,
      },
      {
        path: "contacts/new",
        action: newContactAction,
        Component: ContactForm,
      },
    ],
  },
  {
    path: "/todos",
    loader: loadTodos,
    action: todoActions,
    Component: TodoList,
  },
  {
    path: "/about",
    element: <div>About</div>,
  },
  {
    path: "*",
    element: <div>Not Found</div>,
  },
]);

export default AppRoutes;
