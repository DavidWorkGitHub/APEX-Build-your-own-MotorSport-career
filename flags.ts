/* =========================================================
   FLAGS
   Windows doesn't render regional-indicator flag emoji at all
  , Chrome and Edge show two letter boxes. So we draw them.
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


/* Broad-brush flags for the wider country list. Bands only, but they read
   as flags at 20px, which is all a driver card needs. */
const MORE: Record<string, FlagSpec> = {
  HK:{k:"disc",bg:"#DE2910",disc:W}, AF:{k:"h",c:[K,"#BE0027",G]}, AL:{k:"h",c:["#E41E20","#E41E20"]}, DZ:{k:"v",c:[G,W]},
  AD:{k:"v",c:["#10069F","#FEDD00","#D50032"]}, AO:{k:"h",c:["#CE1126",K]},
  AG:{k:"h",c:[K,"#0072C6",W]}, AM:{k:"h",c:["#D90012","#0033A0","#F2A800"]},
  AW:{k:"h",c:["#418FDE","#418FDE","#F7E017"]}, AZ:{k:"h",c:["#00B5E2","#EF3340",G]},
  BS:{k:"h",c:["#00778B","#FFC72C","#00778B"]}, BD:{k:"disc",bg:"#006A4E",disc:"#F42A41"},
  BB:{k:"v",c:["#00267F","#FFC726","#00267F"]}, BY:{k:"h",c:["#CE1720",G]},
  BZ:{k:"h",c:["#003F87","#003F87","#CE1126"]}, BJ:{k:"v",c:[G,"#FCD116","#E8112D"]},
  BM:{k:"special",id:"uk-canton"}, BT:{k:"h",c:["#FFD520","#FF4E12"]},
  BO:{k:"h",c:["#D52B1E","#F9E300",G]}, BA:{k:"h",c:["#002F6C","#002F6C","#FECB00"]},
  BW:{k:"h",c:["#6DA9D2",W,K,W,"#6DA9D2"]}, BN:{k:"h",c:["#F7E017",W,K]},
  BF:{k:"h",c:["#EF2B2D",G]}, BI:{k:"h",c:["#CE1126",W,G]}, KH:{k:"h",c:["#032EA1","#E00025","#032EA1"]},
  CM:{k:"v",c:[G,"#CE1126","#FCD116"]}, CV:{k:"h",c:["#003893",W,"#CF2027",W,"#003893"]},
  CF:{k:"h",c:["#003082",W,G,"#FFCE00"]}, TD:{k:"v",c:["#002664","#FECB00","#C60C30"]},
  KM:{k:"h",c:["#FFD100",W,"#CE1126","#3A7728"]}, CG:{k:"h",c:[G,"#FBDE4A","#DC241F"]},
  CR:{k:"h",c:["#002B7F",W,"#CE1126",W,"#002B7F"]}, CI:{k:"v",c:["#F77F00",W,G]},
  CU:{k:"h",c:["#002A8F",W,"#002A8F",W,"#002A8F"]}, CY:{k:"h",c:[W,W]},
  CD:{k:"h",c:["#007FFF","#007FFF"]}, DJ:{k:"h",c:["#6AB2E7","#12AD2B"]},
  DM:{k:"h",c:[G,G]}, DO:{k:"cross",bg:"#002D62",cross:W,x:0.5},
  EC:{k:"h",c:["#FFDD00","#0033A0","#EF3340"]}, EG:{k:"h",c:["#CE1126",W,K]},
  SV:{k:"h",c:["#0F47AF",W,"#0F47AF"]}, GQ:{k:"h",c:[G,W,"#E32118"]},
  ER:{k:"h",c:["#12AD2B","#4189DD"]}, SZ:{k:"h",c:["#3E5EB9","#FFD900","#B10C0C","#FFD900","#3E5EB9"]},
  ET:{k:"h",c:["#078930","#FCDD09","#DA121A"]}, FJ:{k:"special",id:"uk-canton"},
  GA:{k:"h",c:["#009E60","#FCD116","#3A75C4"]}, GM:{k:"h",c:["#CE1126",W,"#3A7728"]},
  GE:{k:"cross",bg:W,cross:"#FF0000",x:0.5}, GH:{k:"h",c:["#CE1126","#FCD116","#006B3F"]},
  GD:{k:"h",c:["#CE1126","#007A5E","#CE1126"]}, GT:{k:"v",c:["#4997D0",W,"#4997D0"]},
  GN:{k:"v",c:["#CE1126","#FCD116","#009460"]}, GW:{k:"h",c:["#FCD116","#009E49"]},
  GY:{k:"h",c:["#009E49","#009E49"]}, HT:{k:"h",c:["#00209F","#D21034"]},
  HN:{k:"h",c:["#0073CF",W,"#0073CF"]}, IR:{k:"h",c:["#239F40",W,"#DA0000"]},
  IQ:{k:"h",c:["#CE1126",W,K]}, JM:{k:"h",c:["#009B3A","#009B3A"]},
  JO:{k:"h",c:[K,W,"#007A3D"]}, KE:{k:"h",c:[K,"#BB0000",G]},
  KI:{k:"h",c:["#CE1126","#003F87"]}, KW:{k:"h",c:[G,W,"#CE1126"]},
  KG:{k:"disc",bg:"#E8112D",disc:"#FFEF00"}, LA:{k:"h",c:["#CE1126","#002868","#CE1126"]},
  LB:{k:"h",c:["#ED1C24",W,"#ED1C24"]}, LS:{k:"h",c:["#00209F",W,"#009543"]},
  LR:{k:"h",c:["#BF0A30",W,"#BF0A30",W,"#BF0A30"]}, LY:{k:"h",c:["#E70013",K,G]},
  LI:{k:"h",c:["#002B7F","#CE1126"]}, MK:{k:"disc",bg:"#D20000",disc:"#FFE600"},
  MG:{k:"v",c:[W,"#FC3D32","#007E3A"]}, MW:{k:"h",c:[K,"#CE1126",G]},
  MV:{k:"disc",bg:"#D21034",disc:"#007E3A"}, ML:{k:"v",c:["#14B53A","#FCD116","#CE1126"]},
  MT:{k:"v",c:[W,"#CF142B"]}, MR:{k:"h",c:[G,G]}, MU:{k:"h",c:["#EA2839","#1A206D","#FFD500","#00A551"]},
  MD:{k:"v",c:["#0046AE","#FFD200","#CC092F"]}, MN:{k:"v",c:["#C4272F","#015197","#C4272F"]},
  ME:{k:"h",c:["#C40308","#C40308"]}, MZ:{k:"h",c:["#009A00",W,K]},
  MM:{k:"h",c:["#FECB00","#34B233","#EA2839"]}, NA:{k:"h",c:["#003580","#D21034","#009543"]},
  NP:{k:"h",c:["#DC143C","#DC143C"]}, NI:{k:"h",c:["#0067C6",W,"#0067C6"]},
  NE:{k:"disc",bg:W,disc:"#E05206"}, KP:{k:"h",c:["#024FA2",W,"#ED1C27",W,"#024FA2"]},
  OM:{k:"h",c:[W,"#DB161B",G]}, PK:{k:"v",c:[W,"#01411C"]}, PS:{k:"h",c:[K,W,G]},
  PA:{k:"h",c:[W,"#DA121A"]}, PG:{k:"h",c:["#CE1126",K]}, PR:{k:"h",c:["#ED0000",W,"#ED0000",W,"#ED0000"]},
  RW:{k:"h",c:["#00A1DE","#FAD201","#20603D"]}, KN:{k:"h",c:[G,K,"#C8102E"]},
  LC:{k:"disc",bg:"#6CCFF6",disc:K}, VC:{k:"v",c:["#0072C6","#FCD116",G]},
  WS:{k:"h",c:["#CE1126","#CE1126"]}, SM:{k:"h",c:[W,"#5EB6E4"]},
  ST:{k:"h",c:["#12AD2B","#FFCE00","#12AD2B"]}, SN:{k:"v",c:["#00853F","#FDEF42","#E31B23"]},
  SC:{k:"h",c:["#003F87","#FCD856","#D62828"]}, SL:{k:"h",c:["#1EB53A",W,"#0072C6"]},
  SB:{k:"h",c:["#0051BA","#215B33"]}, SO:{k:"disc",bg:"#4189DD",disc:W},
  SS:{k:"h",c:[K,"#DA121A","#078930"]}, LK:{k:"h",c:["#8D2029","#8D2029"]},
  SD:{k:"h",c:["#D21034",W,K]}, SR:{k:"h",c:[G,W,"#B40A2D",W,G]},
  SY:{k:"h",c:["#CE1126",W,K]}, TW:{k:"h",c:["#FE0000","#FE0000"]},
  TJ:{k:"h",c:["#CC0000",W,"#006600"]}, TZ:{k:"h",c:["#1EB53A","#FCD116","#00A3DD"]},
  TL:{k:"h",c:["#DC241F","#DC241F"]}, TG:{k:"h",c:[G,"#FFCE00",G,"#FFCE00",G]},
  TO:{k:"h",c:["#C10000","#C10000"]}, TT:{k:"h",c:["#CE1126","#CE1126"]},
  TN:{k:"disc",bg:"#E70013",disc:W}, TM:{k:"h",c:["#00843D","#00843D"]},
  UG:{k:"h",c:[K,"#FCDC04","#D90000",K,"#FCDC04"]}, UZ:{k:"h",c:["#0099B5",W,"#1EB53A"]},
  VU:{k:"h",c:["#D21034",G]}, VA:{k:"v",c:["#FFE000",W]},
  YE:{k:"h",c:["#CE1126",W,K]}, ZM:{k:"h",c:["#198A00","#198A00"]},
  ZW:{k:"h",c:["#319208","#FFD200","#DE2010",K,"#319208"]},
};
Object.assign(FLAGS, MORE);

/* Real flags come from flagcdn.com: free, no key, 254 flags, SVG, on Cloudflare.
   The drawn versions below stay as the fallback, so the game still works with no
   internet and nothing ever renders as a blank box. */
const FLAG_CDN = "https://flagcdn.com";
let cdnFlags = true;

/** Real artwork where we can get it, drawn bands where we cannot. */
function flagSvg(code: string, w = 20): string {
  const h = Math.round(w * 0.7);
  if (cdnFlags && code) {
    const lower = code.toLowerCase();
    // the drawn version is the fallback, swapped in if the image fails to load
    return `<img class="flag flag--img" width="${w}" height="${h}" loading="lazy" decoding="async"
      src="${FLAG_CDN}/${lower}.svg" alt=""
      onerror="this.outerHTML=drawnFlag('${code}',${w})">`;
  }
  return drawnFlag(code, w);
}

/** Renders a flag as inline SVG. Same everywhere, no font dependency. */
function drawnFlag(code: string, w = 20): string {
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
