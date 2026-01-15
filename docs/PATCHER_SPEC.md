# AutoPatcher Specification

## 1. PatchList Format

The patchlist uses a simple line-based format. Comments start with `//` or `#`.
Empty lines are ignored.

### Format

```text
ID FILENAME [OPTIONS...]
```

### Fields

| Field | Description | Mandatory | Example |
|---|---|---|---|
| `ID` | Sequential patch ID (integer) | Yes | `1` |
| `FILENAME` | Name of the patch file | Yes | `update.thor` |
| `target=` | Target GRF file (def: `data.grf`) | No | `target=event.grf` |
| `extract=` | Force extract to disk (`true`/`false`) | No | `extract=true` |
| `hash=` | SHA256 hash for verification | No | `hash=a1b2...` |
| `size=` | Expected file size in bytes | No | `size=1024` |

### Example

```text
// Base Data
1 base.grf size=500000000

// Updates
2 update_01.thor
3 update_02.thor

// Events (goes to event.grf)
4 event_xmas.thor target=event.grf

// Hotfix (extracts to disk)
5 hotfix.rgz extract=true
```

## 2. Local Cache (autopatcher.dat)

The local cache tracks the state of the client to avoid redownloading patches.
It is a JSON file stored in the same directory as the executable.

### Structure

```json
{
  "lastPatchId": 5,
  "installedPatches": [1, 2, 3, 4, 5],
  "grfVersions": {
    "data.grf": "2024-01-01T00:00:00Z"
  },
  "lastCheck": "2024-01-15T12:00:00Z"
}
```
