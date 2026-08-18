import "./globals.css";

export const metadata = {
  title: "RAG Chat",
  description: "Real-Time RAG Chat Platform with Supabase + LangChain + Vercel AI SDK",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased overflow-x-hidden">{children}</body>
    </html>
  );
}
