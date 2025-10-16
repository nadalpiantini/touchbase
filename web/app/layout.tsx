import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TouchBase - Your Dugout in the Cloud",
  description: "Sistema moderno de gestión de clubes deportivos. Your dugout in the cloud.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Root layout without <html> - handled by [locale] layout
  return children;
}
