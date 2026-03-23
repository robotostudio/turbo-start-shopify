import Link from "next/link";

import type { Blog } from "@/types";
import { SanityImage } from "./elements/sanity-image";

type BlogCardProps = {
  blog: Blog;
};

type BlogAuthorProps = {
  author: Blog["authors"];
};

function formatDate(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function BlogAuthor({ author }: BlogAuthorProps) {
  if (!author) {
    return null;
  }

  return (
    <div className="flex items-center gap-x-2.5 font-semibold text-foreground text-sm/6">
      {author.image && (
        <div className="size-6 flex-none overflow-hidden rounded-full bg-muted">
          <SanityImage
            alt={author.name ?? "Author"}
            className="h-full w-full object-cover"
            height={24}
            image={author.image}
            width={24}
          />
        </div>
      )}
      {author.name}
    </div>
  );
}

export function FeaturedBlogCard({ blog }: BlogCardProps) {
  const { title, publishedAt, slug, description, image, authors } = blog;

  return (
    <Link
      className="group grid w-full grid-cols-1 gap-8 lg:grid-cols-2"
      href={slug ?? "#"}
    >
      {image?.id && (
        <div className="overflow-hidden ">
          <SanityImage
            alt={title ?? "Blog post image"}
            className="aspect-video w-full bg-muted object-cover transition-transform duration-500 group-hover:scale-105"
            height={400}
            image={image}
            width={800}
          />
        </div>
      )}
      <div className="flex flex-col justify-center gap-4">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {publishedAt && (
            <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
          )}
          {publishedAt && authors && (
            <span className="text-muted-foreground/50">&middot;</span>
          )}
          <BlogAuthor author={authors} />
        </div>
        <h2 className="font-semibold text-2xl leading-tight font-(family-name:--font-geist-pixel-square)">
          {title}
        </h2>
        <p className="text-muted-foreground text-sm leading-6">{description}</p>
      </div>
    </Link>
  );
}

export function BlogCard({ blog }: BlogCardProps) {
  if (!blog) {
    return (
      <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="aspect-video animate-pulse bg-muted" />
        <div className="flex flex-col justify-center space-y-3">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-6 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  const { title, publishedAt, slug, description, image, authors } = blog;

  return (
    <Link
      className="group grid w-full grid-cols-1 gap-8 lg:grid-cols-2"
      href={slug ?? "#"}
    >
      {image?.id && (
        <div className="relative aspect-video overflow-hidden">
          <SanityImage
            alt={title ?? "Blog post image"}
            className="aspect-video w-full bg-muted object-cover transition-transform duration-500 group-hover:scale-105"
            height={400}
            image={image}
            width={800}
          />
          <div className="absolute inset-0 ring-1 ring-border ring-inset" />
        </div>
      )}
      <div className="flex flex-col justify-center gap-3">
        {publishedAt && (
          <time className="text-xs text-muted-foreground" dateTime={publishedAt}>
            {formatDate(publishedAt)}
          </time>
        )}
        <h3 className="font-semibold text-lg leading-6">
          {title}
        </h3>
        <p className="line-clamp-2 text-muted-foreground text-sm leading-6">
          {description}
        </p>
        <BlogAuthor author={authors} />
      </div>
    </Link>
  );
}

export function BlogHeader({
  title,
  description,
}: {
  title: string | null;
  description: string | null;
}) {
  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex flex-col items-center space-y-4 text-center sm:space-y-6">
        <h1 className="font-semibold text-4xl md:text-5xl font-(family-name:--font-geist-pixel-square)">
          {title}
        </h1>
        <p className="max-w-3xl text-balance text-base text-muted-foreground md:text-lg">
          {description}
        </p>
      </div>
    </div>
  );
}
