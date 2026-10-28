// src/cookieRenderer.ts
// Procedural Overhead Studio Cookie Renderer (Generates crisp overhead renders & 4K .jpg downloads)

export interface CookieRenderRecipe {
  id: string;
  bgHex: string;
  doughBase: string;
  doughShadow: string;
  doughHighlight: string;
  fissureColor: string;
  type:
    | "strawberry"
    | "lemon"
    | "snickerdoodle"
    | "double-chocolate-chip"
    | "salted-caramel"
    | "cinnamon-roll"
    | "oatmeal-raisin"
    | "banana-pudding";
}

export const REMAINING_8_RECIPES: Record<string, CookieRenderRecipe> = {
  strawberry: {
    id: "strawberry",
    bgHex: "#FAD2D8",
    doughBase: "#E87A90",
    doughShadow: "#B84A62",
    doughHighlight: "#F7A8B8",
    fissureColor: "#8F243C",
    type: "strawberry",
  },
  lemon: {
    id: "lemon",
    bgHex: "#FCF5C7",
    doughBase: "#F4DC68",
    doughShadow: "#C9AD32",
    doughHighlight: "#FFF19E",
    fissureColor: "#9E8218",
    type: "lemon",
  },
  snickerdoodle: {
    id: "snickerdoodle",
    bgHex: "#F7E3D0",
    doughBase: "#DFAD76",
    doughShadow: "#AD7640",
    doughHighlight: "#F2CBA0",
    fissureColor: "#78471A",
    type: "snickerdoodle",
  },
  "double-chocolate-chip": {
    id: "double-chocolate-chip",
    bgHex: "#E5D6CE",
    doughBase: "#3D231A",
    doughShadow: "#22110B",
    doughHighlight: "#59372B",
    fissureColor: "#140905",
    type: "double-chocolate-chip",
  },
  "salted-caramel": {
    id: "salted-caramel",
    bgHex: "#FBE2C6",
    doughBase: "#C98B52",
    doughShadow: "#8F5928",
    doughHighlight: "#E3AD7B",
    fissureColor: "#5C3411",
    type: "salted-caramel",
  },
  "cinnamon-roll": {
    id: "cinnamon-roll",
    bgHex: "#F5DFD3",
    doughBase: "#D69E6B",
    doughShadow: "#9E6838",
    doughHighlight: "#ECC095",
    fissureColor: "#633612",
    type: "cinnamon-roll",
  },
  "oatmeal-raisin": {
    id: "oatmeal-raisin",
    bgHex: "#E9E4D4",
    doughBase: "#B8804C",
    doughShadow: "#825328",
    doughHighlight: "#D4A172",
    fissureColor: "#4F2E11",
    type: "oatmeal-raisin",
  },
  "banana-pudding": {
    id: "banana-pudding",
    bgHex: "#FCF0CC",
    doughBase: "#E5BC68",
    doughShadow: "#B08636",
    doughHighlight: "#F7D994",
    fissureColor: "#7D5A18",
    type: "banana-pudding",
  },
};

const renderCache: Record<string, string> = {};

// Deterministic PRNG so every cookie flavor has consistent organic crinkles & toppings
function createSeededRandom(seedStr: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  }
  return function () {
    h += h << 13;
    h ^= h >>> 7;
    h += h << 3;
    h ^= h >>> 17;
    return ((h >>> 0) % 100000) / 100000;
  };
}

export function renderCookieToDataUrl(
  cookieId: string,
  size: number = 1024
): string | null {
  const recipe = REMAINING_8_RECIPES[cookieId];
  if (!recipe) return null;

  const cacheKey = `${cookieId}_${size}`;
  if (renderCache[cacheKey]) {
    return renderCache[cacheKey];
  }

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const rand = createSeededRandom(cookieId);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.33;

  // 1. Pastel Studio Backdrop with Subtle Radial Vignette
  ctx.fillStyle = recipe.bgHex;
  ctx.fillRect(0, 0, size, size);

  const bgGrad = ctx.createRadialGradient(
    cx - size * 0.1,
    cy - size * 0.1,
    size * 0.05,
    cx,
    cy,
    size * 0.7
  );
  bgGrad.addColorStop(0, "rgba(255,255,255,0.22)");
  bgGrad.addColorStop(1, "rgba(0,0,0,0.05)");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // 2. Soft Overhead Studio Drop Shadow (Bottom-Right)
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx + size * 0.018, cy + size * 0.024, radius * 1.01, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(35, 20, 15, 0.22)";
  ctx.filter = `blur(${Math.round(size * 0.028)}px)`;
  ctx.fill();
  ctx.restore();

  // Build Organic Scalloped Cookie Perimeter Path
  const points = 90;
  const perimeter: { x: number; y: number }[] = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const wave1 = Math.sin(angle * 7 + rand() * 1.8) * (size * 0.012);
    const wave2 = Math.cos(angle * 13 + rand() * 2.2) * (size * 0.007);
    const r = radius + wave1 + wave2;
    perimeter.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    });
  }

  const traceCookieOutline = () => {
    ctx.beginPath();
    perimeter.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
  };

  // 3. Base Baked Cookie Dough with 3D Studio Lighting
  ctx.save();
  traceCookieOutline();
  ctx.clip();

  const doughGrad = ctx.createRadialGradient(
    cx - radius * 0.28,
    cy - radius * 0.28,
    radius * 0.08,
    cx,
    cy,
    radius * 1.08
  );
  doughGrad.addColorStop(0, recipe.doughHighlight);
  doughGrad.addColorStop(0.65, recipe.doughBase);
  doughGrad.addColorStop(1, recipe.doughShadow);
  ctx.fillStyle = doughGrad;
  ctx.fillRect(0, 0, size, size);

  // 4. Baked Dough Mounds & Crumbly Surface Texture
  for (let i = 0; i < 420; i++) {
    const a = rand() * Math.PI * 2;
    const dist = Math.sqrt(rand()) * radius * 0.95;
    const bx = cx + Math.cos(a) * dist;
    const by = cy + Math.sin(a) * dist;
    const br = (0.012 + rand() * 0.035) * size;

    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fillStyle =
      rand() > 0.48
        ? `${recipe.doughHighlight}44`
        : `${recipe.doughShadow}4D`;
    ctx.fill();
  }

  // 5. Deep Oven Crinkles & Fissures
  ctx.strokeStyle = recipe.fissureColor;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let c = 0; c < 22; c++) {
    const startAngle = rand() * Math.PI * 2;
    const startR = (0.1 + rand() * 0.65) * radius;
    let px = cx + Math.cos(startAngle) * startR;
    let py = cy + Math.sin(startAngle) * startR;

    ctx.beginPath();
    ctx.moveTo(px, py);
    const segments = 4 + Math.floor(rand() * 5);
    for (let s = 0; s < segments; s++) {
      px += (rand() - 0.5) * size * 0.055;
      py += (rand() - 0.5) * size * 0.055;
      ctx.lineTo(px, py);
    }
    ctx.lineWidth = (0.003 + rand() * 0.006) * size;
    ctx.globalAlpha = 0.42 + rand() * 0.35;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // 6. FLAVOR-SPECIFIC TOPPINGS, GLAZES, CHUNKS & CORES
  if (recipe.type === "strawberry") {
    // Jammy strawberry reduction swirls + white chocolate chunks + shortbread crumble
    for (let i = 0; i < 18; i++) {
      const a = rand() * Math.PI * 2;
      const d = rand() * radius * 0.78;
      const sx = cx + Math.cos(a) * d;
      const sy = cy + Math.sin(a) * d;
      ctx.beginPath();
      ctx.arc(sx, sy, size * (0.018 + rand() * 0.022), 0, Math.PI * 2);
      ctx.fillStyle = "#B01B38";
      ctx.fill();
    }
    // White chocolate chunks
    drawChunks(ctx, rand, cx, cy, radius, size, 16, "#FFF8EB", "#E3D4B9");
    // Golden shortbread crumble clusters
    drawChunks(ctx, rand, cx, cy, radius, size, 20, "#F2CFA0", "#C99B62");
  }

  if (recipe.type === "lemon") {
    // Zesty lemon flecks
    for (let i = 0; i < 95; i++) {
      const a = rand() * Math.PI * 2;
      const d = rand() * radius * 0.88;
      ctx.fillStyle = rand() > 0.5 ? "#D9A404" : "#FFF9D2";
      ctx.fillRect(
        cx + Math.cos(a) * d,
        cy + Math.sin(a) * d,
        size * 0.006,
        size * 0.003
      );
    }
    // Glossy Meyer Lemon Curd Center Pool & Drizzle
    drawGlossyDrizzle(ctx, cx, cy, radius, size, "#FFF6B3", "#F5D742");
  }

  if (recipe.type === "snickerdoodle") {
    // Heavy Ceylon Cinnamon-Sugar Crystal Dusting & Warm Cinnamon Ridges
    for (let i = 0; i < 900; i++) {
      const a = rand() * Math.PI * 2;
      const d = Math.sqrt(rand()) * radius * 0.95;
      const x = cx + Math.cos(a) * d;
      const y = cy + Math.sin(a) * d;
      ctx.fillStyle =
        rand() > 0.45 ? "rgba(255,250,240,0.75)" : "rgba(138,72,22,0.55)";
      ctx.fillRect(x, y, size * 0.0035, size * 0.0035);
    }
  }

  if (recipe.type === "double-chocolate-chip") {
    // Glossy Melted Dark & Milk Chocolate Puddles
    drawMeltedPuddles(ctx, rand, cx, cy, radius, size, 18, "#1F0F0A", "#4A2A1E");
    drawChunks(ctx, rand, cx, cy, radius, size, 14, "#3B1E14", "#63392A");
  }

  if (recipe.type === "salted-caramel") {
    // Molten Golden-Amber Caramel Core Pool
    const coreGrad = ctx.createRadialGradient(
      cx - size * 0.02,
      cy - size * 0.02,
      size * 0.01,
      cx,
      cy,
      radius * 0.48
    );
    coreGrad.addColorStop(0, "#F5A638");
    coreGrad.addColorStop(0.7, "#C46B14");
    coreGrad.addColorStop(1, "#7A3B06");

    ctx.beginPath();
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      const r = radius * (0.38 + Math.sin(a * 5) * 0.05);
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = coreGrad;
    ctx.fill();

    // Glossy Specular Highlight on Caramel Pool
    ctx.beginPath();
    ctx.ellipse(
      cx - radius * 0.12,
      cy - radius * 0.12,
      radius * 0.14,
      radius * 0.06,
      -0.5,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fill();

    // Flaky Maldon Sea Salt Crystals
    for (let s = 0; s < 38; s++) {
      const a = rand() * Math.PI * 2;
      const d = rand() * radius * 0.6;
      ctx.save();
      ctx.translate(cx + Math.cos(a) * d, cy + Math.sin(a) * d);
      ctx.rotate(rand() * Math.PI);
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fillRect(-size * 0.005, -size * 0.005, size * 0.01, size * 0.008);
      ctx.restore();
    }
  }

  if (recipe.type === "cinnamon-roll") {
    // Brown Sugar Cinnamon Swirl Ribbon
    ctx.beginPath();
    for (let t = 0; t < Math.PI * 5.5; t += 0.08) {
      const r = (t / (Math.PI * 6)) * radius * 0.85;
      const x = cx + Math.cos(t) * r;
      const y = cy + Math.sin(t) * r;
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#6E3512";
    ctx.lineWidth = size * 0.022;
    ctx.lineCap = "round";
    ctx.stroke();

    // Warm Cream Cheese Icing Swirl on Top
    ctx.beginPath();
    for (let t = 0; t < Math.PI * 4.8; t += 0.08) {
      const r = (t / (Math.PI * 5.5)) * radius * 0.72;
      const x = cx + Math.cos(t + 0.5) * r;
      const y = cy + Math.sin(t + 0.5) * r;
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#FFFDF9";
    ctx.lineWidth = size * 0.026;
    ctx.shadowColor = "rgba(0,0,0,0.15)";
    ctx.shadowBlur = size * 0.008;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  if (recipe.type === "oatmeal-raisin") {
    // Rolled Oat Flakes
    for (let o = 0; o < 130; o++) {
      const a = rand() * Math.PI * 2;
      const d = Math.sqrt(rand()) * radius * 0.88;
      ctx.save();
      ctx.translate(cx + Math.cos(a) * d, cy + Math.sin(a) * d);
      ctx.rotate(rand() * Math.PI);
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.014, size * 0.007, 0, 0, Math.PI * 2);
      ctx.fillStyle = rand() > 0.5 ? "#F0D5B4" : "#DDB68B";
      ctx.fill();
      ctx.restore();
    }
    // Plump Sun-Ripened Dark Raisins
    drawMeltedPuddles(ctx, rand, cx, cy, radius, size, 19, "#2B1216", "#522930");
  }

  if (recipe.type === "banana-pudding") {
    // Creamy Banana Pudding Center Core
    const pudGrad = ctx.createRadialGradient(
      cx,
      cy,
      size * 0.01,
      cx,
      cy,
      radius * 0.44
    );
    pudGrad.addColorStop(0, "#FFFBE6");
    pudGrad.addColorStop(1, "#F5DF8B");
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = pudGrad;
    ctx.fill();

    // Crushed Golden Nilla Wafer Pieces & White Chocolate Chips
    drawChunks(ctx, rand, cx, cy, radius, size, 18, "#E8B76B", "#BA8538");
    drawChunks(ctx, rand, cx, cy, radius, size, 14, "#FFFDF7", "#E6DEC8");
  }

  ctx.restore();

  // 7. Scattered Artisan Cookie Crumbs on Pastel Backdrop
  for (let c = 0; c < 18; c++) {
    const a = rand() * Math.PI * 2;
    const d = radius * (1.06 + rand() * 0.22);
    const crx = cx + Math.cos(a) * d;
    const cry = cy + Math.sin(a) * d;
    const cSize = size * (0.003 + rand() * 0.008);
    ctx.beginPath();
    ctx.arc(crx, cry, cSize, 0, Math.PI * 2);
    ctx.fillStyle = rand() > 0.4 ? recipe.doughBase : recipe.doughShadow;
    ctx.fill();
  }

  const dataUrl = canvas.toDataURL("image/jpeg", 0.94);
  if (size <= 1024) {
    renderCache[cacheKey] = dataUrl;
  }
  return dataUrl;
}

function drawChunks(
  ctx: CanvasRenderingContext2D,
  rand: () => number,
  cx: number,
  cy: number,
  radius: number,
  size: number,
  count: number,
  fillHex: string,
  borderHex: string
) {
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * radius * 0.82;
    const x = cx + Math.cos(a) * d;
    const y = cy + Math.sin(a) * d;
    const w = size * (0.022 + rand() * 0.018);
    const h = size * (0.018 + rand() * 0.016);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rand() * Math.PI);
    ctx.fillStyle = fillHex;
    ctx.strokeStyle = borderHex;
    ctx.lineWidth = size * 0.002;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, size * 0.005);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function drawMeltedPuddles(
  ctx: CanvasRenderingContext2D,
  rand: () => number,
  cx: number,
  cy: number,
  radius: number,
  size: number,
  count: number,
  darkHex: string,
  shineHex: string
) {
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * radius * 0.8;
    const x = cx + Math.cos(a) * d;
    const y = cy + Math.sin(a) * d;
    const r = size * (0.018 + rand() * 0.018);

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = darkHex;
    ctx.fill();

    // Glossy Specular Highlight
    ctx.beginPath();
    ctx.arc(x - r * 0.28, y - r * 0.28, r * 0.32, 0, Math.PI * 2);
    ctx.fillStyle = shineHex;
    ctx.fill();
  }
}

function drawGlossyDrizzle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  size: number,
  lightHex: string,
  midHex: string
) {
  ctx.save();
  ctx.strokeStyle = lightHex;
  ctx.lineWidth = size * 0.016;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = midHex;
  ctx.shadowBlur = size * 0.006;

  ctx.beginPath();
  for (let i = -3; i <= 3; i++) {
    const offset = i * (radius * 0.22);
    const x1 = cx - radius * 0.65;
    const y1 = cy + offset - radius * 0.15;
    const x2 = cx + radius * 0.65;
    const y2 = cy + offset + radius * 0.15;
    if (i === -3) ctx.moveTo(x1, y1);
    else ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
  }
  ctx.stroke();
  ctx.restore();
}

// Helper to download all 8 remaining cookies as 2048x2048 4K .jpg files
export function downloadRemaining8CookieJpgs() {
  Object.keys(REMAINING_8_RECIPES).forEach((id, idx) => {
    setTimeout(() => {
      const dataUrl = renderCookieToDataUrl(id, 2048);
      if (!dataUrl) return;
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, idx * 350);
  });
}