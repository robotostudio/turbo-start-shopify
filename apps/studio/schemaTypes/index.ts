import { pageBuilderBlocks } from "@/schemaTypes/blocks";
import { definitions } from "@/schemaTypes/definitions";
import { documents, singletons } from "@/schemaTypes/documents";
import { annotations, objects } from "@/schemaTypes/objects";

export const schemaTypes = [
  ...documents,
  ...objects,
  ...annotations,
  ...definitions,
  ...pageBuilderBlocks,
];

export const schemaNames = [...documents].map((doc) => doc.name);
export type SchemaType = (typeof schemaNames)[number];

export const singletonType = singletons.map(({ name }) => name);
export type SingletonType = (typeof singletonType)[number];

export default schemaTypes;
