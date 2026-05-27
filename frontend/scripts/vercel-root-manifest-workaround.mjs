import { copyFileSync, existsSync, mkdirSync, symlinkSync } from "node:fs";
import path from "node:path";

if (process.env.VERCEL !== "1") {
  process.exit(0);
}

const frontendDir = process.cwd();
const repoRoot = path.dirname(frontendDir);
const frontendNextDir = path.join(frontendDir, ".next");
const rootNextDir = path.join(repoRoot, ".next");
const frontendNextPackageDir = path.join(frontendDir, "node_modules", "next");
const rootNextPackageDir = path.join(repoRoot, "node_modules", "next");
const routesManifest = path.join(frontendNextDir, "routes-manifest.json");
const deterministicRoutesManifest = path.join(
  frontendNextDir,
  "routes-manifest-deterministic.json",
);

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

if (existsSync(frontendNextPackageDir) && !existsSync(rootNextPackageDir)) {
  mkdirSync(path.dirname(rootNextPackageDir), { recursive: true });

  try {
    symlinkSync(frontendNextPackageDir, rootNextPackageDir, "dir");
  } catch {
    const adapterFile = path.join(
      "dist",
      "build",
      "adapter",
      "setup-node-env.external.js",
    );
    const rootAdapterFile = path.join(rootNextPackageDir, adapterFile);

    mkdirSync(path.dirname(rootAdapterFile), { recursive: true });
    copyFileSync(path.join(frontendNextPackageDir, adapterFile), rootAdapterFile);
  }
}
