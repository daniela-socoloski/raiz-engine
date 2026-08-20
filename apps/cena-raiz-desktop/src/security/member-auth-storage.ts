import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type StoredMemberAuth = {
  refreshToken: string;
  email: string;
  name?: string;
  lastValidatedAt: number;
};

export type MemberTokenProtector = {
  isEncryptionAvailable(): boolean;
  encryptString(value: string): Buffer;
  decryptString(value: Buffer): string;
};

type StoredMemberAuthV2 = {
  version: 2;
  protectedRefreshToken: string;
  email: string;
  name?: string;
  lastValidatedAt: number;
};

type StoredMemberAuthV1 = Partial<StoredMemberAuth>;

function asNonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function runtimeAuth(
  document: { email?: unknown; name?: unknown; lastValidatedAt?: unknown },
  refreshToken: string,
): StoredMemberAuth | null {
  const email = asNonEmptyString(document.email);
  if (!email || !refreshToken) return null;
  const name = asNonEmptyString(document.name) ?? undefined;
  return {
    refreshToken,
    email,
    name,
    lastValidatedAt: Number(document.lastValidatedAt) || 0,
  };
}

async function atomicWrite(filePath: string, contents: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, contents, { encoding: 'utf8', mode: 0o600 });
  try {
    try {
      await rename(temporaryPath, filePath);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== 'EEXIST' && code !== 'EPERM') throw error;
      // Windows does not replace an existing file atomically with rename.
      // The payload is already protected; remove only after the replacement
      // exists completely in the adjacent temporary file.
      await rm(filePath, { force: true });
      await rename(temporaryPath, filePath);
    }
  } finally {
    await rm(temporaryPath, { force: true });
  }
}

export async function writeStoredMemberAuth(
  filePath: string,
  protector: MemberTokenProtector,
  stored: StoredMemberAuth | null,
): Promise<void> {
  if (!stored) {
    await rm(filePath, { force: true });
    return;
  }
  if (!protector.isEncryptionAvailable()) {
    await rm(filePath, { force: true });
    throw new Error(
      'O armazenamento seguro do sistema operacional não está disponível. ' +
      'A sessão não foi gravada; entre novamente depois de corrigir o sistema.',
    );
  }
  const document: StoredMemberAuthV2 = {
    version: 2,
    protectedRefreshToken: protector.encryptString(stored.refreshToken).toString('base64'),
    email: stored.email,
    name: stored.name,
    lastValidatedAt: stored.lastValidatedAt,
  };
  await atomicWrite(filePath, `${JSON.stringify(document, null, 2)}\n`);
}

export async function readStoredMemberAuth(
  filePath: string,
  protector: MemberTokenProtector,
): Promise<StoredMemberAuth | null> {
  let parsed: StoredMemberAuthV2 | StoredMemberAuthV1;
  try {
    parsed = JSON.parse(await readFile(filePath, 'utf8')) as StoredMemberAuthV2 | StoredMemberAuthV1;
  } catch {
    return null;
  }

  if ('version' in parsed && parsed.version === 2) {
    const protectedToken = asNonEmptyString(parsed.protectedRefreshToken);
    if (!protectedToken || !protector.isEncryptionAvailable()) return null;
    try {
      const refreshToken = protector.decryptString(Buffer.from(protectedToken, 'base64'));
      return runtimeAuth(parsed, refreshToken);
    } catch {
      return null;
    }
  }

  // MIGRATION: releases inherited from the base stored the refresh token as
  // plaintext JSON. Convert it once, before returning it to the caller. If the
  // OS cannot protect it, delete the plaintext and require a new login.
  const legacyToken = asNonEmptyString((parsed as StoredMemberAuthV1).refreshToken);
  const legacy = legacyToken ? runtimeAuth(parsed, legacyToken) : null;
  if (!legacy) return null;
  if (!protector.isEncryptionAvailable()) {
    await rm(filePath, { force: true });
    return null;
  }
  try {
    await writeStoredMemberAuth(filePath, protector, legacy);
    return legacy;
  } catch {
    await rm(filePath, { force: true });
    return null;
  }
}
