import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  favorite: boolean;
  avatar?: string;
}

interface NewContact {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  avatar?: string;
}

// simulate a slow network
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchContacts = async () => {
  const response = await api.get<Contact[]>('/contacts');
  await delay(2000); // Simulate network delay
  return response.data;
};

export const fetchContactById = async (id: string) => {
  const response = await api.get<Contact>(`/contacts/${id}`);
  await delay(5000); // Simulate network delay
  return response.data;
};

export const createContact = async (contact: NewContact) => {
  const response = await api.post<Contact>('/contacts', contact);
  return response.data;
};

export const deleteContact = async (id: string) => {
  await api.delete(`/contacts/${id}`);
};

export const updateFavoriteStatus = async (id: string, favorite: boolean) => {
  await api.patch(`/contacts/${id}`, { favorite });
};
