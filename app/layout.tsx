import type { Metadata } from "next";
import { headers } from "next/headers";
import { DM_Sans, Manrope } from "next/font/google";
import "./globals.css";

const body = DM_Sans({ variable: "--font-body", subsets: ["latin"] });
const display = Manrope({ variable: "--font-display", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;
  const title = "Vita Guia | Tu biblioteca de bienestar";
  const description = "Productos, rutinas, videos y respuestas en una guia privada y sencilla.";
  return { title, description, openGraph:{ title, description, images:[image] }, twitter:{ card:"summary_large_image", title, description, images:[image] } };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body className={`${body.variable} ${display.variable}`}>{children}</body></html>;
}
