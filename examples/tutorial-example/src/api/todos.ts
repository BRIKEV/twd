import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

export interface Todo {
  id: string;
  title: string;
  description: string;
  date: string;
}

interface NewTodo {
  title: string;
  description: string;
  date: string;
}

export const fetchTodos = async () => {
  const response = await api.get<Todo[]>('/todos');
  return response.data;
};

export const createTodo = async (todo: NewTodo) => {
  const response = await api.post<Todo>('/todos', todo);
  return response.data;
};

export const deleteTodo = async (id: string) => {
  await api.delete(`/todos/${id}`);
};

