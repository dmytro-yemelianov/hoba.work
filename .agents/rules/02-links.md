# Superset Workspace Link Formatting Rule

When referencing files, directories, or symbols in responses and artifacts within Superset:
- ALWAYS format file links as clean, workspace-relative markdown links: `[path/to/file](path/to/file)` (e.g. `[notes/018-deepening-and-widening-the-platform.md](notes/018-deepening-and-widening-the-platform.md)` or `[spec/00-versioning.md](spec/00-versioning.md)`).
- NEVER use the `file:///` URI scheme (e.g. `file:///Users/...`) because Superset's web UI sandbox blocks local file URL navigation.
- NEVER put backticks inside or around markdown link brackets (do NOT write `[`file.md`](...)` or `` `[file.md](...)` ``). Write clean markdown links: `[path/to/file](path/to/file)` so Superset's file-opener click handler intercepts and opens the file in an editor tab.
