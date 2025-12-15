import { useState } from 'react';
import { Button } from '@/components/ui/button';
import DialogExample from '@/components/DialogExample';

export default function Helloworld() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-foreground" data-testid="welcome-title">
            Welcome to TWD
          </h1>
          <p className="text-xl text-muted-foreground">
            Test Web Dev - A powerful testing framework for web applications
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-lg text-foreground">
            Get started by reading the{' '}
            <a
              href="https://brikev.github.io/twd/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline font-medium"
            >
              documentation
            </a>
            .
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 pt-8">
          <Button
            onClick={() => setCount((count) => count + 1)}
            size="lg"
            className="min-w-[200px]"
            data-testid="counter-button"
          >
            Count is {count}
          </Button>
          <p className="text-sm text-muted-foreground">
            Click the button to test TWD features
          </p>
        </div>
        <DialogExample />
      </div>
    </div>
  );
}
