# material-design
Material Design theme for Saltcorn based on mdbootstrap

## Rebuilding `mdb.min.js` from mdb-ui-kit

`public/js/mdb.min.js` is generated from [mdb-ui-kit](https://github.com/mdbootstrap/mdb-ui-kit) with MDB-specific attribute and class name prefixes patched from `mdb-` to `bs-` to stay consistent with Bootstrap naming used in this plugin.

### Steps

**1. Fork mdb-ui-kit**

Go to [https://github.com/mdbootstrap/mdb-ui-kit/tree/master](https://github.com/mdbootstrap/mdb-ui-kit/tree/master) and fork the repo to your GitHub account.

**2. Clone your fork**

```bash
git clone https://github.com/<your-username>/mdb-ui-kit.git
cd mdb-ui-kit
```

**3. (Optional) Patch the source files**

Replace `data-mdb-` with `data-bs-` across all JS source files:

```bash
find src -type f -name "*.js" -exec sed -i '' 's/data-mdb-/data-bs-/g' {} +
```

This keeps the fork's source consistent with the built output — only needed if you plan to rebuild the bundle from webpack source in the future.

**4. Add the build script to `package.json`**

In `mdb-ui-kit/package.json`, add this under `"scripts"`:

```json
"build": "sed 's/data-mdb-/data-bs-/g' js/mdb.umd.min.js | sed 's/startsWith(\"mdb\")/startsWith(\"bs\")/g' | sed 's/\\.replace(\\/\\^mdb\\/,\"\")/.replace(\\/\\^bs\\/,\"\")/g' > js/mdb.bs.umd.min.js"
```

This chains three replacements on `js/mdb.umd.min.js` (the pre-built bundle that ships with the repo) and writes the patched result to `js/mdb.bs.umd.min.js`:

| Original | Replaced with |
|---|---|
| `data-mdb-` | `data-bs-` |
| `startsWith("mdb")` | `startsWith("bs")` |
| `.replace(/^mdb/,"")` | `.replace(/^bs/,"")` |

**5. Run the build**

```bash
npm run build
```

**6. Copy `js/mdb.bs.umd.min.js` into this plugin as `public/js/mdb.min.js`**

Verify no `mdb-` attribute names leaked through:

```bash
grep 'data-mdb-' public/js/mdb.min.js  # should print nothing
```

> Current bundle: MDB5 FREE **9.3.0**

