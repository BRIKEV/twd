import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
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


export const fetchContacts = async () => {
  const response = await api.get<Contact[]>('/contacts');
  return response.data;
};

export const fetchContactById = async (id: string) => {
  const response = await api.get<Contact>(`/contacts/${id}`);
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
