import { readFile, writeFile, readdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Where /admin reads and saves content.
 *
 * Live site: the GitHub repository, through its contents API, using a
 * fine-grained token limited to this one repo (ADMIN_GITHUB_TOKEN on Vercel).
 * Every save is a commit, so Vercel redeploys and every change sits in the
 * history where it can be undone.
 *
 * On this machine without a token: the files on disk, so the admin can be
 * tried locally without touching the live site.
 */
const env = (k: string) => (import.meta.env[k] as string | undefined) ?? process.env[k];
const REPO = env('ADMIN_GITHUB_REPO') ?? 'robertvanliew/deejaytjr';
const BRANCH = env('ADMIN_GITHUB_BRANCH') ?? 'main';
const TOKEN = () => env('ADMIN_GITHUB_TOKEN');

export const storeMode = () => (TOKEN() ? 'github' : import.meta.env.DEV ? 'local' : 'none');

export interface StoredFile {
  path: string;
  text: string;
  /** GitHub blob sha; guards against two people saving over each other. */
  sha?: string;
}

export class ConflictError extends Error {}

async function gh(path: string, init: RequestInit = {}) {
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN()}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'deejaytjr-admin',
      ...(init.headers ?? {}),
    },
  });
  if (res.status === 409 || res.status === 422) throw new ConflictError('Changed elsewhere');
  if (!res.ok && res.status !== 404) throw new Error(`GitHub ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res;
}

const root = process.cwd();

export async function getFile(path: string): Promise<StoredFile | null> {
  if (storeMode() === 'github') {
    const res = await gh(`${path}?ref=${BRANCH}`, { cache: 'no-store' });
    if (res.status === 404) return null;
    const j = (await res.json()) as { content: string; sha: string };
    return { path, text: Buffer.from(j.content, 'base64').toString('utf8'), sha: j.sha };
  }
  if (storeMode() === 'local') {
    try {
      return { path, text: await readFile(join(root, path), 'utf8') };
    } catch {
      return null;
    }
  }
  throw new Error('The admin is not connected to the repository yet.');
}

export async function listDir(dir: string): Promise<string[]> {
  if (storeMode() === 'github') {
    const res = await gh(`${dir}?ref=${BRANCH}`, { cache: 'no-store' });
    if (res.status === 404) return [];
    const j = (await res.json()) as { name: string; type: string }[];
    return j.filter((f) => f.type === 'file').map((f) => f.name);
  }
  if (storeMode() === 'local') return readdir(join(root, dir));
  throw new Error('The admin is not connected to the repository yet.');
}

export async function putFile(path: string, text: string, sha: string | undefined, message: string) {
  if (storeMode() === 'github') {
    await gh(path, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: Buffer.from(text, 'utf8').toString('base64'),
        branch: BRANCH,
        ...(sha ? { sha } : {}),
        committer: { name: 'DEEJAY T-JR. site editor', email: 'mgmt@deejaytjr.com' },
      }),
    });
    return;
  }
  if (storeMode() === 'local') return writeFile(join(root, path), text, 'utf8');
  throw new Error('The admin is not connected to the repository yet.');
}

export async function deleteFile(path: string, sha: string | undefined, message: string) {
  if (storeMode() === 'github') {
    await gh(path, {
      method: 'DELETE',
      body: JSON.stringify({ message, sha, branch: BRANCH, committer: { name: 'DEEJAY T-JR. site editor', email: 'mgmt@deejaytjr.com' } }),
    });
    return;
  }
  if (storeMode() === 'local') return unlink(join(root, path));
  throw new Error('The admin is not connected to the repository yet.');
}

/** JSON as the repo already formats it: two-space indent, trailing newline. */
export const toJson = (v: unknown) => JSON.stringify(v, null, 2) + '\n';
