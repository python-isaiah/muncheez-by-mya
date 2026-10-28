import React, { useState, useMemo, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ShoppingBag,
  Truck,
  Clock,
  CheckCircle2,
  Plus,
  Minus,
  Lock,
  Search,
  LogOut,
  Copy,
  Check,
  Layers,
  Wand2,
  Trash2,
  Download,
  Mail,
  Loader2,
  ExternalLink,
  Star,
  MapPin,
  Dices,
  Heart,
} from "lucide-react";
import type {
  ActiveView,
  BoxMap,
  CheckoutFormState,
  CookieFlavor,
  FulfillmentType,
  Order,
  OrderStatus,
  OrderStatusMeta,
  PaymentMethod,
  StoreConfig,
} from "./types";
import {
  renderCookieToDataUrl,
  downloadRemaining8CookieJpgs,
} from "./cookieRenderer";
import {
  MYA_EMAIL,
  sendOrderEmailToMya,
  buildCustomerGmailComposeUrl,
} from "./emailService";

const MAX_FLAVORS_PER_DOZEN = 3;
const COOKIES_PER_DOZEN = 12;

// --- ALL 18 FLAVORS WITH .jpg.jfif PATHS ---
const INITIAL_COOKIES: CookieFlavor[] = [
  { id: "red-velvet", name: "Red Velvet", price: 3.5, tag: "Best Seller", bg: "bg-[#F9D5E5]", accent: "#9E2A47", emoji: "🍪", image: "/cookies/red-velvet.jpg.jfif", desc: "Rich cocoa red velvet dough loaded with creamy white chocolate chips.", inStock: true },
  { id: "blue-velvet", name: "Blue Velvet", price: 3.5, tag: "Fan Favorite", bg: "bg-[#D4E6F9]", accent: "#234E82", emoji: "💙", image: "/cookies/blue-velvet.jpg.jfif", desc: "Velvety royal blue cookie studded with sweet cream cheese & white chocolate morsels.", inStock: true },
  { id: "pink-velvet", name: "Pink Velvet", price: 3.5, tag: "Signature", bg: "bg-[#FADCE6]", accent: "#B83B6B", emoji: "🌸", image: "/cookies/pink-velvet.jpg.jfif", desc: "Soft, buttery pink velvet cake batter cookie with white chocolate drizzle.", inStock: true },
  { id: "chocolate-chip", name: "Chocolate Chip", price: 3.25, tag: "Classic", bg: "bg-[#CBE8E0]", accent: "#286152", emoji: "🍫", image: "/cookies/chocolate-chip.jpg.jfif", desc: "NYC-style thick golden brown butter dough packed with semi-sweet chocolate puddles.", inStock: true },
  { id: "confetti", name: "Confetti", price: 3.25, tag: "", bg: "bg-[#E2DCF7]", accent: "#4C3B82", emoji: "🎉", image: "/cookies/confetti.jpg.jfif", desc: "Sugar cookie dough folded with rainbow sprinkles and vanilla bean glaze.", inStock: true },
  { id: "smores", name: "S'mores", price: 3.75, tag: "Popular", bg: "bg-[#FBE6C8]", accent: "#8C541A", emoji: "🔥", image: "/cookies/smores.jpg.jfif", desc: "Graham cracker infused dough with toasted marshmallow core and Hershey's milk chocolate.", inStock: true },
  { id: "cookies-n-creme", name: "Cookies n Creme", price: 3.5, tag: "", bg: "bg-[#DCE4EC]", accent: "#2D3E50", emoji: "🥛", image: "/cookies/cookies-n-creme.jpg.jfif", desc: "Crushed Oreo chunks folded into sweet cream dough with white chocolate chunks.", inStock: true },
  { id: "birthday-cake", name: "Birthday Cake", price: 3.5, tag: "Sweet", bg: "bg-[#F9D9EA]", accent: "#8F2D60", emoji: "🎂", image: "/cookies/birthday-cake.jpg.jfif", desc: "Cake batter frosting center with festive rainbow jimmies and white chocolate.", inStock: true },
  { id: "cheesecake", name: "Cheesecake", price: 3.75, tag: "Stuffed", bg: "bg-[#FDF0C6]", accent: "#7D6214", emoji: "🍰", image: "/cookies/cheesecake.jpg.jfif", desc: "Buttery graham cookie wrapped around a tangy, velvety NY cheesecake filling.", inStock: true },
  { id: "cookie-monster", name: "Cookie Monster", price: 3.75, tag: "Iconic", bg: "bg-[#C8E4FA]", accent: "#185485", emoji: "👾", image: "/cookies/cookie-monster.jpg.jfif", desc: "Electric blue brown-sugar dough stuffed with Chips Ahoy, Oreos, and chocolate chunks.", inStock: true },
  { id: "strawberry", name: "Strawberry", price: 3.5, tag: "Fruity", bg: "bg-[#FAD2D8]", accent: "#9C2738", emoji: "🍓", image: "/cookies/strawberry.jpg.jfif", desc: "Real strawberry reduction swirled with shortbread crumble and white chocolate.", inStock: true },
  { id: "lemon", name: "Lemon", price: 3.25, tag: "Zesty", bg: "bg-[#FCF5C7]", accent: "#756812", emoji: "🍋", image: "/cookies/lemon.jpg.jfif", desc: "Bright Meyer lemon zest cookie finished with a sweet tart lemon curd glaze.", inStock: true },
  { id: "snickerdoodle", name: "Snickerdoodle", price: 3.25, tag: "", bg: "bg-[#F7E3D0]", accent: "#7A4921", emoji: "✨", image: "/cookies/snickerdoodle.jpg.jfif", desc: "Pillow-soft tangy vanilla dough rolled generously in Ceylon cinnamon sugar.", inStock: true },
  { id: "double-chocolate-chip", name: "Double Chocolate Chip", price: 3.5, tag: "Rich", bg: "bg-[#E5D6CE]", accent: "#4A2E1F", emoji: "🍩", image: "/cookies/double-chocolate-chip.jpg.jfif", desc: "Dutch-process dark fudge cookie loaded with milk and dark chocolate chips.", inStock: true },
  { id: "salted-caramel", name: "Salted Caramel", price: 3.75, tag: "", bg: "bg-[#FBE2C6]", accent: "#804A14", emoji: "🍯", image: "/cookies/salted-caramel.jpg.jfif", desc: "Gooey caramel core topped with flaky Maldon sea salt.", inStock: true },
  { id: "cinnamon-roll", name: "Cinnamon Roll", price: 3.75, tag: "Must Try", bg: "bg-[#F5DFD3]", accent: "#733F26", emoji: "🌀", image: "/cookies/cinnamon-roll.jpg.jfif", desc: "Swirled with brown sugar cinnamon butter and topped with warm cream cheese icing.", inStock: true },
  { id: "oatmeal-raisin", name: "Oatmeal Raisin", price: 3.25, tag: "", bg: "bg-[#E9E4D4]", accent: "#574E33", emoji: "🌾", image: "/cookies/oatmeal-raisin.jpg.jfif", desc: "Chewy rolled oats, warm spiced molasses, and plump sun-ripened raisins.", inStock: true },
  { id: "banana-pudding", name: "Banana Pudding", price: 3.75, tag: "NYC Favorite", bg: "bg-[#FCF0CC]", accent: "#7A5E12", emoji: "🍌", image: "/cookies/banana-pudding.jpg.jfif", desc: "Creamy banana pudding center topped with crushed Nilla Wafers and white chocolate.", inStock: true },
];

// --- CURATED NYC 3-FLAVOR TRIO PACKS ---
const CURATED_TRIOS = [
  {
    title: "The Velvet Underground",
    subtitle: "4x Red Velvet • 4x Blue Velvet • 4x Pink Velvet",
    badge: "Most Iconic",
    bg: "from-[#F9D5E5] to-[#D4E6F9]",
    boxMap: { "red-velvet": 4, "blue-velvet": 4, "pink-velvet": 4 } as BoxMap,
  },
  {
    title: "NYC Bodega Late Night",
    subtitle: "4x Cookie Monster • 4x Banana Pudding • 4x S'mores",
    badge: "Mya's Pick",
    bg: "from-[#C8E4FA] to-[#FCF0CC]",
    boxMap: { "cookie-monster": 4, "banana-pudding": 4, smores: 4 } as BoxMap,
  },
  {
    title: "Sunday Brunch in SoHo",
    subtitle: "4x Cinnamon Roll • 4x Cheesecake • 4x Strawberry",
    badge: "Stuffed & Swirled",
    bg: "from-[#F5DFD3] to-[#FDF0C6]",
    boxMap: { "cinnamon-roll": 4, cheesecake: 4, strawberry: 4 } as BoxMap,
  },
];

// --- NYC CUSTOMER TESTIMONIALS ---
const NYC_TESTIMONIALS = [
  {
    name: "Jada M.",
    borough: "SoHo, Manhattan",
    quote:
      "I ordered the Velvet Trio for my birthday brunch and literally everyone stopped talking when we broke them open. Still warm, thick as hockey pucks, and not overly sweet!",
    rating: 5,
    boxLabel: "4x Red Velvet, 4x Pink Velvet, 4x Blue Velvet",
    boxMap: { "red-velvet": 4, "pink-velvet": 4, "blue-velvet": 4 } as BoxMap,
    bg: "bg-[#FADCE6]/50",
  },
  {
    name: "Devon & Kayla",
    borough: "Williamsburg, Brooklyn",
    quote:
      "That Banana Pudding cookie tastes like Magnolia Bakery wrapped inside a brown-butter cookie. Mya texted right on the 24-hour mark to confirm pickup. 10/10 service.",
    rating: 5,
    boxLabel: "4x Banana Pudding, 4x Cookie Monster, 4x Cinnamon Roll",
    boxMap: {
      "banana-pudding": 4,
      "cookie-monster": 4,
      "cinnamon-roll": 4,
    } as BoxMap,
    bg: "bg-[#FCF0CC]/60",
  },
  {
    name: "Tiana R.",
    borough: "Astoria, Queens",
    quote:
      "The 3-flavor-per-dozen box builder is so fun to use. We ended up building two separate dozens so we could try S'mores, Cheesecake, and Salted Caramel too!",
    rating: 5,
    boxLabel: "4x S'mores, 4x Cheesecake, 4x Salted Caramel",
    boxMap: { smores: 4, cheesecake: 4, "salted-caramel": 4 } as BoxMap,
    bg: "bg-[#E2DCF7]/50",
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: "MBM-1042",
    customerName: "Brianna Taylor",
    phone: "(917) 555-0194",
    email: "brianna@example.com",
    fulfillment: "pickup",
    address: "NYC Pickup — Brooklyn / Queens Hub",
    scheduledDate: "2026-10-28",
    scheduledTime: "2:00 PM",
    paymentMethod: "Zelle",
    status: "payment_pending",
    trackingNumber: "",
    total: 42.0,
    createdAt: "Oct 26, 2026 • 10:30 AM",
    items: [
      { name: "Red Velvet", qty: 4, boxNumber: 1 },
      { name: "Cookie Monster", qty: 4, boxNumber: 1 },
      { name: "Banana Pudding", qty: 4, boxNumber: 1 },
    ],
    emailDispatched: true,
  },
  {
    id: "MBM-1039",
    customerName: "Marcus Vance",
    phone: "(646) 555-0148",
    email: "marcus@example.com",
    fulfillment: "shipping",
    address: "420 W 23rd St, Apt 4B, New York, NY 10011",
    scheduledDate: "2026-10-27",
    scheduledTime: "12:00 PM",
    paymentMethod: "Cash App",
    status: "ready_or_shipped",
    trackingNumber: "USPS-9405511899562019",
    total: 43.5,
    createdAt: "Oct 25, 2026 • 1:15 PM",
    items: [
      { name: "Pink Velvet", qty: 4, boxNumber: 1 },
      { name: "Blue Velvet", qty: 4, boxNumber: 1 },
      { name: "Cheesecake", qty: 4, boxNumber: 1 },
    ],
    emailDispatched: true,
  },
];

const ORDER_STATUS_META: Record<OrderStatus, OrderStatusMeta> = {
  payment_pending: {
    label: "Awaiting Payment (24h Window)",
    badge: "bg-amber-100 text-amber-800 border-amber-300",
    step: 1,
    desc: "Please send payment via Cash App or Zelle within 24 hours of ordering to lock in your bake slot.",
  },
  payment_received: {
    label: "Payment Confirmed",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    step: 2,
    desc: "Mya received your payment! Your order is locked into the baking schedule.",
  },
  baking: {
    label: "Prepping & In the Oven",
    badge: "bg-pink-100 text-pink-800 border-pink-300",
    step: 3,
    desc: "Your dozen is being freshly mixed and baked from scratch.",
  },
  confirmed_24h: {
    label: "24hr Confirmation Sent",
    badge: "bg-purple-100 text-purple-800 border-purple-300",
    step: 4,
    desc: "Mya has reached out to confirm your pickup/delivery for tomorrow! (Reschedule window is now closed).",
  },
  ready_or_shipped: {
    label: "Ready for Pickup / Out for Delivery",
    badge: "bg-sky-100 text-sky-800 border-sky-300",
    step: 5,
    desc: "Pickup orders: Please arrive within your 15-minute grace period! Shipping orders: Check your tracking number below.",
  },
  grace_period_missed: {
    label: "Missed 15m Grace — Next-Day Final Hold",
    badge: "bg-orange-100 text-orange-800 border-orange-300",
    step: 5,
    desc: "15-minute pickup window was missed. Mya has contacted you to pick up tomorrow. Unclaimed orders after tomorrow are cancelled without refund.",
  },
  cancelled_no_refund: {
    label: "Cancelled (No Refund / Expired)",
    badge: "bg-rose-100 text-rose-800 border-rose-300",
    step: 0,
    desc: "This order was cancelled due to missed 24hr payment window or unclaimed next-day pickup per store policy.",
  },
};

// --- ANIMATED PINK OUTLINE NYC SKYLINE & BROOKLYN BRIDGE SVG ---
function NycSkylineOutline({
  className = "",
  strokeColor = "#EC4899",
}: {
  className?: string;
  strokeColor?: string;
}) {
  return (
    <div className={`w-full overflow-hidden pointer-events-none select-none ${className}`}>
      <svg
        viewBox="0 0 1440 210"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="nycPinkGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F472B6" stopOpacity="0.45" />
            <stop offset="50%" stopColor={strokeColor} stopOpacity="0.95" />
            <stop offset="100%" stopColor="#F472B6" stopOpacity="0.45" />
          </linearGradient>
        </defs>

        {/* Subtle Twinkling NYC Stars / Penthouse Lights */}
        {[
          { cx: 180, cy: 42 },
          { cx: 360, cy: 25 },
          { cx: 590, cy: 18 },
          { cx: 820, cy: 36 },
          { cx: 1090, cy: 28 },
          { cx: 1280, cy: 50 },
        ].map((star, idx) => (
          <motion.circle
            key={idx}
            cx={star.cx}
            cy={star.cy}
            r="2.5"
            fill={strokeColor}
            animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.8, 1.3, 0.8] }}
            transition={{
              repeat: Infinity,
              duration: 2.4 + idx * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Continuous NYC Skyline Silhouette: Brooklyn Bridge -> One WTC -> Brownstones -> Empire State -> Chrysler -> Queensboro */}
        <motion.path
          d="M0 195 L45 195 L45 135 L75 135 L75 195 L95 195 L95 95 L110 78 L125 95 L125 195 L165 195 C195 140, 235 140, 265 195 L265 90 L285 90 L285 195 C315 140, 355 140, 385 195 L420 195 L420 115 L465 115 L465 195 L490 195 L490 65 L515 35 L515 10 L520 10 L520 35 L545 65 L545 195 L580 195 L580 130 L635 130 L635 195 L665 195 L665 98 L695 98 L695 75 L715 75 L715 45 L725 45 L725 14 L730 14 L730 45 L740 45 L740 75 L760 75 L760 98 L790 98 L790 195 L830 195 L830 120 L880 120 L880 195 L915 195 L915 85 L930 62 L945 40 L950 18 L955 40 L970 62 L985 85 L985 195 L1025 195 L1025 138 L1075 138 L1075 195 L1110 195 L1110 105 L1165 105 L1165 195 L1200 195 L1200 148 L1250 148 L1250 195 L1290 195 L1290 122 L1340 122 L1340 195 L1440 195"
          stroke="url(#nycPinkGlow)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2.6, ease: "easeInOut" }}
        />

        {/* Brooklyn Bridge Suspension Cables & Arches Detail */}
        <motion.path
          d="M110 78 Q195 165 275 90 M275 90 Q345 165 420 140 M103 115 L117 115 M270 115 L280 115"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeDasharray="4 4"
          strokeOpacity="0.65"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 1.5 }}
        />
      </svg>
    </div>
  );
}

// --- SMART IMAGE LOADER ---
function SmartCookieImage({
  cookie,
  className = "w-full h-full object-cover scale-110",
}: {
  cookie: CookieFlavor;
  className?: string;
}) {
  const candidates = useMemo(() => {
    const list = [
      cookie.image,
      `/cookies/${cookie.id}.jpg.jfif`,
      `/cookies/${cookie.id}.jpg`,
      `/cookies/${cookie.id}.jfif`,
      `/cookies/${cookie.id}.png`,
    ];
    const generatedStudioRender = renderCookieToDataUrl(cookie.id, 1024);
    if (generatedStudioRender) {
      list.push(generatedStudioRender);
    }
    return Array.from(new Set(list));
  }, [cookie.id, cookie.image]);

  const [attemptIndex, setAttemptIndex] = useState<number>(0);

  if (attemptIndex >= candidates.length) {
    return <span>{cookie.emoji}</span>;
  }

  return (
    <img
      src={candidates[attemptIndex]}
      alt={cookie.name}
      onError={() => setAttemptIndex((prev) => prev + 1)}
      className={className}
    />
  );
}

// --- 3D MAGNETIC PERSPECTIVE COOKIE CARD COMPONENT ---
interface CookieCard3DProps {
  cookie: CookieFlavor;
  index: number;
  qtyInActiveBox: number;
  totalQtyAllBoxes: number;
  activeBoxIndex: number;
  isNewFlavorLockedInActiveBox: boolean;
  onAdd: () => void;
  onRemove: () => void;
}

function CookieCard3D({
  cookie,
  index,
  qtyInActiveBox,
  totalQtyAllBoxes,
  activeBoxIndex,
  isNewFlavorLockedInActiveBox,
  onAdd,
  onRemove,
}: CookieCard3DProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 25 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["9deg", "-9deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-9deg", "9deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: (index % 6) * 0.05 }}
      className="group flex flex-col items-center text-center [perspective:1000px]"
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={`relative w-full aspect-square ${cookie.bg} rounded-3xl flex flex-col items-center justify-center p-7 shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden`}
      >
        {cookie.tag && (
          <span
            style={{ transform: "translateZ(25px)" }}
            className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] tracking-[0.18em] uppercase font-semibold text-stone-700 shadow-xs"
          >
            {cookie.tag}
          </span>
        )}

        {totalQtyAllBoxes > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ transform: "translateZ(25px)" }}
            className="absolute top-4 right-4 bg-stone-900 text-white px-2.5 py-1 rounded-full text-[10px] tracking-wider uppercase font-bold shadow-sm"
          >
            {totalQtyAllBoxes} in order
          </motion.span>
        )}

        {!cookie.inStock && (
          <span className="absolute top-4 right-4 bg-stone-900 text-white px-3 py-1 rounded-full text-[10px] tracking-[0.18em] uppercase font-semibold">
            Sold Out
          </span>
        )}

        {/* 4K Render Medallion with 3D Levitation */}
        <motion.div
          style={{ transform: "translateZ(42px)" }}
          whileHover={{ scale: 1.1, rotate: 6 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
          className="w-36 h-36 rounded-full bg-white/85 shadow-lg flex items-center justify-center text-6xl mb-4 border-4 border-white overflow-hidden"
        >
          <SmartCookieImage cookie={cookie} />
        </motion.div>

        <p
          style={{ transform: "translateZ(20px)" }}
          className="text-xs text-stone-700/90 max-w-[230px] leading-relaxed font-medium"
        >
          {cookie.desc}
        </p>

        {cookie.inStock && (
          <div
            style={{ transform: "translateZ(35px)" }}
            className="mt-5 flex flex-col items-center gap-1.5"
          >
            <div className="flex items-center gap-3 bg-white/95 backdrop-blur px-3.5 py-1.5 rounded-full shadow-md border border-white">
              <motion.button
                whileTap={{ scale: 0.85 }}
                type="button"
                onClick={onRemove}
                disabled={qtyInActiveBox === 0}
                className="w-7 h-7 rounded-full flex items-center justify-center bg-stone-100 hover:bg-pink-100 disabled:opacity-35 transition"
              >
                <Minus className="w-3.5 h-3.5" />
              </motion.button>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={qtyInActiveBox}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  className="text-xs font-bold w-6 text-center text-stone-900"
                >
                  {qtyInActiveBox}
                </motion.span>
              </AnimatePresence>
              <motion.button
                whileTap={{ scale: 0.85 }}
                type="button"
                onClick={onAdd}
                className="w-7 h-7 rounded-full flex items-center justify-center bg-stone-900 text-white hover:bg-pink-500 transition"
                title={
                  isNewFlavorLockedInActiveBox
                    ? "Box has 3 flavors — clicking + will start a new Dozen Box!"
                    : `Add to Dozen #${activeBoxIndex + 1}`
                }
              >
                <Plus className="w-3.5 h-3.5" />
              </motion.button>
            </div>

            {isNewFlavorLockedInActiveBox && (
              <span className="text-[10px] font-semibold text-pink-700 bg-white/80 px-2.5 py-0.5 rounded-full">
                + Opens New Dozen (3/3 flavors full)
              </span>
            )}
          </div>
        )}
      </motion.div>

      <h3 className="mt-4 text-xs tracking-[0.2em] uppercase font-semibold text-stone-800">
        {cookie.name}
      </h3>
      <p className="text-xs text-stone-500 mt-1 font-medium">
        ${cookie.price.toFixed(2)} each
      </p>
    </motion.div>
  );
}

// --- MAIN APPLICATION ---
export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>("shop");

  const [cookies, setCookies] = useState<CookieFlavor[]>(() => {
    const saved = localStorage.getItem("mbm_cookies_v5");
    return saved ? (JSON.parse(saved) as CookieFlavor[]) : INITIAL_COOKIES;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("mbm_orders_v5");
    return saved ? (JSON.parse(saved) as Order[]) : INITIAL_ORDERS;
  });

  useEffect(() => {
    localStorage.setItem("mbm_cookies_v5", JSON.stringify(cookies));
  }, [cookies]);

  useEffect(() => {
    localStorage.setItem("mbm_orders_v5", JSON.stringify(orders));
  }, [orders]);

  const [storeConfig] = useState<StoreConfig>({
    bakerEmail: MYA_EMAIL,
    cashAppTag: "$MuncheezByMya",
    zelleContact: MYA_EMAIL,
    pickupArea: "NYC (Exact address sent 24hrs prior upon confirmation)",
    shippingFee: 9.99,
    deliveryFee: 12.0,
  });

  const [boxes, setBoxes] = useState<BoxMap[]>([{}]);
  const [activeBoxIndex, setActiveBoxIndex] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [celebrateBurst, setCelebrateBurst] = useState<boolean>(false);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [copiedText, setCopiedText] = useState<string>("");

  const minDateString = useMemo<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  }, []);

  const [form, setForm] = useState<CheckoutFormState>({
    customerName: "",
    phone: "",
    email: "",
    fulfillment: "pickup",
    address: "",
    scheduledDate: minDateString,
    scheduledTime: "2:00 PM",
    paymentMethod: "Cash App",
    agree24hrPayment: false,
    agree48hrLeadAndReschedule: false,
    agree15minGracePolicy: false,
  });

  const [trackQuery, setTrackQuery] = useState<string>("MBM-1042");
  const [adminUnlocked, setAdminUnlocked] = useState<boolean>(false);
  const [adminPin, setAdminPin] = useState<string>("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const triggerBoxCelebration = () => {
    setCelebrateBurst(true);
    setTimeout(() => setCelebrateBurst(false), 1400);
  };

  const getBoxCookieCount = (b: BoxMap) =>
    Object.values(b).reduce((sum, q) => sum + q, 0);
  const getBoxFlavorCount = (b: BoxMap) => Object.keys(b).length;

  const currentBox = boxes[activeBoxIndex] || {};
  const currentBoxCookies = getBoxCookieCount(currentBox);
  const currentBoxFlavors = getBoxFlavorCount(currentBox);

  const totalCookiesAllBoxes = useMemo(
    () => boxes.reduce((sum, b) => sum + getBoxCookieCount(b), 0),
    [boxes]
  );

  const nonEmptyBoxes = useMemo(
    () => boxes.filter((b) => getBoxCookieCount(b) > 0),
    [boxes]
  );

  const allBoxesComplete =
    nonEmptyBoxes.length > 0 &&
    nonEmptyBoxes.every(
      (b) =>
        getBoxCookieCount(b) === COOKIES_PER_DOZEN &&
        getBoxFlavorCount(b) <= MAX_FLAVORS_PER_DOZEN
    );

  const subtotal = useMemo<number>(() => {
    return boxes.reduce((boxSum, b) => {
      return (
        boxSum +
        Object.entries(b).reduce((sum, [id, qty]) => {
          const item = cookies.find((c) => c.id === id);
          return sum + (item ? item.price * qty : 0);
        }, 0)
      );
    }, 0);
  }, [boxes, cookies]);

  const fulfillmentFee =
    form.fulfillment === "shipping"
      ? storeConfig.shippingFee
      : form.fulfillment === "delivery"
      ? storeConfig.deliveryFee
      : 0;

  // Load a pre-built 3-flavor dozen into the current or new box
  const loadPresetDozen = (presetMap: BoxMap, title: string) => {
    const activeIsEmpty = getBoxCookieCount(currentBox) === 0;
    if (activeIsEmpty) {
      setBoxes((prev) =>
        prev.map((b, i) => (i === activeBoxIndex ? { ...presetMap } : b))
      );
      triggerBoxCelebration();
      triggerToast(`🎉 Loaded "${title}" into Dozen Box #${activeBoxIndex + 1}!`);
    } else {
      const nextIdx = boxes.length;
      setBoxes((prev) => [...prev, { ...presetMap }]);
      setActiveBoxIndex(nextIdx);
      triggerBoxCelebration();
      triggerToast(`🎉 Added "${title}" as Dozen Box #${nextIdx + 1}!`);
    }
  };

  // Spin a Random 3-Flavor NYC Mystery Dozen
  const spinMysteryDozen = () => {
    const available = cookies.filter((c) => c.inStock);
    if (available.length < 3) return;
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, 3);
    const mysteryMap: BoxMap = {
      [picked[0].id]: 4,
      [picked[1].id]: 4,
      [picked[2].id]: 4,
    };
    setBoxes((prev) =>
      prev.map((b, i) => (i === activeBoxIndex ? mysteryMap : b))
    );
    triggerBoxCelebration();
    triggerToast(
      `🎲 Mya's Mystery Trio: 4x ${picked[0].name}, 4x ${picked[1].name} & 4x ${picked[2].name}!`
    );
  };

  const handleAddCookie = (cookieId: string) => {
    const flavorObj = cookies.find((c) => c.id === cookieId);
    const flavorName = flavorObj?.name || "Flavor";

    const activeBox = boxes[activeBoxIndex] || {};
    const countInActive = getBoxCookieCount(activeBox);
    const flavorsInActive = getBoxFlavorCount(activeBox);
    const alreadyInActive = Boolean(activeBox[cookieId]);

    const activeCanAccept =
      countInActive < COOKIES_PER_DOZEN &&
      (alreadyInActive || flavorsInActive < MAX_FLAVORS_PER_DOZEN);

    if (activeCanAccept) {
      const nextCount = countInActive + 1;
      setBoxes((prev) =>
        prev.map((b, i) =>
          i === activeBoxIndex ? { ...b, [cookieId]: (b[cookieId] || 0) + 1 } : b
        )
      );
      if (nextCount === COOKIES_PER_DOZEN) {
        triggerBoxCelebration();
        triggerToast(`🎉 Dozen Box #${activeBoxIndex + 1} is complete (12/12)!`);
      }
      return;
    }

    const existingTargetIdx = boxes.findIndex((b, idx) => {
      if (idx === activeBoxIndex) return false;
      const c = getBoxCookieCount(b);
      const f = getBoxFlavorCount(b);
      const hasFlavor = Boolean(b[cookieId]);
      return c < COOKIES_PER_DOZEN && (hasFlavor || f < MAX_FLAVORS_PER_DOZEN);
    });

    if (existingTargetIdx !== -1) {
      setBoxes((prev) =>
        prev.map((b, i) =>
          i === existingTargetIdx
            ? { ...b, [cookieId]: (b[cookieId] || 0) + 1 }
            : b
        )
      );
      setActiveBoxIndex(existingTargetIdx);
      triggerToast(
        `✨ Dozen #${activeBoxIndex + 1} reached its limit! Moved ${flavorName} into Dozen #${
          existingTargetIdx + 1
        }.`
      );
      return;
    }

    const newBoxNumber = boxes.length + 1;
    const reason =
      countInActive >= COOKIES_PER_DOZEN
        ? `Dozen #${activeBoxIndex + 1} is full (12/12)!`
        : `Max 3 flavors per dozen!`;

    setBoxes((prev) => [...prev, { [cookieId]: 1 }]);
    setActiveBoxIndex(boxes.length);
    triggerToast(
      `📦 ${reason} Started Separate Dozen Box #${newBoxNumber} with ${flavorName}.`
    );
  };

  const handleRemoveCookie = (cookieId: string) => {
    setBoxes((prev) =>
      prev.map((b, i) => {
        if (i !== activeBoxIndex) return b;
        const current = b[cookieId] || 0;
        if (current <= 1) {
          const copy = { ...b };
          delete copy[cookieId];
          return copy;
        }
        return { ...b, [cookieId]: current - 1 };
      })
    );
  };

  const autoFillActiveDozen = () => {
    const activeBox = boxes[activeBoxIndex] || {};
    const chosenIds = Object.keys(activeBox);
    if (chosenIds.length === 0) return;

    const baseQty = Math.floor(COOKIES_PER_DOZEN / chosenIds.length);
    let remainder = COOKIES_PER_DOZEN % chosenIds.length;

    const filledBox: BoxMap = {};
    chosenIds.forEach((id) => {
      filledBox[id] = baseQty + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
    });

    setBoxes((prev) =>
      prev.map((b, i) => (i === activeBoxIndex ? filledBox : b))
    );
    triggerBoxCelebration();
    triggerToast(
      `🪄 Evenly filled Dozen #${activeBoxIndex + 1} to 12 cookies across your ${
        chosenIds.length
      } flavor(s)!`
    );
  };

  const removeDozenBox = (indexToRemove: number) => {
    if (boxes.length <= 1) {
      setBoxes([{}]);
      setActiveBoxIndex(0);
      return;
    }
    setBoxes((prev) => prev.filter((_, i) => i !== indexToRemove));
    setActiveBoxIndex((prev) => Math.max(0, prev - 1));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!allBoxesComplete || isSubmittingOrder) return;

    setIsSubmittingOrder(true);

    const newOrderId = `MBM-${Math.floor(1000 + Math.random() * 9000)}`;
    const itemsList = nonEmptyBoxes.flatMap((b, boxIdx) =>
      Object.entries(b).map(([id, qty]) => {
        const c = cookies.find((item) => item.id === id);
        return {
          name: c?.name || id,
          qty,
          boxNumber: boxIdx + 1,
        };
      })
    );

    const newOrder: Order = {
      id: newOrderId,
      customerName: form.customerName,
      phone: form.phone,
      email: form.email,
      fulfillment: form.fulfillment,
      address:
        form.fulfillment === "pickup" ? storeConfig.pickupArea : form.address,
      scheduledDate: form.scheduledDate,
      scheduledTime: form.scheduledTime,
      paymentMethod: form.paymentMethod,
      status: "payment_pending",
      trackingNumber: "",
      total: subtotal + fulfillmentFee,
      createdAt: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      items: itemsList,
      emailDispatched: true,
    };

    const emailSuccess = await sendOrderEmailToMya(newOrder);
    newOrder.emailDispatched = emailSuccess;

    setOrders((prev) => [newOrder, ...prev]);
    setConfirmedOrder(newOrder);
    setTrackQuery(newOrderId);
    setBoxes([{}]);
    setActiveBoxIndex(0);
    setIsSubmittingOrder(false);
    triggerToast(`📧 Order ${newOrderId} sent to ${MYA_EMAIL}!`);
  };

  const trackedOrder = orders.find(
    (o) => o.id.toLowerCase() === trackQuery.trim().toLowerCase()
  );

  const expandedActiveBoxCookies: CookieFlavor[] = useMemo(() => {
    return Object.entries(currentBox).flatMap(([id, qty]) => {
      const found = cookies.find((c) => c.id === id);
      return found ? Array<CookieFlavor>(qty).fill(found) : [];
    });
  }, [currentBox, cookies]);

  return (
    <div className="min-h-screen bg-white text-stone-800 font-sans selection:bg-pink-200 overflow-x-hidden">
      {/* FLOATING SPILLOVER / ACTION TOAST */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-5 py-3 rounded-full shadow-2xl text-xs font-semibold tracking-wide flex items-center gap-2 border border-pink-400/40"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP POLICY ANNOUNCEMENT RIBBON */}
      <div className="bg-[#FADADD]/75 text-stone-700 text-xs py-2.5 px-4 text-center tracking-wide font-medium border-b border-pink-200/60">
        ✨ BAKED BY THE DOZEN IN NYC • MAX 3 FLAVORS PER DOZEN • ORDERS ROUTED TO MUNCHEEZBYMYA@GMAIL.COM ✨
      </div>

      {/* EDITORIAL NAVIGATION BAR WITH LIQUID MORPHING PILL */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-xs tracking-[0.18em] uppercase text-stone-500 font-medium">
            {(
              [
                { id: "shop", label: "Shop Cookies" },
                { id: "policies", label: "Policies & FAQ" },
                { id: "track", label: "Track Order" },
              ] as { id: ActiveView; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveView(tab.id)}
                className={`relative px-4 py-2 rounded-full transition ${
                  activeView === tab.id
                    ? "text-stone-900 font-semibold"
                    : "hover:text-pink-500"
                }`}
              >
                {activeView === tab.id && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 bg-[#FADADD]/60 rounded-full -z-10"
                  />
                )}
                {tab.label}
              </button>
            ))}
          </nav>

          {/* CENTER BRAND LOGO */}
          <button
            type="button"
            onClick={() => setActiveView("shop")}
            className="text-2xl md:text-3xl font-serif tracking-tight text-stone-900 hover:opacity-80 transition"
          >
            Muncheez<span className="text-pink-400 italic">By</span>Mya
          </button>

          {/* RIGHT LINKS & ADMIN / BAG */}
          <div className="flex items-center gap-5 text-xs tracking-[0.18em] uppercase text-stone-500 font-medium">
            <button
              type="button"
              onClick={() => setActiveView("admin")}
              className={`hover:text-stone-900 transition flex items-center gap-1 ${
                activeView === "admin" ? "text-pink-600 font-semibold" : ""
              }`}
            >
              <Lock className="w-3.5 h-3.5" /> Mya Admin
            </button>
            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={() => {
                setActiveView("shop");
                if (allBoxesComplete) setIsCheckoutOpen(true);
              }}
              className="relative flex items-center gap-2 bg-stone-900 text-white px-4 py-2.5 rounded-full text-[11px] tracking-widest hover:bg-pink-500 transition shadow-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>
                {nonEmptyBoxes.length || 1} Box • {totalCookiesAllBoxes} Cookies
              </span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* PAGE TRANSITION WRAPPER */}
      <AnimatePresence mode="wait">
        {/* ==================== VIEW 1: SHOP & MULTI-DOZEN BUILDER ==================== */}
        {activeView === "shop" && (
          <motion.main
            key="shop-view"
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
            transition={{ duration: 0.35 }}
            className="max-w-6xl mx-auto px-6 pt-6 pb-40"
          >
            {/* HERO BANNER WITH PINK NYC CITYSCAPE SILHOUETTE & 3D DOZEN BOX */}
            <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#F9D5E5] via-[#FADCE6] to-[#E8DFF5] p-8 md:p-14 lg:p-16 pb-20 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-sm">
              {/* Animated Pink NYC Skyline Silhouette Along Bottom of Hero */}
              <NycSkylineOutline
                strokeColor="#DB2777"
                className="absolute bottom-0 inset-x-0 opacity-35"
              />

              <div className="relative z-10 max-w-lg space-y-5 text-center lg:text-left">
                <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur px-3.5 py-1 rounded-full text-[11px] uppercase tracking-[0.2em] text-pink-600 font-semibold shadow-2xs">
                  <MapPin className="w-3.5 h-3.5" /> Baked Fresh in New York City
                </span>
                <h1 className="text-4xl md:text-5xl font-light tracking-wide text-white drop-shadow-xs leading-tight uppercase">
                  100% Homemade.
                  <br />
                  <span className="font-semibold text-stone-800">
                    NYC’s Thickest Cookies.
                  </span>
                </h1>
                <p className="text-stone-700 text-sm md:text-base leading-relaxed">
                  Every dozen is baked fresh to order with up to{" "}
                  <strong>3 signature flavors per box (12 cookies)</strong>. Want
                  more than 3 flavors? Just keep tapping{" "}
                  <strong className="bg-white/80 px-2 py-0.5 rounded text-stone-900">
                    +
                  </strong>{" "}
                  and we’ll automatically open a <strong>separate dozen box</strong> for you!
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <a
                    href="#flavor-grid"
                    className="bg-stone-900 text-white px-7 py-3.5 rounded-full text-xs tracking-[0.2em] uppercase font-semibold shadow-sm hover:bg-pink-500 transition"
                  >
                    Build Dozen #{activeBoxIndex + 1}
                  </a>
                  <button
                    type="button"
                    onClick={spinMysteryDozen}
                    className="bg-white/90 text-stone-900 px-5 py-3.5 rounded-full text-xs tracking-[0.15em] uppercase font-semibold hover:bg-white transition flex items-center gap-2 shadow-2xs"
                  >
                    <Dices className="w-4 h-4 text-pink-500" /> Spin Mystery Trio
                  </button>
                </div>
              </div>

              {/* INTERACTIVE 3D DOZEN BOX SWITCHER & 12-SLOT TRAY */}
              <div className="relative z-10 bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white max-w-sm w-full space-y-4">
                {/* Confetti Celebration Particles on Complete Dozen */}
                <AnimatePresence>
                  {celebrateBurst && (
                    <motion.div
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 pointer-events-none flex items-center justify-center z-20"
                    >
                      {Array.from({ length: 14 }).map((_, i) => {
                        const angle = (i / 14) * Math.PI * 2;
                        return (
                          <motion.span
                            key={i}
                            initial={{ x: 0, y: 0, scale: 0 }}
                            animate={{
                              x: Math.cos(angle) * 120,
                              y: Math.sin(angle) * 120,
                              scale: [0, 1.3, 0],
                              rotate: 180,
                            }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="absolute text-lg"
                          >
                            {i % 2 === 0 ? "✨" : "🍪"}
                          </motion.span>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {boxes.map((b, idx) => {
                      const cCount = getBoxCookieCount(b);
                      const isActive = idx === activeBoxIndex;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveBoxIndex(idx)}
                          className={`relative px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition ${
                            isActive
                              ? "text-white"
                              : "bg-stone-100 text-stone-600 hover:bg-pink-50"
                          }`}
                        >
                          {isActive && (
                            <motion.span
                              layoutId="active-box-pill"
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 28,
                              }}
                              className="absolute inset-0 bg-stone-900 rounded-full -z-10"
                            />
                          )}
                          Dozen #{idx + 1} ({cCount}/12)
                        </button>
                      );
                    })}
                  </div>

                  {boxes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDozenBox(activeBoxIndex)}
                      className="text-stone-400 hover:text-rose-500 p-1"
                      title="Remove this dozen box"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* 3-Flavor Limit Meter */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-600">
                    Flavors in Dozen #{activeBoxIndex + 1}:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3].map((slot) => (
                      <span
                        key={slot}
                        className={`w-6 h-2 rounded-full transition-all ${
                          currentBoxFlavors >= slot
                            ? "bg-pink-500"
                            : "bg-stone-200"
                        }`}
                      />
                    ))}
                    <span className="text-[11px] font-bold text-pink-600 ml-1">
                      {currentBoxFlavors}/3 Max
                    </span>
                  </div>
                </div>

                {/* 12-Cookie Animated Tray with 3D Flip Between Boxes */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeBoxIndex}
                    initial={{ rotateY: 75, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -75, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    className="grid grid-cols-4 gap-2.5 py-1"
                  >
                    {Array.from({ length: COOKIES_PER_DOZEN }).map((_, idx) => {
                      const filledCookie = expandedActiveBoxCookies[idx];
                      return (
                        <motion.div
                          key={`${activeBoxIndex}-${idx}-${filledCookie?.id || "empty"}`}
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 450,
                            damping: 20,
                          }}
                          className={`aspect-square rounded-2xl flex items-center justify-center text-lg overflow-hidden border ${
                            filledCookie
                              ? `${filledCookie.bg} border-white shadow-inner`
                              : "bg-stone-100/70 border-dashed border-stone-300 text-stone-300"
                          }`}
                        >
                          {filledCookie ? (
                            <SmartCookieImage
                              cookie={filledCookie}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-bold">{idx + 1}</span>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>

                {/* Quick Evenly-Fill Button */}
                {currentBoxFlavors > 0 && currentBoxCookies < COOKIES_PER_DOZEN && (
                  <motion.button
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    type="button"
                    onClick={autoFillActiveDozen}
                    className="w-full py-2 px-3 rounded-xl bg-pink-100/90 hover:bg-pink-200 text-pink-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Evenly Fill Dozen #{activeBoxIndex + 1} to 12 Cookies
                  </motion.button>
                )}

                <p className="text-[11px] text-center text-stone-500">
                  {currentBoxCookies === COOKIES_PER_DOZEN
                    ? `✅ Dozen #${activeBoxIndex + 1} is complete! Pick another flavor to start Dozen #${
                        boxes.length + 1
                      }.`
                    : `Select up to ${MAX_FLAVORS_PER_DOZEN} flavors (${
                        COOKIES_PER_DOZEN - currentBoxCookies
                      } slots left in this dozen).`}
                </p>
              </div>
            </section>

            {/* ANIMATED EDITORIAL TICKER STRIP */}
            <div className="my-10 py-3.5 bg-[#FDF2F6] border-y border-pink-100 overflow-hidden rounded-2xl">
              <motion.div
                animate={{ x: ["0%", "-50%"] }}
                transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
                className="flex items-center gap-10 whitespace-nowrap text-[11px] uppercase tracking-[0.25em] font-semibold text-stone-600"
              >
                {Array.from({ length: 2 }).map((_, loopIdx) => (
                  <React.Fragment key={loopIdx}>
                    <span>★ Hand-Rolled in NYC</span>
                    <span className="text-pink-500">•</span>
                    <span>★ 18 Signature Flavors</span>
                    <span className="text-pink-500">•</span>
                    <span>★ Max 3 Flavors Per Dozen</span>
                    <span className="text-pink-500">•</span>
                    <span>★ 48-Hour Fresh Bake Lead Time</span>
                    <span className="text-pink-500">•</span>
                    <span>★ Local NYC Pickup & Nationwide Shipping</span>
                    <span className="text-pink-500">•</span>
                  </React.Fragment>
                ))}
              </motion.div>
            </div>

            {/* 1-CLICK CURATED NYC SIGNATURE TRIOS */}
            <section className="my-14 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-pink-500 font-bold">
                    Can’t Decide?
                  </span>
                  <h3 className="text-lg md:text-xl tracking-[0.18em] uppercase font-semibold text-stone-900 mt-0.5">
                    <span className="text-pink-400 font-bold mr-1">/</span> Mya’s 1-Click NYC Trio Boxes
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setBoxes((prev) => [...prev, {}]);
                    setActiveBoxIndex(boxes.length);
                    triggerToast(
                      `📦 Added Empty Dozen Box #${boxes.length + 1}!`
                    );
                  }}
                  className="text-xs font-semibold text-pink-600 hover:text-stone-900 flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" /> + Start Another Empty Dozen Box
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {CURATED_TRIOS.map((trio) => (
                  <motion.div
                    key={trio.title}
                    whileHover={{ y: -5 }}
                    className={`rounded-3xl p-6 bg-gradient-to-br ${trio.bg} border border-white shadow-sm flex flex-col justify-between gap-4`}
                  >
                    <div className="space-y-2">
                      <span className="inline-block bg-white/85 px-3 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-bold text-stone-700">
                        {trio.badge}
                      </span>
                      <h4 className="text-base font-bold text-stone-900">
                        {trio.title}
                      </h4>
                      <p className="text-xs text-stone-700 font-medium leading-relaxed">
                        {trio.subtitle}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => loadPresetDozen(trio.boxMap, trio.title)}
                      className="w-full bg-stone-900 hover:bg-pink-500 text-white py-2.5 px-4 rounded-full text-[11px] uppercase tracking-widest font-semibold transition"
                    >
                      Load Full Dozen (12 Cookies)
                    </button>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* SECTION HEADER: / FLAVOR MENU */}
            <div id="flavor-grid" className="text-center my-16 space-y-3">
              <h2 className="text-xl md:text-2xl tracking-[0.25em] uppercase font-medium text-stone-800">
                <span className="text-pink-400 font-bold mr-1">/</span> Build Your Custom Dozen
              </h2>
              <p className="text-stone-500 text-sm max-w-2xl mx-auto">
                Currently editing{" "}
                <strong className="text-stone-900 underline decoration-pink-400">
                  Dozen Box #{activeBoxIndex + 1}
                </strong>{" "}
                ({currentBoxFlavors}/3 flavors chosen • {currentBoxCookies}/12 cookies).
                Adding a 4th flavor automatically starts your next dozen!
              </p>
            </div>

            {/* 18 COOKIE FLAVORS — 3D MAGNETIC PASTEL CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-9">
              {cookies.map((cookie, index) => {
                const qtyInActiveBox = currentBox[cookie.id] || 0;
                const totalQtyAllBoxes = boxes.reduce(
                  (sum, b) => sum + (b[cookie.id] || 0),
                  0
                );
                const isNewFlavorLockedInActiveBox =
                  qtyInActiveBox === 0 &&
                  currentBoxFlavors >= MAX_FLAVORS_PER_DOZEN;

                return (
                  <CookieCard3D
                    key={cookie.id}
                    cookie={cookie}
                    index={index}
                    qtyInActiveBox={qtyInActiveBox}
                    totalQtyAllBoxes={totalQtyAllBoxes}
                    activeBoxIndex={activeBoxIndex}
                    isNewFlavorLockedInActiveBox={isNewFlavorLockedInActiveBox}
                    onAdd={() => handleAddCookie(cookie.id)}
                    onRemove={() => handleRemoveCookie(cookie.id)}
                  />
                );
              })}
            </div>

            {/* WORD ON THE NYC STREETS — INTERACTIVE TESTIMONIALS */}
            <section className="mt-28 space-y-10">
              <div className="text-center space-y-2">
                <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-pink-500 font-bold">
                  <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400" /> NYC Love Notes
                </span>
                <h2 className="text-xl md:text-2xl tracking-[0.25em] uppercase font-medium text-stone-800">
                  <span className="text-pink-400 font-bold mr-1">/</span> Word On The NYC Streets
                </h2>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Real orders from cookie lovers across the 5 boroughs. Tap any review to load their exact 3-flavor dozen!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
                {NYC_TESTIMONIALS.map((review, i) => (
                  <motion.div
                    key={review.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -6 }}
                    className={`${review.bg} border border-pink-100 rounded-3xl p-7 flex flex-col justify-between gap-5 shadow-xs`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-400">
                          {Array.from({ length: review.rating }).map((_, idx) => (
                            <Star
                              key={idx}
                              className="w-4 h-4 fill-amber-400 text-amber-400"
                            />
                          ))}
                        </div>
                        <span className="text-[10px] uppercase tracking-widest font-semibold text-stone-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-pink-500" /> {review.borough}
                        </span>
                      </div>

                      <p className="text-xs md:text-sm text-stone-700 leading-relaxed italic font-serif">
                        “{review.quote}”
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-200/60 space-y-3">
                      <div>
                        <p className="text-xs font-bold text-stone-900">
                          — {review.name}
                        </p>
                        <p className="text-[11px] text-pink-700 font-medium mt-0.5">
                          Ordered: {review.boxLabel}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          loadPresetDozen(
                            review.boxMap,
                            `${review.name}'s NYC Dozen`
                          )
                        }
                        className="w-full py-2 px-3 rounded-full bg-white hover:bg-stone-900 hover:text-white text-stone-800 border border-stone-200 text-[11px] uppercase tracking-wider font-semibold transition"
                      >
                        🍪 Order {review.name.split(" ")[0]}’s Exact Dozen
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* 3-COLUMN SERVICE HIGHLIGHT STRIP */}
            <section className="mt-24 pt-12 border-t border-stone-100 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-200 text-center">
              <div className="p-6 space-y-2">
                <ShoppingBag className="w-7 h-7 mx-auto text-stone-700 stroke-[1.5]" />
                <h4 className="text-xs tracking-[0.2em] uppercase font-semibold">
                  NYC Local Pickup
                </h4>
                <p className="text-xs text-stone-500">
                  48-hr advance notice • 15-min pickup grace window
                </p>
              </div>
              <div className="p-6 space-y-2">
                <Truck className="w-7 h-7 mx-auto text-stone-700 stroke-[1.5]" />
                <h4 className="text-xs tracking-[0.2em] uppercase font-semibold">
                  NYC Delivery & Shipping
                </h4>
                <p className="text-xs text-stone-500">
                  Heat-sealed for freshness with live tracking updates
                </p>
              </div>
              <div className="p-6 space-y-2">
                <Clock className="w-7 h-7 mx-auto text-stone-700 stroke-[1.5]" />
                <h4 className="text-xs tracking-[0.2em] uppercase font-semibold">
                  24-Hr Personal Check-In
                </h4>
                <p className="text-xs text-stone-500">
                  Mya personally contacts you 24 hours before your bake date
                </p>
              </div>
            </section>
          </motion.main>
        )}

        {/* ==================== VIEW 2: ORDER TRACKER & ROUTER ==================== */}
        {activeView === "track" && (
          <motion.section
            key="track-view"
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
            transition={{ duration: 0.35 }}
            className="max-w-3xl mx-auto px-6 py-16"
          >
            <div className="text-center space-y-3 mb-10">
              <h2 className="text-2xl tracking-[0.25em] uppercase font-medium">
                <span className="text-pink-400 font-bold mr-1">/</span> Track Your Order
              </h2>
              <p className="text-sm text-stone-500">
                Enter your MuncheezByMya Order ID (try{" "}
                <button
                  type="button"
                  onClick={() => setTrackQuery("MBM-1042")}
                  className="underline text-pink-600 font-medium"
                >
                  MBM-1042
                </button>{" "}
                or{" "}
                <button
                  type="button"
                  onClick={() => setTrackQuery("MBM-1039")}
                  className="underline text-pink-600 font-medium"
                >
                  MBM-1039
                </button>
                ) to see live payment, baking, pickup, or shipping status.
              </p>
            </div>

            <div className="flex gap-3 max-w-md mx-auto mb-10">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  placeholder="Enter Order ID (e.g. MBM-1042)"
                  className="w-full pl-11 pr-4 py-3 rounded-full border border-stone-200 text-sm focus:outline-none focus:border-pink-400"
                />
              </div>
            </div>

            {trackedOrder ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-stone-50/70 border border-stone-200/80 rounded-3xl p-8 space-y-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-5">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-stone-400">
                      Order Reference
                    </span>
                    <h3 className="text-2xl font-bold text-stone-900">
                      {trackedOrder.id}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {trackedOrder.customerName} • {trackedOrder.email} • Placed{" "}
                      {trackedOrder.createdAt}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${
                      ORDER_STATUS_META[trackedOrder.status].badge
                    }`}
                  >
                    {ORDER_STATUS_META[trackedOrder.status].label}
                  </span>
                </div>

                {trackedOrder.status !== "cancelled_no_refund" && (
                  <div className="grid grid-cols-5 gap-2 pt-2">
                    {[
                      "Payment Pending",
                      "Payment Received",
                      "In the Oven",
                      "24h Check-In",
                      trackedOrder.fulfillment === "shipping"
                        ? "Shipped"
                        : "Ready / Delivery",
                    ].map((label, idx) => {
                      const currentStep =
                        ORDER_STATUS_META[trackedOrder.status].step || 1;
                      const active = idx + 1 <= currentStep;
                      return (
                        <div key={label} className="space-y-2 text-center">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              active ? "bg-pink-400" : "bg-stone-200"
                            }`}
                          />
                          <p
                            className={`text-[10px] uppercase tracking-wider ${
                              active
                                ? "text-stone-800 font-semibold"
                                : "text-stone-400"
                            }`}
                          >
                            {label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="bg-white p-5 rounded-2xl border border-stone-100 space-y-2">
                  <p className="text-sm font-medium text-stone-800">
                    {ORDER_STATUS_META[trackedOrder.status].desc}
                  </p>
                  {trackedOrder.status === "payment_pending" && (
                    <div className="pt-2 text-xs text-stone-600 space-y-1">
                      <p>
                        • Send <strong>${trackedOrder.total.toFixed(2)}</strong> via{" "}
                        <strong>{trackedOrder.paymentMethod}</strong> (Cash App:{" "}
                        <code className="bg-pink-50 px-1.5 py-0.5 rounded text-pink-700 font-semibold">
                          {storeConfig.cashAppTag}
                        </code>{" "}
                        | Zelle:{" "}
                        <code className="bg-pink-50 px-1.5 py-0.5 rounded text-pink-700 font-semibold">
                          {storeConfig.zelleContact}
                        </code>
                        )
                      </p>
                      <p>
                        • Include Order ID <strong>{trackedOrder.id}</strong> in the payment note within 24 hours.
                      </p>
                    </div>
                  )}
                  {trackedOrder.trackingNumber && (
                    <p className="text-xs font-semibold text-sky-700 pt-1">
                      📦 Tracking / Courier Number: {trackedOrder.trackingNumber}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white p-4 rounded-2xl border border-stone-100 space-y-1">
                    <span className="text-stone-400 uppercase tracking-wider">
                      Fulfillment & Date
                    </span>
                    <p className="font-semibold text-stone-800 uppercase">
                      {trackedOrder.fulfillment} • {trackedOrder.scheduledDate} at{" "}
                      {trackedOrder.scheduledTime}
                    </p>
                    <p className="text-stone-500">{trackedOrder.address}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-stone-100 space-y-1">
                    <span className="text-stone-400 uppercase tracking-wider">
                      Custom Dozen Breakdown
                    </span>
                    <div className="space-y-1 pt-1">
                      {trackedOrder.items.map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <span>
                            {item.boxNumber ? `Dozen #${item.boxNumber}: ` : ""}
                            {item.name}
                          </span>
                          <span className="font-semibold">x{item.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-12 bg-stone-50 rounded-3xl border border-stone-100">
                <p className="text-sm text-stone-500">
                  No order found matching <strong>{trackQuery}</strong>. Double-check your confirmation code!
                </p>
              </div>
            )}
          </motion.section>
        )}

        {/* ==================== VIEW 3: STORE POLICIES ==================== */}
        {activeView === "policies" && (
          <motion.section
            key="policies-view"
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
            transition={{ duration: 0.35 }}
            className="max-w-4xl mx-auto px-6 py-16 space-y-10"
          >
            <div className="text-center space-y-3">
              <h2 className="text-2xl tracking-[0.25em] uppercase font-medium">
                <span className="text-pink-400 font-bold mr-1">/</span> Ordering & Pickup Policies
              </h2>
              <p className="text-sm text-stone-500">
                Please review Mya’s house policies before placing your order. Questions? Email{" "}
                <a
                  href={`mailto:${storeConfig.bakerEmail}`}
                  className="text-pink-600 font-semibold underline"
                >
                  {storeConfig.bakerEmail}
                </a>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-[#FADCE6]/40 border border-pink-100 space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                  1. 12-Cookie Minimum & Max 3 Flavors Per Dozen
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Every batch is baked fresh by the dozen (12 cookies). Each dozen can include up to <strong>3 cookie flavors</strong>. Want more than 3 flavors? Additional flavors automatically start a separate dozen box!
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-[#CBE8E0]/40 border border-teal-100 space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                  2. 48-Hour Lead Time & Rescheduling
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  All pickup, local delivery, and shipping orders must be placed at least <strong>48 hours in advance</strong>. Need to reschedule? You must notify Mya at least <strong>24 hours before</strong> your initial pickup/delivery date.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-[#E2DCF7]/40 border border-purple-100 space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                  3. 24-Hour Payment Window (Cash App & Zelle)
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Payment must be sent via <strong>Cash App ({storeConfig.cashAppTag})</strong> or <strong>Zelle ({storeConfig.zelleContact})</strong> within <strong>24 hours of placing your order</strong>. Orders unpaid after 24 hours are automatically released. Mya will contact you <strong>24 hours prior</strong> to your pickup/delivery date to confirm.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-[#FBE6C8]/50 border border-amber-100 space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                  4. 15-Minute Pickup Grace Period
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Orders must be picked up within <strong>15 minutes</strong> of your scheduled pickup time. If missed, Mya will contact you to arrange pickup the <strong>next day</strong>. If the order is still not picked up the next day, the order is <strong>cancelled without refund</strong>.
                </p>
              </div>
            </div>
          </motion.section>
        )}

        {/* ==================== VIEW 4: MYA'S ADMIN PANEL ==================== */}
        {activeView === "admin" && (
          <motion.section
            key="admin-view"
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
            transition={{ duration: 0.35 }}
            className="max-w-6xl mx-auto px-6 py-12"
          >
            {!adminUnlocked ? (
              <div className="max-w-sm mx-auto bg-stone-50 p-8 rounded-3xl border border-stone-200 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold">Mya’s Baker Dashboard</h3>
                <p className="text-xs text-stone-500">
                  Enter your Admin PIN to manage orders sent to{" "}
                  <strong>{storeConfig.bakerEmail}</strong>, verify Cash App / Zelle payments, and toggle cookie flavors. (Demo PIN: <strong>1234</strong>)
                </p>
                <input
                  type="password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="Enter PIN (1234)"
                  className="w-full px-4 py-2.5 text-center rounded-xl border border-stone-300 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (adminPin === "1234") setAdminUnlocked(true);
                  }}
                  className="w-full bg-stone-900 text-white py-3 rounded-xl text-xs uppercase tracking-widest font-semibold hover:bg-pink-500 transition"
                >
                  Unlock Admin Panel
                </button>
              </div>
            ) : (
              <div className="space-y-12">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold">Mya’s Admin & Order Router</h2>
                    <p className="text-xs text-stone-500">
                      Connected Baker Inbox: <strong className="text-pink-600">{storeConfig.bakerEmail}</strong> • Manage incoming orders, send 1-click Gmail updates, or toggle flavors.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        downloadRemaining8CookieJpgs();
                        triggerToast(
                          "📸 Downloading 4K (2048x2048) JPGs for the remaining 8 cookies!"
                        );
                      }}
                      className="flex items-center gap-1.5 bg-pink-100 hover:bg-pink-200 text-pink-900 px-4 py-2 rounded-full text-xs font-semibold transition"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Remaining 8 Cookie 4K JPGs
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminUnlocked(false)}
                      className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900"
                    >
                      <LogOut className="w-4 h-4" /> Lock Dashboard
                    </button>
                  </div>
                </div>

                {/* ORDER ROUTER TABLE */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-stone-700">
                    Live Order Router ({orders.length})
                  </h3>
                  <div className="grid gap-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-sm"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-bold text-base">{order.id}</span>
                            <span
                              className={`px-3 py-0.5 rounded-full text-[11px] font-semibold border ${
                                ORDER_STATUS_META[order.status].badge
                              }`}
                            >
                              {ORDER_STATUS_META[order.status].label}
                            </span>
                            <span className="text-xs bg-stone-100 px-2.5 py-0.5 rounded-full font-medium uppercase">
                              {order.fulfillment}
                            </span>
                            {order.emailDispatched && (
                              <span className="text-[11px] bg-pink-50 text-pink-700 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                                <Mail className="w-3 h-3" /> Sent to {MYA_EMAIL}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-600">
                            <strong>{order.customerName}</strong> • {order.phone} •{" "}
                            <span className="text-stone-500">{order.email}</span> • Scheduled:{" "}
                            <strong>
                              {order.scheduledDate} @ {order.scheduledTime}
                            </strong>{" "}
                            • {order.paymentMethod} (${order.total.toFixed(2)})
                          </p>
                          <p className="text-xs text-stone-500">
                            Items:{" "}
                            {order.items
                              .map(
                                (i) =>
                                  `${i.boxNumber ? `[Box #${i.boxNumber}] ` : ""}${
                                    i.qty
                                  }x ${i.name}`
                              )
                              .join(", ")}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                          <select
                            value={order.status}
                            onChange={(e) => {
                              const nextStatus = e.target.value as OrderStatus;
                              setOrders((prev) =>
                                prev.map((o) =>
                                  o.id === order.id ? { ...o, status: nextStatus } : o
                                )
                              );
                            }}
                            className="text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-medium"
                          >
                            <option value="payment_pending">
                              1. Awaiting Payment (24h)
                            </option>
                            <option value="payment_received">
                              2. Payment Received (CashApp/Zelle)
                            </option>
                            <option value="baking">3. In the Oven</option>
                            <option value="confirmed_24h">
                              4. 24hr Confirmation Contacted
                            </option>
                            <option value="ready_or_shipped">
                              5. Ready for Pickup / Shipped
                            </option>
                            <option value="grace_period_missed">
                              ⚠️ Missed 15m Grace (Next-Day Hold)
                            </option>
                            <option value="cancelled_no_refund">
                              ❌ Cancelled (No Refund)
                            </option>
                          </select>

                          <input
                            type="text"
                            placeholder="Tracking # / Pickup Note"
                            value={order.trackingNumber}
                            onChange={(e) => {
                              const val = e.target.value;
                              setOrders((prev) =>
                                prev.map((o) =>
                                  o.id === order.id
                                    ? { ...o, trackingNumber: val }
                                    : o
                                )
                              );
                            }}
                            className="text-xs border border-stone-300 rounded-xl px-3 py-2 w-44"
                          />

                          <a
                            href={buildCustomerGmailComposeUrl(order)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-pink-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition"
                            title={`Open Gmail pre-filled to ${order.email}`}
                          >
                            <Mail className="w-3.5 h-3.5" /> Email Customer
                            <ExternalLink className="w-3 h-3 opacity-75" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FLAVOR INVENTORY MANAGER */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-stone-700">
                    18 Cookie Flavors — Stock & Price Manager
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {cookies.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl border border-stone-200 bg-white"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-stone-100 flex items-center justify-center text-xl">
                            <SmartCookieImage
                              cookie={c}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-xs font-bold">{c.name}</p>
                            <p className="text-[11px] text-stone-500">
                              ${c.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setCookies((prev) =>
                              prev.map((item) =>
                                item.id === c.id
                                  ? { ...item, inStock: !item.inStock }
                                  : item
                              )
                            )
                          }
                          className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${
                            c.inStock
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-stone-200 text-stone-600"
                          }`}
                        >
                          {c.inStock ? "In Stock" : "Sold Out"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* ==================== STICKY MULTI-DOZEN PROGRESS DOCK ==================== */}
      {activeView === "shop" && totalCookiesAllBoxes > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-5 inset-x-0 z-40 px-4"
        >
          <div className="max-w-4xl mx-auto bg-stone-900/95 backdrop-blur-md text-white rounded-3xl p-4 px-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-400 text-stone-900 font-bold flex flex-col items-center justify-center leading-tight">
                <span className="text-sm">{nonEmptyBoxes.length}</span>
                <span className="text-[9px] uppercase tracking-wider">
                  {nonEmptyBoxes.length === 1 ? "Dozen" : "Dozens"}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {boxes.map((b, i) => {
                    const count = getBoxCookieCount(b);
                    const fCount = getBoxFlavorCount(b);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveBoxIndex(i)}
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold transition ${
                          i === activeBoxIndex
                            ? "bg-pink-400 text-stone-900"
                            : "bg-stone-800 text-stone-300"
                        }`}
                      >
                        Box #{i + 1}: {count}/12 ({fCount}/3 flavors)
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-stone-300 mt-1">
                  Subtotal: <strong>${subtotal.toFixed(2)}</strong> •{" "}
                  {allBoxesComplete
                    ? "All dozen boxes complete!"
                    : `Finish filling Dozen #${activeBoxIndex + 1} to 12 cookies`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {currentBoxFlavors > 0 && currentBoxCookies < COOKIES_PER_DOZEN && (
                <button
                  type="button"
                  onClick={autoFillActiveDozen}
                  className="text-xs bg-stone-800 hover:bg-stone-700 text-pink-300 px-4 py-2.5 rounded-full font-semibold transition"
                >
                  Auto-Fill Box #{activeBoxIndex + 1}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setBoxes([{}]);
                  setActiveBoxIndex(0);
                }}
                className="text-xs text-stone-400 hover:text-white px-2 py-2"
              >
                Reset
              </button>
              <button
                type="button"
                disabled={!allBoxesComplete}
                onClick={() => setIsCheckoutOpen(true)}
                className="flex-1 md:flex-initial bg-pink-400 text-stone-900 px-6 py-3 rounded-full text-xs uppercase tracking-widest font-bold disabled:opacity-40 hover:bg-pink-300 transition"
              >
                {allBoxesComplete
                  ? `Checkout (${nonEmptyBoxes.length} Dozen)`
                  : `Fill Box #${activeBoxIndex + 1} (${currentBoxCookies}/12)`}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ==================== CHECKOUT & POLICY MODAL ==================== */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
            >
              {confirmedOrder ? (
                <div className="text-center space-y-5 py-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold">
                      Order Reserved: {confirmedOrder.id}
                    </h3>
                    <p className="text-xs font-medium text-emerald-700 flex items-center justify-center gap-1">
                      <Mail className="w-3.5 h-3.5" /> Order details sent directly to Mya ({storeConfig.bakerEmail})
                    </p>
                  </div>
                  <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                    To lock in your baking slot, please complete your{" "}
                    <strong>${confirmedOrder.total.toFixed(2)}</strong> payment within{" "}
                    <strong>24 hours</strong> using{" "}
                    <strong>{confirmedOrder.paymentMethod}</strong> and include your Order ID in the memo!
                  </p>

                  <div className="bg-pink-50/80 border border-pink-200 rounded-2xl p-4 text-left space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span>
                        <strong>Cash App:</strong> {storeConfig.cashAppTag}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(storeConfig.cashAppTag)}
                        className="text-pink-700 font-semibold flex items-center gap-1"
                      >
                        {copiedText === storeConfig.cashAppTag ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}{" "}
                        Copy
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>
                        <strong>Zelle:</strong> {storeConfig.zelleContact}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(storeConfig.zelleContact)}
                        className="text-pink-700 font-semibold flex items-center gap-1"
                      >
                        {copiedText === storeConfig.zelleContact ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}{" "}
                        Copy
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-500 pt-1">
                      Memo / Note: <strong>{confirmedOrder.id}</strong> • Mya will contact you 24 hours prior to your scheduled {confirmedOrder.fulfillment} ({confirmedOrder.scheduledDate}).
                    </p>
                  </div>

                  <div className="flex gap-3 justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmedOrder(null);
                        setIsCheckoutOpen(false);
                        setActiveView("track");
                      }}
                      className="bg-stone-900 text-white px-6 py-3 rounded-full text-xs uppercase tracking-widest font-semibold"
                    >
                      Track My Order Status
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePlaceOrder} className="space-y-5">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <h3 className="text-lg font-bold">
                      Checkout ({nonEmptyBoxes.length} Dozen • {totalCookiesAllBoxes} Cookies)
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsCheckoutOpen(false)}
                      className="text-xs text-stone-400 hover:text-stone-800"
                    >
                      Close ✕
                    </button>
                  </div>

                  <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80 space-y-2 text-xs">
                    {nonEmptyBoxes.map((b, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="font-bold text-stone-800">
                          Dozen Box #{idx + 1}:
                        </span>
                        <span className="text-stone-600">
                          {Object.entries(b)
                            .map(([id, q]) => {
                              const c = cookies.find((item) => item.id === id);
                              return `${q}x ${c?.name || id}`;
                            })
                            .join(", ")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: "pickup", label: "NYC Pickup (Free)" },
                        { id: "delivery", label: "NYC Delivery (+$12)" },
                        { id: "shipping", label: "Shipping (+$9.99)" },
                      ] as { id: FulfillmentType; label: string }[]
                    ).map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() =>
                          setForm((prev) => ({ ...prev, fulfillment: opt.id }))
                        }
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition ${
                          form.fulfillment === opt.id
                            ? "bg-pink-100 border-pink-400 text-stone-900"
                            : "border-stone-200 text-stone-500"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      required
                      type="text"
                      placeholder="Full Name"
                      value={form.customerName}
                      onChange={(e) =>
                        setForm({ ...form, customerName: e.target.value })
                      }
                      className="px-4 py-2.5 rounded-xl border border-stone-200 text-xs"
                    />
                    <input
                      required
                      type="tel"
                      placeholder="Cell Phone (for 24hr confirmation)"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      className="px-4 py-2.5 rounded-xl border border-stone-200 text-xs"
                    />
                  </div>

                  <input
                    required
                    type="email"
                    placeholder="Your Email Address (for order confirmation & updates)"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs"
                  />

                  {form.fulfillment !== "pickup" && (
                    <input
                      required
                      type="text"
                      placeholder="Full Delivery / Shipping Street Address, Apt, ZIP"
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs"
                    />
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                        Date (Min. 48 Hours Advance Notice)
                      </label>
                      <input
                        required
                        type="date"
                        min={minDateString}
                        value={form.scheduledDate}
                        onChange={(e) =>
                          setForm({ ...form, scheduledDate: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                        Preferred Pickup / Delivery Time
                      </label>
                      <select
                        value={form.scheduledTime}
                        onChange={(e) =>
                          setForm({ ...form, scheduledTime: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs bg-white"
                      >
                        <option>12:00 PM</option>
                        <option>2:00 PM</option>
                        <option>4:00 PM</option>
                        <option>6:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Select Payment Method (Due Within 24 Hours)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["Cash App", "Zelle"] as PaymentMethod[]).map(
                        (method) => (
                          <button
                            type="button"
                            key={method}
                            onClick={() =>
                              setForm({ ...form, paymentMethod: method })
                            }
                            className={`py-2.5 rounded-xl text-xs font-semibold border ${
                              form.paymentMethod === method
                                ? "bg-stone-900 text-white border-stone-900"
                                : "border-stone-200 text-stone-600"
                            }`}
                          >
                            {method}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2.5 text-xs text-stone-700">
                    <p className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                      Required MuncheezByMya Policy Agreements:
                    </p>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        required
                        type="checkbox"
                        checked={form.agree24hrPayment}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            agree24hrPayment: e.target.checked,
                          })
                        }
                        className="mt-0.5"
                      />
                      <span>
                        I understand payment via <strong>Cash App or Zelle ({storeConfig.zelleContact})</strong> must be made within <strong>24 hours</strong> of ordering or my order is cancelled.
                      </span>
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        required
                        type="checkbox"
                        checked={form.agree48hrLeadAndReschedule}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            agree48hrLeadAndReschedule: e.target.checked,
                          })
                        }
                        className="mt-0.5"
                      />
                      <span>
                        I understand Mya will contact me <strong>24 hours before</strong> my date, and any rescheduling must be requested at least <strong>24 hours prior</strong>.
                      </span>
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        required
                        type="checkbox"
                        checked={form.agree15minGracePolicy}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            agree15minGracePolicy: e.target.checked,
                          })
                        }
                        className="mt-0.5"
                      />
                      <span>
                        <strong>15-Minute Pickup Grace Rule:</strong> Orders must be picked up within 15 minutes of pickup time, or Mya will reschedule for the next day. If still unclaimed the next day, the order is <strong>cancelled without refund</strong>.
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <div className="text-xs">
                      <span className="text-stone-500">Total Due: </span>
                      <strong className="text-lg text-stone-900">
                        ${(subtotal + fulfillmentFee).toFixed(2)}
                      </strong>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingOrder}
                      className="bg-pink-400 hover:bg-pink-500 disabled:opacity-60 text-stone-900 font-bold text-xs uppercase tracking-widest px-7 py-3.5 rounded-full transition flex items-center gap-2"
                    >
                      {isSubmittingOrder ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Sending Order to Mya...
                        </>
                      ) : (
                        "Place Order & Email Mya"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL-WIDTH ANIMATED PINK NYC SKYLINE HORIZON ABOVE FOOTER */}
      <div className="mt-16 pt-6 bg-gradient-to-b from-white via-[#FFF7FA] to-[#FDF2F6]">
        <div className="max-w-6xl mx-auto px-6 text-center mb-2">
          <span className="text-[10px] uppercase tracking-[0.35em] text-pink-400 font-bold">
            From New York City, With Love & Butter
          </span>
        </div>
        <NycSkylineOutline strokeColor="#EC4899" />
      </div>

      {/* SOFT PASTEL PINK FOOTER */}
      <footer className="bg-[#FDF2F6] border-t border-pink-200/60">
        <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-xs text-stone-600">
          <div className="space-y-2">
            <h5 className="uppercase tracking-[0.2em] font-semibold text-stone-900">
              Shop
            </h5>
            <ul className="space-y-1.5">
              <li>
                <button type="button" onClick={() => setActiveView("shop")}>
                  Build Your Dozen
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setActiveView("policies")}>
                  Store Policies & FAQ
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setActiveView("track")}>
                  Live Order Tracker
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="uppercase tracking-[0.2em] font-semibold text-stone-900">
              Ordering Rules
            </h5>
            <p>12 Cookies Per Dozen (Max 3 Flavors/Box)</p>
            <p>Lead Time: 48 Hours Advance</p>
            <p>Pickup Grace Period: 15 Mins</p>
          </div>

          <div className="space-y-2">
            <h5 className="uppercase tracking-[0.2em] font-semibold text-stone-900">
              Location & Contact
            </h5>
            <p>New York City, NY (Pickup & Shipping)</p>
            <p>
              Email:{" "}
              <a
                href={`mailto:${storeConfig.bakerEmail}`}
                className="underline text-pink-700 font-medium"
              >
                {storeConfig.bakerEmail}
              </a>
            </p>
            <p className="text-pink-700 font-medium">
              Cash App & Zelle Accepted
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="uppercase tracking-[0.2em] font-semibold text-stone-900">
              Get It Fresh
            </h5>
            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-pink-200 text-xs"
            />
            <button
              type="button"
              className="w-full bg-[#F4C2D7] hover:bg-pink-300 text-stone-800 font-semibold py-2.5 rounded-lg uppercase tracking-widest text-[11px] transition"
            >
              Subscribe for Restocks
            </button>
          </div>
        </div>
        <div className="text-center py-4 text-[11px] text-stone-400 border-t border-pink-100/80">
          © 2026 by MuncheezByMya NYC ({storeConfig.bakerEmail}). Crafted with React, TypeScript, Tailwind & Framer Motion.
        </div>
      </footer>
    </div>
  );
}