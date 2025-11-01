import { createRoutesStub } from "react-router";
import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import ContactsPage from "@/pages/Contacts";
import { Contact } from "@/api/contacts";
import ContactsSkeletonPage from "@/Layouts/HomeSkeleton";

test("Home page render new button", async () => {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: ContactsPage,
      HydrateFallback: ContactsSkeletonPage,
      loader() {
        return {
          contacts: [],
        };
      },
    },
  ]);

  // render the app stub at "/login"
  render(<Stub initialEntries={["/"]} />);
  await waitFor(() => screen.findByText('New'));
});

test("Home render sidebar contacts", async () => {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: ContactsPage,
      HydrateFallback: ContactsSkeletonPage,
      loader() {
        const contacts: Contact[] = [
            {
              "id": "1",
              "firstName": "Jane",
              "lastName": "Doe",
              "username": "jane_doe",
              "avatar": "https://i.pravatar.cc/150?img=1",
              "email": "jane.doe@example.com",
              "phone": "+1 555-1234",
              "favorite": true
            },
            {
              "id": "2",
              "firstName": "John",
              "lastName": "Smith",
              "username": "john_smith",
              "avatar": "https://i.pravatar.cc/150?img=12",
              "email": "john.smith@example.com",
              "phone": "+1 555-5678",
              "favorite": true
            },
          ];
        return { contacts };
      },
    },
  ]);
  // render the app stub at "/"
  render(<Stub initialEntries={["/"]} />);
  // check fallback skeleton is rendered
  const mainPanelSkeleton = screen.getByTestId("main-panel-skeleton");
  expect(mainPanelSkeleton).toBeInTheDocument();
  await waitFor(() => screen.findByText('Jane Doe'));
  await waitFor(() => screen.findByText('John Smith'));
  // check skeleton is not rendered
  const mainPanelSkeletonAfterLoad = screen.queryByTestId("main-panel-skeleton");
  expect(mainPanelSkeletonAfterLoad).not.toBeInTheDocument();
});
