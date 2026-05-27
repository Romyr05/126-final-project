import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  symlinkSync,
} from "node:fs";
import path from "node:path";

if (process.env.VERCEL !== "1") {
  process.exit(0);
}

const frontendDir = process.cwd();
const repoRoot = path.dirname(frontendDir);
const frontendNextDir = path.join(frontendDir, ".next");
const rootNextDir = path.join(repoRoot, ".next");
const frontendNodeModulesDir = path.join(frontendDir, "node_modules");
const rootNodeModulesDir = path.join(repoRoot, "node_modules");
const routesManifest = path.join(frontendNextDir, "routes-manifest.json");
const deterministicRoutesManifest = path.join(
  frontendNextDir,
  "routes-manifest-deterministic.json",
);

function linkIfMissing(source, target) {
  if (existsSync(target)) {
    return;
  }

  symlinkSync(source, target, "dir");
}

function exposeFrontendNodeModulesAtRepoRoot() {
  if (!existsSync(frontendNodeModulesDir)) {
    return;
  }

  mkdirSync(rootNodeModulesDir, { recursive: true });

  for (const entry of readdirSync(frontendNodeModulesDir, {
    withFileTypes: true,
  })) {
    if (entry.name === ".bin") {
      continue;
    }

    const source = path.join(frontendNodeModulesDir, entry.name);
    const target = path.join(rootNodeModulesDir, entry.name);

    if (!entry.name.startsWith("@")) {
      linkIfMissing(source, target);
      continue;
    }

    mkdirSync(target, { recursive: true });

    for (const scopedEntry of readdirSync(source, { withFileTypes: true })) {
      linkIfMissing(
        path.join(source, scopedEntry.name),
        path.join(target, scopedEntry.name),
      );
    }
  }
}

if (!existsSync(routesManifest)) {
  console.warn(
    "[vercel-root-manifest-workaround] Skipping: .next/routes-manifest.json was not found.",
  );
  process.exit(0);
}

if (!existsSync(deterministicRoutesManifest)) {
  copyFileSync(routesManifest, deterministicRoutesManifest);
}

if (!existsSync(rootNextDir)) {
  try {
    symlinkSync(frontendNextDir, rootNextDir, "dir");
  } catch {
    mkdirSync(rootNextDir, { recursive: true });
  }
}

const rootDeterministicRoutesManifest = path.join(
  rootNextDir,
  "routes-manifest-deterministic.json",
);

if (!existsSync(rootDeterministicRoutesManifest)) {
  copyFileSync(deterministicRoutesManifest, rootDeterministicRoutesManifest);
}

exposeFrontendNodeModulesAtRepoRoot();
