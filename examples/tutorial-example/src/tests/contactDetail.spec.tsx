import { createRoutesStub } from "react-router";
import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import ContactsPage from "@/pages/Contacts";
import ContactDetail from "@/pages/ContactDetail";
import { Contact } from "@/api/contacts";
import ContactsSkeletonPage from "@/Layouts/HomeSkeleton";
import userEvent from "@testing-library/user-event";

describe("Contact Detail Page", () => {
  let Stub: ReturnType<typeof createRoutesStub>;

  const contacts: Contact[] = [
    {
      id: "1",
      firstName: "Jane",
      lastName: "Doe",
      username: "jane_doe",
      avatar: "https://i.pravatar.cc/150?img=1",
      email: "jane.doe@example.com",
      phone: "+1 555-1234",
      favorite: true,
    },
  ];
  beforeEach(() => {
    Stub = createRoutesStub([
      {
        path: "/",
        id: "root",
        Component: ContactsPage,
        HydrateFallback: ContactsSkeletonPage,
        loader() {
          return { contacts };
        },
        children: [
          {
            path: "contacts/:contactId",
            action: async () => {
              await new Promise(resolve => setTimeout(resolve, 500));
              return null;
            },
            Component: ContactDetail,
          },
        ],
      },
    ]);
  });

  it("Render detail page", async () => {
    render(<Stub initialEntries={["/contacts/1"]} />);
    await waitFor(() => screen.findByText('jane_doe'));
  });

  it("Render detail page with missing contact", async () => {
    render(<Stub initialEntries={["/contacts/2"]} />);
    await waitFor(() => screen.findByText('Contact not found'));
  });

  it("should optimistically toggle favorite icon on click", async () => {
    const user = userEvent.setup();
    render(<Stub initialEntries={["/contacts/1"]} />);
    await waitFor(() => screen.findByText('jane_doe'));
    const favoriteButton = screen.getByLabelText("Favorite");
    await user.click(favoriteButton);
    expect(screen.getByLabelText("Not Favorite")).toBeInTheDocument();
    const toggleFavFetcher = screen.getByTestId("toggle-favorite");
    expect(toggleFavFetcher).toBeDisabled();
  });
});
