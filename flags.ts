/* =========================================================
   FLAGS
   Windows doesn't render regional-indicator flag emoji at all
   — Chrome and Edge show two letter boxes. So we draw them.
   Every flag here is built from bands plus a handful of
   special cases, which keeps it offline and dependency-free.
   ========================================================= */

type FlagSpec =
  | { k: "v"; c: string[] }                          // vertical bands
  | { k: "h"; c: string[] }                          // horizontal bands
  | { k: "hv"; c: string[]; v: string[] }            // horizontal + vertical overlay
  | { k: "disc"; bg: string; disc: string }          // field with a centred disc
  | { k: "cross"; bg: string; cross: string; x?: number }
  | { k: "special"; id: string };

const R = "#D8262C", W = "#F5F3EE", B = "#0B2A6B", G = "#0E7A3C", Y = "#FFCE00", K = "#14161A", LB = "#4FA8E0";

const FLAGS: Record<string, FlagSpec> = {
  AR: { k: "h", c: [LB, W, LB] },        AU: { k: "special", id: "uk-canton" },
  AT: { k: "h", c: [R, W, R] },          BH: { k: "special", id: "bh" },
  BE: { k: "v", c: [K, "#FAE042", R] },  BR: { k: "special", id: "br" },
  BG: { k: "h", c: [W, G, R] },          CA: { k: "v", c: [R, W, R] },
  CL: { k: "special", id: "cl" },        CN: { k: "h", c: ["#DE2910", "#DE2910"] },
  CO: { k: "h", c: ["#FCD116", B, R] },  HR: { k: "h", c: [R, W, B] },
  CZ: { k: "special", id: "cz" },        DK: { k: "cross", bg: "#C8102E", cross: W, x: 0.38 },
  EE: { k: "h", c: ["#0072CE", K, W] },  FI: { k: "cross", bg: W, cross: "#003580", x: 0.38 },
  FR: { k: "v", c: ["#0055A4", W, "#EF4135"] },
  DE: { k: "h", c: [K, "#DD0000", "#FFCE00"] },
  GR: { k: "h", c: ["#0D5EAF", W, "#0D5EAF", W, "#0D5EAF"] },
  HU: { k: "h", c: [R, W, G] },          IS: { k: "cross", bg: "#02529C", cross: W, x: 0.38 },
  IN: { k: "h", c: ["#FF9933", W, "#138808"] },
  ID: { k: "h", c: [R, W] },             IE: { k: "v", c: [G, W, "#FF883E"] },
  IL: { k: "h", c: [W, "#0038B8", W, "#0038B8", W] },
  IT: { k: "v", c: ["#008C45", W, "#CD212A"] },
  JP: { k: "disc", bg: W, disc: "#BC002D" },
  KZ: { k: "disc", bg: "#00AFCA", disc: "#FEC50C" },
  LV: { k: "h", c: ["#9E3039", W, "#9E3039"] },
  LT: { k: "h", c: ["#FDB913", G, "#C1272D"] },
  LU: { k: "h", c: [R, W, "#00A1DE"] },  MY: { k: "h", c: [R, W, R, W, B] },
  MX: { k: "v", c: [G, W, R] },          MC: { k: "h", c: [R, W] },
  MA: { k: "disc", bg: "#C1272D", disc: "#006233" },
  NL: { k: "h", c: ["#AE1C28", W, "#21468B"] },
  NZ: { k: "special", id: "uk-canton" }, NG: { k: "v", c: [G, W, G] },
  NO: { k: "cross", bg: "#BA0C2F", cross: W, x: 0.38 },
  PY: { k: "h", c: [R, W, B] },          PE: { k: "v", c: [R, W, R] },
  PH: { k: "h", c: ["#0038A8", R] },     PL: { k: "h", c: [W, "#DC143C"] },
  PT: { k: "special", id: "pt" },        QA: { k: "v", c: [W, "#8A1538"] },
  RO: { k: "v", c: ["#002B7F", "#FCD116", "#CE1126"] },
  SA: { k: "h", c: ["#006C35", "#006C35"] },
  RS: { k: "h", c: ["#C6363C", "#0C4076", W] },
  SG: { k: "h", c: [R, W] },             SK: { k: "h", c: [W, "#0B4EA2", "#EE1C25"] },
  SI: { k: "h", c: [W, "#005DA4", "#ED1C24"] },
  ZA: { k: "special", id: "za" },        KR: { k: "disc", bg: W, disc: "#CD2E3A" },
  ES: { k: "h", c: ["#AA151B", "#F1BF00", "#AA151B"] },
  SE: { k: "cross", bg: "#004B87", cross: "#FECC02", x: 0.38 },
  CH: { k: "special", id: "ch" },        TH: { k: "h", c: [R, W, B, W, R] },
  TR: { k: "disc", bg: "#E30A17", disc: W },
  UA: { k: "h", c: ["#0057B7", "#FFD700"] },
  AE: { k: "special", id: "ae" },        GB: { k: "special", id: "gb" },
  US: { k: "special", id: "us" },        UY: { k: "h", c: [W, LB, W, LB, W] },
  VE: { k: "h", c: ["#FFCC00", "#00247D", "#CF142B"] },
  VN: { k: "disc", bg: "#DA251D", disc: "#FFFF00" },
};

/** Renders a flag as inline SVG. Same everywhere, no font dependency. */
function flagSvg(code: string, w = 20): string {
  const h = Math.round(w * 0.7);
  const f = FLAGS[code];
  const open = `<svg class="flag" viewBox="0 0 30 21" width="${w}" height="${h}" aria-hidden="true">`;
  const frame = `<rect x="0" y="0" width="30" height="21" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="1"/></svg>`;
  if (!f) return `${open}<rect width="30" height="21" fill="#2E3742"/>${frame}`;

  const bands = (cols: string[], vertical: boolean): string =>
    cols.map((c, i) => vertical
      ? `<rect x="${(30 / cols.length) * i}" y="0" width="${30 / cols.length + 0.5}" height="21" fill="${c}"/>`
      : `<rect x="0" y="${(21 / cols.length) * i}" width="30" height="${21 / cols.length + 0.5}" fill="${c}"/>`
    ).join("");

  let body = "";
  switch (f.k) {
    case "v": body = bands(f.c, true); break;
    case "h": body = bands(f.c, false); break;
    case "hv": body = bands(f.c, false) + bands(f.v, true); break;
    case "disc": body = `<rect width="30" height="21" fill="${f.bg}"/><circle cx="15" cy="10.5" r="5.4" fill="${f.disc}"/>`; break;
    case "cross": {
      const cx = 30 * (f.x ?? 0.4);
      body = `<rect width="30" height="21" fill="${f.bg}"/>
        <rect x="0" y="8.4" width="30" height="4.2" fill="${f.cross}"/>
        <rect x="${cx - 2.1}" y="0" width="4.2" height="21" fill="${f.cross}"/>`;
      break;
    }
    case "special": body = specialFlag(f.id); break;
  }
  return open + body + frame;
}

function specialFlag(id: string): string {
  switch (id) {
    case "gb":
      return `<rect width="30" height="21" fill="#012169"/>
        <path d="M0 0L30 21M30 0L0 21" stroke="${W}" stroke-width="4"/>
        <path d="M0 0L30 21M30 0L0 21" stroke="#C8102E" stroke-width="2"/>
        <path d="M15 0V21M0 10.5H30" stroke="${W}" stroke-width="6.5"/>
        <path d="M15 0V21M0 10.5H30" stroke="#C8102E" stroke-width="3.8"/>`;
    case "uk-canton":
      return `<rect width="30" height="21" fill="#012169"/>
        <g transform="scale(.5)"><path d="M0 0L30 21M30 0L0 21" stroke="${W}" stroke-width="4"/>
        <path d="M15 0V21M0 10.5H30" stroke="${W}" stroke-width="6"/>
        <path d="M15 0V21M0 10.5H30" stroke="#C8102E" stroke-width="3.4"/></g>
        <circle cx="22" cy="14" r="1.5" fill="${W}"/><circle cx="24.5" cy="7" r="1.2" fill="${W}"/>`;
    case "us": {
      const stripes = Array.from({ length: 7 }, (_, i) =>
        `<rect x="0" y="${i * 3}" width="30" height="1.6" fill="#B22234"/>`).join("");
      return `<rect width="30" height="21" fill="${W}"/>${stripes}<rect width="13" height="11" fill="#3C3B6E"/>`;
    }
    case "br":
      return `<rect width="30" height="21" fill="#009C3B"/>
        <path d="M15 2.6L27.4 10.5L15 18.4L2.6 10.5Z" fill="#FFDF00"/>
        <circle cx="15" cy="10.5" r="4.4" fill="#002776"/>`;
    case "pt":
      return `<rect width="30" height="21" fill="#FF0000"/><rect width="12" height="21" fill="#006600"/>
        <circle cx="12" cy="10.5" r="4" fill="#FFD700"/><circle cx="12" cy="10.5" r="2.4" fill="#FF0000"/>`;
    case "ch":
      return `<rect width="30" height="21" fill="#FF0000"/>
        <rect x="13" y="4.5" width="4" height="12" fill="${W}"/><rect x="9" y="8.5" width="12" height="4" fill="${W}"/>`;
    case "za":
      return `<rect width="30" height="21" fill="#002395"/><rect width="30" height="10.5" fill="#DE3831"/>
        <path d="M0 0L12 10.5L0 21Z" fill="#007A4D"/><path d="M0 3L9 10.5L0 18Z" fill="${K}"/>
        <rect x="0" y="8.4" width="30" height="4.2" fill="#FFB612"/>
        <path d="M0 8.4L11 8.4L2 10.5L11 12.6L0 12.6Z" fill="#007A4D"/>`;
    case "ae":
      return `<rect width="30" height="21" fill="${W}"/><rect y="0" width="30" height="7" fill="#00732F"/>
        <rect y="14" width="30" height="7" fill="${K}"/><rect width="7.5" height="21" fill="#FF0000"/>`;
    case "cl":
      return `<rect width="30" height="21" fill="${W}"/><rect y="10.5" width="30" height="10.5" fill="#D52B1E"/>
        <rect width="11" height="10.5" fill="#0039A6"/>
        <path d="M5.5 2.6l1 3h3.2l-2.6 1.9 1 3-2.6-1.9-2.6 1.9 1-3-2.6-1.9h3.2z" fill="${W}"/>`;
    case "cz":
      return `<rect width="30" height="21" fill="${W}"/><rect y="10.5" width="30" height="10.5" fill="#D7141A"/>
        <path d="M0 0L14 10.5L0 21Z" fill="#11457E"/>`;
    case "bh":
      return `<rect width="30" height="21" fill="#CE1126"/>
        <path d="M0 0H9L13 2.6L9 5.25L13 7.9L9 10.5L13 13.1L9 15.75L13 18.4L9 21H0Z" fill="${W}"/>`;
    default:
      return `<rect width="30" height="21" fill="#2E3742"/>`;
  }
}
