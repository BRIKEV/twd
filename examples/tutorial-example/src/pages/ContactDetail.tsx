import { useParams, useRouteLoaderData } from "react-router";
import { loadContacts } from "./loader";
import ContactCard from "@/components/ContactCard/ContactCard";

const ContactDetail = () => {
  const { contactId } = useParams<{ contactId: string }>(); // Needs TS type annotation
  const routeData = useRouteLoaderData<typeof loadContacts>("root");
  if (!routeData) {
    return <div>Loading...</div>;
  }

  const { contacts } = routeData;
  
  // Find the contact locally (outside the store)
  const contact = contacts.find((c) => c.id === contactId);

  if (!contact) {
    return <div>Contact not found</div>;
  }
  return (
    <ContactCard
      avatar={contact.avatar}
      name={`${contact.firstName} ${contact.lastName}`}
      username={contact.username}
      favorite={contact.favorite}
      id={contact.id}
    />
  );
}

export default ContactDetail;
