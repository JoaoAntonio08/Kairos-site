import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@fontsource/cormorant-garamond/500-italic.css"
import "./index.css"
import App from "./App"
createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>)
