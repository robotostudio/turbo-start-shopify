import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function log(msg: string) {
  console.log(`  ${msg}`);
}

function checkNodeVersion() {
  const [major] = process.versions.node.split(".").map(Number);
  if (!major || major < 22) {
    console.error(
      "Error: Node.js >= 22 is required. Current: " + process.version,
    );
    process.exit(1);
  }
  log("Node.js " + process.version + " ✓");
}

function copyEnvFiles() {
  const envFiles = [
    { example: "apps/web/.env.example", target: "apps/web/.env" },
    { example: "apps/studio/.env.example", target: "apps/studio/.env" },
  ];

  for (const { example, target } of envFiles) {
    const examplePath = join(ROOT, example);
    const targetPath = join(ROOT, target);

    if (existsSync(targetPath)) {
      log(target + " already exists, skipping");
    } else if (existsSync(examplePath)) {
      copyFileSync(examplePath, targetPath);
      log(target + " created from " + example);
    } else {
      log(example + " not found, skipping");
    }
  }
}

function main() {
  console.log("\nSetting up turbo-start-shopify...\n");

  checkNodeVersion();
  copyEnvFiles();

  console.log("\nSetup complete!\n");
  console.log("Next steps:");
  console.log(
    "  1. Fill in environment variables in apps/web/.env and apps/studio/.env",
  );
  console.log("  2. Run: pnpm dev");
  console.log(
    "  3. Open http://localhost:3000 (storefront) and http://localhost:3333 (studio)\n",
  );
}

main();
