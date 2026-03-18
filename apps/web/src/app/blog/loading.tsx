import { BlogListSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <main className="container mx-auto my-16 px-4 md:px-6">
      <div className="flex w-full flex-col items-center">
        <div className="flex flex-col items-center space-y-4 text-center sm:space-y-6">
          <div className="h-12 w-48 animate-pulse bg-muted" />
          <div className="h-6 w-96 max-w-full animate-pulse bg-muted" />
        </div>
      </div>
      <div className="mt-12">
        <BlogListSkeleton />
      </div>
    </main>
  );
}
