import type { QueryCollectionByHandleResult } from "@workspace/sanity/types";

type CollectionModules = NonNullable<
  NonNullable<QueryCollectionByHandleResult>["modules"]
>;
type CollectionModule = CollectionModules[number];

export function CollectionModuleRenderer({
  module,
}: {
  module: CollectionModule;
}) {
  switch (module._type) {
    case "callout":
      return (
        <div className="my-8 border bg-muted/50 p-6 text-center">
          <p className="text-lg">{module.text}</p>
        </div>
      );

    case "callToAction":
      return (
        <div className="my-8 border p-6">
          <h3 className="font-semibold text-xl">{module.title}</h3>
          {module.portableText && (
            <p className="mt-2 text-muted-foreground">{module.portableText}</p>
          )}
        </div>
      );

    default:
      return null;
  }
}
