// Bundles index.html + app.js + hero.jpg into one standalone file.
// NOTE: replacement must be a FUNCTION — a plain string would let $$ / $& be
// interpreted as replacement patterns and silently corrupt the code.
const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");
const js = fs.readFileSync("app.js", "utf8");
const img = fs.readFileSync("hero.jpg").toString("base64");

const out = html
  .replace('src="hero.jpg"', () => `src="data:image/jpeg;base64,${img}"`)
  .replace('<script src="app.js"></script>', () => `<script>\n${js}\n</script>`);

fs.writeFileSync("/mnt/user-data/outputs/swami-formula.html", out);

// sanity check: the bundle must not lose any $$ helpers
const a = (js.match(/\$\$/g) || []).length;
const b = (out.match(/\$\$/g) || []).length;
console.log(`$$ in app.js: ${a}, in bundle: ${b} — ${a === b ? "OK" : "CORRUPTED"}`);
