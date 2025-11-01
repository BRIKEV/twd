import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContactsSkeletonPage() {
  return (
    <div className="h-screen grid grid-cols-[300px_1fr]">
      {/* Sidebar */}
      <div className="border-r p-4 flex flex-col gap-4">
        <Input disabled placeholder="Search..." className="mb-2" />
        <Button disabled variant="secondary" className="w-full mb-4">
          New
        </Button>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((_, idx) => (
              <Skeleton key={idx} className="h-8 w-full rounded-md" />
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Panel */}
      <div className="flex-1 p-8" data-testid="main-panel-skeleton">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}
