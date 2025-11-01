import { createRoutesStub } from "react-router";
import {
  render,
  screen,
} from "@testing-library/react";
import ContactForm from "@/pages/ContactForm";
import userEvent from "@testing-library/user-event";

test("ContactForm renders with empty fields", async () => {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: ContactForm,
    },
  ]);
  // render the app stub at "/"
  render(<Stub initialEntries={["/"]} />);
  // check form fields are empty
  expect(screen.getByLabelText("First Name")).toHaveValue("");
  expect(screen.getByLabelText("Last Name")).toHaveValue("");
  expect(screen.getByLabelText("Username")).toHaveValue("");
  expect(screen.getByLabelText("Email")).toHaveValue("");
  expect(screen.getByLabelText("Phone")).toHaveValue("");
  expect(screen.getByLabelText("Avatar (Optional)")).toHaveValue("");
});

test("ContactForm shows validation errors on submit", async () => {
  const user = userEvent.setup();

  const Stub = createRoutesStub([
    {
      path: "/",
      Component: ContactForm,
    },
  ]);

  // render the app stub at "/"
  render(<Stub initialEntries={["/"]} />);

  // submit the form without filling any fields
  const submitButton = screen.getByRole("button", { name: /create contact/i });
  await user.click(submitButton);
  // check for validation errors
  expect(screen.getByText("First name is required")).toBeInTheDocument();
  expect(screen.getByText("Last name is required")).toBeInTheDocument();
});

test("ContactForm submits valid data", async () => {
  const user = userEvent.setup();
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: ContactForm,
    },
  ]);
  // render the app stub at "/"
  render(<Stub initialEntries={["/"]} />);
  // fill the form with valid data
  await user.type(screen.getByLabelText("First Name"), "John");
  await user.type(screen.getByLabelText("Last Name"), "Doe");
  await user.type(screen.getByLabelText("Username"), "john_doe");
  await user.type(screen.getByLabelText("Email"), "test@test.com");
  await user.type(screen.getByLabelText("Phone"), "1234567890");
  await user.type(screen.getByLabelText("Avatar (Optional)"), "https://example.com/avatar.jpg");
  // submit the form
  const submitButton = screen.getByRole("button", { name: /create contact/i });
  await user.click(submitButton);
  // check validation errors not present
  expect(screen.queryByText("First name is required")).not.toBeInTheDocument();
});
