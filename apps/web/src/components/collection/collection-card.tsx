import Image from "next/image";
import Link from "next/link";

type CollectionCardProps = {
  handle: string;
  title: string;
  imageUrl: string | null;
  description?: string | null;
};

/** Strips HTML tags from a string. */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function CollectionCard({
  handle,
  title,
  imageUrl,
  description,
}: CollectionCardProps) {
  const plainDescription = description ? stripHtml(description) : null;
  return (
    <Link
      className="group block overflow-hidden bg-card"
      href={`/collections/${handle}`}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {imageUrl ? (
          <Image
            alt={title}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            src={imageUrl}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
      </div>
      <div className="py-4 flex flex-col gap-2">
        <h2 className="font-medium text-sm md:text-xl group-hover:underline">
          {title}
        </h2>
        {plainDescription ? (
          <p className=" line-clamp-2 text-muted-foreground text-xs">
            {plainDescription}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
