import { ActionFunctionArgs, redirect } from "react-router";
import { createTodo, deleteTodo } from "@/api/todos";

interface NewTodo {
  title: string;
  description: string;
  date: string;
}

export const todoActions = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const method = request.method.toUpperCase();

  const handlers: Record<string, () => Promise<Response | null>> = {
    POST: async () => {
      const newTodo: NewTodo = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        date: formData.get('date') as string,
      };
      await createTodo(newTodo);
      return redirect("/todos");
    },
    DELETE: async () => {
      const id = formData.get("id") as string;
      await deleteTodo(id);
      return redirect("/todos");
    },
  };

  if (handlers[method]) {
    return handlers[method]();
  }

  return null;
};

