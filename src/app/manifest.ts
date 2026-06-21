import type { MetadataRoute } from "next";

// Web app manifest: makes the app installable ("Add to Home Screen") and
// launch full-screen like a native app on phones.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SCAD Atlanta Distance Team Hub",
    short_name: "SCAD Distance",
    description:
      "Private training hub for the SCAD Atlanta distance squad. Schedules, calendar, messaging, and feedback.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#13171F",
    theme_color: "#13171F",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
