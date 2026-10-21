import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "app.icheque",
  appName: "iCheque",
  webDir: "www",
  server: {
    url: "https://i-cheque.vercel.app",
    androidScheme: "https",
  },
}

export default config
