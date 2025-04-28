import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TeachersLoading() {
  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
          <p className="text-muted-foreground">
            Manage teacher records and assignments
          </p>
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Teacher Records</CardTitle>
          <CardDescription>
            View and manage all teacher information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>

          <div className="rounded-md border">
            <div className="h-10 px-4 border-b flex items-center">
              <Skeleton className="h-4 w-[90%]" />
            </div>

            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 border-b flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-[20%]" />
                <Skeleton className="h-4 w-[15%]" />
                <Skeleton className="h-4 w-[15%]" />
                <Skeleton className="h-4 w-[20%]" />
                <Skeleton className="h-4 w-[15%]" />
                <Skeleton className="h-8 w-8 ml-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
