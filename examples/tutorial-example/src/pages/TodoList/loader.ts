import { fetchTodos } from "@/api/todos";

export const loadTodos = async () => {
  const todos = await fetchTodos();
  return { todos };
};

