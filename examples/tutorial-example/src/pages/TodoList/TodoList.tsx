import { useLoaderData, useFetcher } from "react-router";
import { loadTodos } from "./loader";
import { todoActions } from "./action";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm, SubmitHandler } from "react-hook-form";
import TodoItem from "./TodoItem";

interface FormValues {
  title: string;
  description: string;
  date: string;
}

const TodoList = () => {
  const { todos } = useLoaderData<typeof loadTodos>();
  const fetcher = useFetcher<typeof todoActions>();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    fetcher.submit({ ...data }, { method: 'POST', action: '/todos' });
    reset();
  };

  const isSubmitting = fetcher.state === 'submitting' || fetcher.state === 'loading';

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Todo List</h1>
      
      {/* Todo Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Todo</CardTitle>
          <CardDescription>Add a new todo item with title, description, and date</CardDescription>
        </CardHeader>
        <CardContent>
          <form 
            onSubmit={handleSubmit(onSubmit)} 
            method="POST" 
            action="/todos"
            className="space-y-4"
            data-testid="todo-form"
          >
            <div>
              <Label htmlFor="title" className="mb-2">Title</Label>
              <Input
                type="text"
                id="title"
                {...register("title", { required: "Title is required" })}
                placeholder="Enter todo title"
              />
              {errors.title && (
                <p className="text-destructive text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="mb-2">Description</Label>
              <Input
                type="text"
                id="description"
                {...register("description", { required: "Description is required" })}
                placeholder="Enter todo description"
              />
              {errors.description && (
                <p className="text-destructive text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="date" className="mb-2">Date</Label>
              <Input
                type="date"
                id="date"
                {...register("date", { required: "Date is required" })}
              />
              {errors.date && (
                <p className="text-destructive text-sm mt-1">{errors.date.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Todo'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Todo List */}
      <div className="space-y-4">
        {todos.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground" data-testid="no-todos-message">
              No todos yet. Create one above!
            </CardContent>
          </Card>
        ) : (
          todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))
        )}
      </div>
    </div>
  );
};

export default TodoList;

