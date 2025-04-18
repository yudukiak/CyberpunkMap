import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

const URL = "https://cyberpunk.ydk.vc";

const og = {  
  url: URL,
  title: "Cyberpunk Map",
  description: [
    "よぉ、チューマ。",
    "お前の手元にある携帯通信端末（エージェント）を活用しないのか？",
    "ナイトシティの裏路地から高層ビル群まで──",
    "お前らの視点で電脳と現実が交差するインタラクティブな体験が簡単にできるんだぜ。",
    "このサービスを使えばな。",
    "さて、お前らはどこに行くつもりなんだ？",
  ].join(""),
  image: `${URL}/ogp.png`,
  imageAlt: "ナイトシティの裏路地から高層ビル群まで探索しろ。",
  color: "#cc2d17",  
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  // Favicon & Icons
  { rel: "icon", type: "image/png", sizes: "96x96", href: "/favicon-96x96.png" },
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  { rel: "mask-icon", href: "/favicon.svg", color: og.color },
  { rel: "shortcut icon", href: "/favicon.ico" },
  { rel: "apple-touch-icon", href: "/favicon.ico" },
  { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
  { rel: "manifest", href: "/site.webmanifest" },
  { rel: "canonical", href: URL },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="apple-mobile-web-app-title" content="Cyberpunk Map" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content={og.color} />
        <meta name="msapplication-TileColor" content={og.color} />
        <meta name="msapplication-TileImage" content="/mstile-150x150.png" />
        <Meta />
        <Links />
        <meta name="description" content={og.description} />
        <meta property="article:author" content="https://twitter.com/yudukiak" />
        <meta property="og:url" content={og.url} />
        <meta property="og:title" content={og.title} />
        <meta property="og:description" content={og.description} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={og.title} />
        <meta property="og:locale" content="ja_JP" />
        <meta property="og:image" content={og.image} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={og.imageAlt} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@yudukiak" />
        <meta name="twitter:title" content={og.title} />
        <meta name="twitter:description" content={og.description} />
        <meta name="twitter:image" content={og.image} />
        <meta name="twitter:image:alt" content={og.imageAlt} />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
