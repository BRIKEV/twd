import { useFetcher } from "react-router";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Todo } from "@/api/todos";

interface TodoItemProps {
  todo: Todo;
}

export default function TodoItem({ todo }: TodoItemProps) {
  const deleteFetcher = useFetcher();
  const isDeleting = deleteFetcher.state === "submitting" || deleteFetcher.state === "loading";

  return (
    <Card data-testid="todo-item">
      <CardHeader>
        <CardTitle data-testid={`todo-title-${todo.id}`}>{todo.title}</CardTitle>
        <CardDescription data-testid={`todo-description-${todo.id}`}>{todo.description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground" data-testid={`todo-date-${todo.id}`}>
          Date: {new Date(todo.date).toLocaleDateString()}
        </span>
        <deleteFetcher.Form method="DELETE" action="/todos">
          <input type="hidden" name="id" value={todo.id} />
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            disabled={isDeleting}
            data-testid={`delete-todo-${todo.id}`}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </deleteFetcher.Form>
      </CardFooter>
    </Card>
  );
}

