import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Spyfall Digital",
    short_name: "Spyfall",
    description: "A digital adaptation of the social deduction game Spyfall",
    start_url: "/",
    display: "standalone",
    background_color: "#eef3f8",
    theme_color: "#f4f7fb",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["games", "entertainment"],
  };
}
