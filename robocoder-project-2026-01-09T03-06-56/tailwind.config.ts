import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Paleta de colores de Formulaciones Di Rosa
        primary: {
          50: "#f7f8f0",
          100: "#eef0e1",
          200: "#dde2c4",
          300: "#c7ca65", // Color principal
          400: "#b8bc4a",
          500: "#a3a73d",
          600: "#82801a", // Verde oliva oscuro
          700: "#6b6a16",
          800: "#565515",
          900: "#484715",
        },
        secondary: {
          50: "#f8f8f3",
          100: "#f1f1e7",
          200: "#e3e3cf",
          300: "#d1d08f", // Verde oliva suave
          400: "#c4c373",
          500: "#b5b45a",
          600: "#a09f4a",
          700: "#85843e",
          800: "#6e6d35",
          900: "#5c5b2e",
        },
        accent: {
          50: "#f6f7f0",
          100: "#edeee1",
          200: "#dcddc4",
          300: "#d6d8b8", // Beige verdoso
          400: "#c8caa3",
          500: "#b8bb8a",
          600: "#a5a876",
          700: "#8a8d63",
          800: "#727553",
          900: "#5f6146",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config

export default config