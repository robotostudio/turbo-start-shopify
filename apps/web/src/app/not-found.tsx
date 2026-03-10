import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto flex h-screen flex-col items-center justify-center px-4">
      <p className="select-none font-(family-name:--font-geist-pixel-square) text-[10rem] leading-none text-foreground md:text-[14rem] lg:text-[24rem]">
        404
      </p>
      <div className="flex flex-col items-center gap-4">
        <h1 className="font-light text-3xl tracking-tight md:text-4xl">
          This page doesn&apos;t exist
        </h1>
        <p className="text-muted-foreground text-sm tracking-wide">
          The page you were looking for could not be found.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/collections"
            className="rounded-none border border-foreground bg-foreground px-6 py-2.5 text-sm uppercase text-background tracking-wider transition-colors hover:bg-transparent hover:text-foreground"
          >
            Back to Shop
          </Link>
          <Link
            href="/"
            className="rounded-none border border-foreground bg-transparent px-6 py-2.5 text-sm uppercase text-foreground tracking-wider transition-colors hover:bg-foreground hover:text-background"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
