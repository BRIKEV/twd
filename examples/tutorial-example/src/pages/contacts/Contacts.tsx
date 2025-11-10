import { Outlet, useFetchers, useLoaderData } from "react-router";
import { loadContacts } from "./loader";
import Sidebar from "@/components/Sidebar/Sidebar";

const ContactsPage = () => {
  const { contacts } = useLoaderData<typeof loadContacts>();
  const fetchers = useFetchers();
  const submitContacts = fetchers.find(fetcher => 
    fetcher.formMethod === 'POST' && fetcher.formAction === '/contacts/new'
  );
  let username = '';
  if (submitContacts && submitContacts.state === 'loading' && submitContacts.formData) {
    const formData = submitContacts.formData;
    const firstName = formData.get('firstName') as string || '';
    const lastName = formData.get('lastName') as string || '';
    username = `${firstName} ${lastName}`;
  }
  return (
    <div className="h-screen grid grid-cols-[300px_1fr]">
      {/* Sidebar */}
      <div className="border-r p-4 flex flex-col gap-4">
        <Sidebar contacts={contacts.map(contact => ({
          id: contact.id,
          name: `${contact.firstName} ${contact.lastName}`,
        }))} pendingContactName={username}/>
      </div>
      {/* Detail View */}
      <div className="p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default ContactsPage;
