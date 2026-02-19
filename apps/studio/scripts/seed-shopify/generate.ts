/** Faker-based product generator with 5 category buckets. */

import { faker } from "@faker-js/faker";
import type { GeneratorOptions, ProductDef, VariantDef } from "./types.js";

// ---------------------------------------------------------------------------
// Unsplash image pools per category
// ---------------------------------------------------------------------------

const UNS = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&fit=crop&auto=format`;

const IMAGE_POOLS: Record<string, string[]> = {
  Apparel: [
    "1521572163474-6864f9cf17ab",
    "1583743814966-8936f5b7be1a",
    "1576566588028-4147f3842f27",
    "1618354691373-d851c5c3a990",
    "1529374255404-311a2a4f1fd9",
    "1503341504253-dff4815485f1",
    "1581655353564-df123a1eb820",
    "1556821840-3a63f15732ce",
    "1509942774463-acf339cf87d5",
    "1604644401890-0bd678c83788",
  ],
  Accessories: [
    "1553062407-98eeb64c6a62",
    "1622560480605-d83c853bc5c3",
    "1547949003-9792a18a2601",
    "1581605405668-7e9d26e45fc2",
    "1572635122851-f4b8a54e1e2d",
    "1511499767772-6d3eb2ae5b9f",
    "1508296695146-257a814071e3",
    "1523275335684-37898b6baf30",
    "1546868871-7041f2a55e12",
    "1533139143976-30918515162d",
  ],
  Footwear: [
    "1542291026-7eec264c27ff",
    "1491553895911-0055eca6402d",
    "1523275335684-37898b6baf30",
    "1552346154-21d32810aba3",
    "1560769629-975ec94e516a",
    "1595950653106-6c9ebd614d3a",
    "1543508282-6319a3e2621f",
    "1549298916-b41d501d3772",
    "1606107557195-0e29a4b5b4aa",
    "1605408499391-6368c628ef42",
  ],
  Home: [
    "1579783902614-a3fb3927b6a5",
    "1605721911519-3dfeb3be25e7",
    "1574158622682-e40e69881006",
    "1601597111158-2fceff292cdc",
    "1556909114-f6e7ad7d3136",
    "1586023492125-27b2c045efd7",
    "1507003211169-0a1dd7228f2d",
    "1540932239986-30128078f3c5",
    "1513694203232-719a280e022f",
    "1555041469-a586c1ea9fe4",
  ],
  Digital: [
    "1517694712202-14dd9538aa97",
    "1561070791-2526d30994b5",
    "1541462608143-67571c6738dd",
    "1498050108023-c5249f4df085",
    "1504639725590-34d0984388bd",
    "1526374965328-7f61d4dc18c5",
    "1555949963-ff9fe0c870eb",
    "1550439062-609e1531270e",
    "1551288049-bebda4e38f71",
    "1518770660439-4636190af475",
  ],
};

// ---------------------------------------------------------------------------
// Category config
// ---------------------------------------------------------------------------

interface CategoryConfig {
  type: string;
  taxonomyNodeId: string;
  optionSets: Array<{ name: string; values: string[] }>;
  priceRange: [number, number];
  weightRange: [number, number];
  requiresShipping: boolean;
}

const CATEGORIES: CategoryConfig[] = [
  {
    type: "Apparel",
    taxonomyNodeId: "gid://shopify/TaxonomyCategory/aa-1",
    optionSets: [
      { name: "Size", values: ["S", "M", "L", "XL"] },
      { name: "Color", values: ["Black", "White", "Navy", "Grey", "Olive"] },
    ],
    priceRange: [29, 89],
    weightRange: [200, 600],
    requiresShipping: true,
  },
  {
    type: "Accessories",
    taxonomyNodeId: "gid://shopify/TaxonomyCategory/aa-2",
    optionSets: [
      {
        name: "Color",
        values: ["Black", "Brown", "Tan", "Silver", "Gold", "Navy", "Olive"],
      },
    ],
    priceRange: [34, 149],
    weightRange: [45, 900],
    requiresShipping: true,
  },
  {
    type: "Footwear",
    taxonomyNodeId: "gid://shopify/TaxonomyCategory/aa-8",
    optionSets: [
      { name: "Size", values: ["7", "8", "9", "10", "11", "12"] },
      {
        name: "Color",
        values: ["Black", "White", "Grey", "Navy", "White/Blue", "Black/Red"],
      },
    ],
    priceRange: [79, 199],
    weightRange: [350, 350],
    requiresShipping: true,
  },
  {
    type: "Home",
    taxonomyNodeId: "gid://shopify/TaxonomyCategory/hg",
    optionSets: [],
    priceRange: [12, 49],
    weightRange: [100, 500],
    requiresShipping: true,
  },
  {
    type: "Digital",
    taxonomyNodeId: "gid://shopify/TaxonomyCategory/so",
    optionSets: [],
    priceRange: [4, 29],
    weightRange: [0, 0],
    requiresShipping: false,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

function pickOptionValues(optSet: {
  name: string;
  values: string[];
}): string[] {
  const max = optSet.name === "Size" ? 4 : 3;
  const count = faker.number.int({ min: 2, max });
  return pickRandom(optSet.values, count);
}

function cartesian(arrays: string[][]): string[][] {
  if (arrays.length === 0) return [[]];
  const [first, ...rest] = arrays;
  const restCombos = cartesian(rest);
  const result: string[][] = [];
  for (const val of first!) {
    for (const combo of restCombos) {
      result.push([val, ...combo]);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Variant builder
// ---------------------------------------------------------------------------

function buildVariants(
  category: CategoryConfig,
  selectedOptions: Array<{ name: string; values: string[] }>,
  basePrice: number,
  hasCompareAt: boolean,
  runId: string,
  productIdx: number
): VariantDef[] {
  const variants: VariantDef[] = [];

  if (selectedOptions.length === 0) {
    const abbrev = category.type.slice(0, 3).toUpperCase();
    variants.push({
      options: ["Default Title"],
      price: basePrice.toFixed(2),
      ...(hasCompareAt
        ? {
            compareAtPrice: (
              basePrice + faker.number.int({ min: 5, max: 20 })
            ).toFixed(2),
          }
        : {}),
      sku: `${abbrev}-${runId}-${productIdx}-0`,
      inventoryQuantity:
        category.type === "Digital"
          ? 9999
          : faker.number.int({ min: 0, max: 50 }),
      requiresShipping: category.requiresShipping,
      weight: faker.number.int({
        min: category.weightRange[0],
        max: category.weightRange[1] || 1,
      }),
      weightUnit: "GRAMS",
    });
    return variants;
  }

  const combos = cartesian(selectedOptions.map((o) => o.values));
  let comboIdx = 0;

  for (const combo of combos) {
    const abbrevs = combo
      .map((v) => v.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase())
      .join("-");
    const priceOffset = comboIdx * faker.number.float({ min: 0, max: 3 });

    variants.push({
      options: combo,
      price: (basePrice + priceOffset).toFixed(2),
      ...(hasCompareAt
        ? {
            compareAtPrice: (
              basePrice +
              priceOffset +
              faker.number.int({ min: 5, max: 20 })
            ).toFixed(2),
          }
        : {}),
      sku: `${abbrevs}-${runId}-${productIdx}-${comboIdx}`,
      inventoryQuantity: faker.number.int({ min: 0, max: 50 }),
      inventoryPolicy: "DENY",
      requiresShipping: category.requiresShipping,
      weight: faker.number.int({
        min: category.weightRange[0],
        max: category.weightRange[1] || 1,
      }),
      weightUnit: "GRAMS",
    });
    comboIdx++;
  }

  return variants;
}

// ---------------------------------------------------------------------------
// Product builder
// ---------------------------------------------------------------------------

function buildProduct(
  category: CategoryConfig,
  runId: string,
  idx: number
): ProductDef {
  const adjective = faker.commerce.productAdjective();
  const material = faker.commerce.productMaterial();
  const noun = faker.commerce.product();
  const title = `${adjective} ${material} ${noun}`;
  const handle = `${slugify(title)}-${runId}-${idx}`;

  const vendor = faker.company.name();
  const basePrice = faker.number.int({
    min: category.priceRange[0],
    max: category.priceRange[1],
  });
  const hasCompareAt = faker.number.float({ min: 0, max: 1 }) < 0.25;

  const selectedOptions = category.optionSets.map((optSet) => ({
    name: optSet.name,
    values: pickOptionValues(optSet),
  }));

  const optionNames =
    selectedOptions.length > 0
      ? selectedOptions.map((o) => o.name)
      : ["Title"];

  const variants = buildVariants(
    category,
    selectedOptions,
    basePrice,
    hasCompareAt,
    runId,
    idx
  );

  const pool = IMAGE_POOLS[category.type] ?? IMAGE_POOLS["Home"]!;
  const imageCount = faker.number.int({ min: 2, max: 4 });
  const imageIds = pickRandom(pool, imageCount);
  const images = imageIds.map((id, i) => ({
    src: UNS(id),
    alt: `${title} — image ${i + 1}`,
  }));

  const tags = [
    category.type.toLowerCase(),
    slugify(noun),
    faker.commerce.department().toLowerCase(),
  ];
  if (hasCompareAt) tags.push("sale");

  const collections = ["all-products"];
  if (faker.number.float({ min: 0, max: 1 }) < 0.4) {
    collections.push("new-arrivals");
  }
  if (category.type === "Accessories" || category.type === "Footwear") {
    collections.push("accessories");
  }

  return {
    handle,
    title,
    descriptionHtml: `<p>${faker.commerce.productDescription()}</p>`,
    productType: category.type,
    category: category.taxonomyNodeId,
    vendor,
    tags,
    status: "ACTIVE",
    options: optionNames,
    variants,
    images,
    collections,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Generates a batch of ProductDef objects — pure function, no I/O. */
export function generateProducts(opts: GeneratorOptions): ProductDef[] {
  const products: ProductDef[] = [];
  for (let i = 0; i < opts.batchSize; i++) {
    const category = CATEGORIES[i % CATEGORIES.length]!;
    products.push(buildProduct(category, opts.runId, i));
  }
  return products;
}
