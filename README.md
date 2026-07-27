# Grid Stage Builder

Static browser tool for building tile-based maps and stage data.

## Use

Open `index.html` in a browser.

Project data is saved in browser localStorage while editing.
Use the top toolbar to export JSON backups and stage files.

## Files

- `index.html` - app shell
- `styles.css` - UI styles
- `app.js` - editor interaction and rendering
- `core.js` - map, stage, validation, and export logic
- `tests/` - Node static/core tests

## Test

```bash
npm test
```
