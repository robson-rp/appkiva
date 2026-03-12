import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
      fontFamily: {
        display: ["Space Grotesk", "Poppins", "sans-serif"],
        body: ["Nunito", "sans-serif"],
        heading: ["Poppins", "Space Grotesk", "sans-serif"],
      },
      fontSize: {
        /* Mobile-first typography scale */
        "heading": ["1.75rem", { lineHeight: "2.25rem", fontWeight: "700" }],      /* 28px */
        "heading-lg": ["2rem", { lineHeight: "2.5rem", fontWeight: "700" }],        /* 32px - desktop */
        "section": ["1.25rem", { lineHeight: "1.75rem", fontWeight: "600" }],       /* 20px */
        "section-lg": ["1.5rem", { lineHeight: "2rem", fontWeight: "600" }],        /* 24px - desktop */
        "body": ["1rem", { lineHeight: "1.5rem" }],                                 /* 16px */
        "body-lg": ["1.125rem", { lineHeight: "1.75rem" }],                         /* 18px */
        "small": ["0.9375rem", { lineHeight: "1.5rem" }],                           /* 15px - minimum small */
        "caption": ["0.875rem", { lineHeight: "1.375rem" }],                        /* 14px - absolute floor */
      },
      spacing: {
        "touch": "2.75rem",  /* 44px - minimum touch target */
        "gap-mobile": "1rem", /* 16px - minimum gap */
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        kivara: {
          blue: "hsl(var(--kivara-blue))",
          green: "hsl(var(--kivara-green))",
          gold: "hsl(var(--kivara-gold))",
          "light-blue": "hsl(var(--kivara-light-blue))",
          "light-green": "hsl(var(--kivara-light-green))",
          "light-gold": "hsl(var(--kivara-light-gold))",
          pink: "hsl(var(--kivara-pink))",
          purple: "hsl(var(--kivara-purple))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "1.5rem",
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
        "coin-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-20px) scale(1.02)" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        "blur-in": {
          "0%": { opacity: "0", filter: "blur(12px)" },
          "100%": { opacity: "1", filter: "blur(0px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "coin-bounce": "coin-bounce 0.6s ease-in-out",
        "float": "float 3s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "gradient-shift": "gradient-shift 4s ease infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "blur-in": "blur-in 0.6s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
