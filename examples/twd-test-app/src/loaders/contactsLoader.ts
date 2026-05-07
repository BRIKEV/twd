import type { LoaderFunctionArgs } from "react-router";

export type Contact = {
  id: number;
  name: string;
  email: string;
};

type ContactResponse = {
  contacts: Contact[];
  currentPage: number;
  totalPages: number;
}

export const contactsLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
	const pageParam = url.searchParams.get("page");
  console.log(pageParam)
  const response = await fetch("http://localhost:3000/v1/contacts");

  if (!response.ok) {
    throw new Response("Failed to load contacts", {
      status: response.status,
      statusText: response.statusText,
    });
  }

  const contactsResponse = (await response.json()) as ContactResponse;

  return contactsResponse;
};
