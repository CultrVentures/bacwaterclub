import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * File-based persistence for Xero OAuth2 tokens.
 *
 * Why a file: this storefront has no shared database wired up yet. The
 * `postgres` package is in deps but no schema is provisioned, so we keep
 * tokens on disk under `.data/xero-tokens.json` (gitignored).
 *
 * For multi-instance production deploys, swap `loadTokens` / `saveTokens`
 * for a Postgres / KV / Secret Manager implementation — the rest of the
 * Xero module only depends on this interface.
 */

export type StoredXeroTokens = {
  /** Active access token. Lifetime ~30 minutes. */
  accessToken: string;
  /** Refresh token. Lifetime ~60 days; rotates on each use. */
  refreshToken: string;
  /** Unix epoch (seconds) when the access token expires. */
  expiresAt: number;
  /** Xero organisation ID this connection is bound to. */
  tenantId: string;
  /** Xero organisation display name (cosmetic, for /api/xero/connect status). */
  tenantName?: string;
  /** ISO timestamp of last successful refresh. */
  updatedAt: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const TOKEN_FILE = path.join(DATA_DIR, "xero-tokens.json");

export async function loadTokens(): Promise<StoredXeroTokens | null> {
  try {
    const raw = await fs.readFile(TOKEN_FILE, "utf8");
    return JSON.parse(raw) as StoredXeroTokens;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function saveTokens(tokens: StoredXeroTokens): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  // Atomic replace: write to a tempfile and rename. This prevents the
  // active token file from being half-written if the process crashes
  // mid-write, which would otherwise force a manual re-auth.
  const tempFile = `${TOKEN_FILE}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(tokens, null, 2), "utf8");
  await fs.rename(tempFile, TOKEN_FILE);
}

export async function clearTokens(): Promise<void> {
  try {
    await fs.unlink(TOKEN_FILE);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}
