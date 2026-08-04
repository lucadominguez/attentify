// Bring-your-own-key is removed; this module only cleans up after it.
//
// Older builds let the user paste a provider key and stored it at
// `<userData>/.apikey`, encrypted with Electron safeStorage where available and in
// plain text where it was not. Nothing reads that file any more, so all that is left
// on those machines is a stale provider secret.
//
// This deletes the file outright. The old delete path truncated it to zero bytes,
// which leaves the path behind and, in the plain-text fallback case, is not obviously
// a wipe to anyone auditing the directory.

import { app } from 'electron'
import { join } from 'path'
import { existsSync, rmSync } from 'fs'

const KEY_FILE = (): string => join(app.getPath('userData'), '.apikey')

/** Remove any provider key left behind by a build that supported pasting one. */
export function purgeLegacyApiKey(): void {
  try {
    const path = KEY_FILE()
    if (existsSync(path)) rmSync(path, { force: true })
  } catch {
    // Best effort. A stale file is harmless; throwing on launch is not.
  }
}
