import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwind from "@tailwindcss/vite"
import { viteSingleFile } from "vite-plugin-singlefile"
import path from "path"
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwind(), ...(mode === "single" ? [viteSingleFile()] : [])],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
}))
