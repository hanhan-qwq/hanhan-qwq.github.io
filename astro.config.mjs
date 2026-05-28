import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://hanhan-qwq.github.io",
  integrations: [tailwind()],
});
