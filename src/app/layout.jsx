import { Archivo, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ShopProvider } from "@/store/shop";
import SmoothScroll from "@/components/layout/SmoothScroll";
import Intro from "@/components/layout/Intro";
import Header from "@/components/layout/Header";
import MobileMenu from "@/components/layout/MobileMenu";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import SearchOverlay from "@/components/search/SearchOverlay";
import QuickView from "@/components/product/QuickView";

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

const SITE_URL = "https://hvnutrition.in";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "HV Nutrition — Whey Protein, Creatine & Sports Nutrition, Surat",
    template: "%s — HV Nutrition",
  },
  description:
    "HV Nutrition is a sports nutrition store from Surat. Shop HV Whey Protein alongside Wellcore creatine, MuscleBlaze and Rebuild supplements.",
  openGraph: {
    type: "website",
    siteName: "HV Nutrition",
    locale: "en_IN",
    images: [{ url: "/assets/Black HV Nutrition Whey Protein Tub.png", width: 1170, height: 1344, alt: "HV Nutrition Whey Protein" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport = {
  themeColor: "#090909",
  colorScheme: "dark",
};

// Decides before first paint whether the once-per-session intro plays.
const introScript = `document.documentElement.classList.add('js');try{if(!sessionStorage.getItem('hv-intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.dataset.intro='play'}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN" className={`${archivo.variable} ${manrope.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        <style>{`html[data-intro="play"] .intro{display:flex}html.js [data-hero-hide]{visibility:hidden}`}</style>
      </head>
      <body className="min-h-dvh">
        <ShopProvider>
          <Intro />
          <SmoothScroll />
          <Header />
          <MobileMenu />
          <main id="main">{children}</main>
          <Footer />
          <CartDrawer />
          <SearchOverlay />
          <QuickView />
        </ShopProvider>
      </body>
    </html>
  );
}
