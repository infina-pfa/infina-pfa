import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        nunito: ["var(--font-nunito)", "sans-serif"],
      },
      colors: {
        // Infina Brand Colors
        "infina-blue": "#0055FF",
        "infina-green": "#2ECC71",
        "infina-yellow": "#FFC107",
        "infina-orange": "#FF9800",
        "infina-red": "#F44336",

        // Background Colors
        "app-bg": "#F6F7F9",
        "section-bg": "#F0F2F5",
        divider: "#E0E0E0",

        // CSS Variables
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        success: "var(--success)",
        warning: "var(--warning)",
        highlight: "var(--highlight)",
      },
      borderRadius: {
        DEFAULT: "8px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        button: "8px",
        card: "12px",
        input: "8px",
        modal: "12px",
      },
      boxShadow: {
        // Override all shadows to none for flat design
        none: "none",
        sm: "none",
        DEFAULT: "none",
        md: "none",
        lg: "none",
        xl: "none",
        "2xl": "none",
        inner: "none",
      },
      spacing: {
        // 8pt grid system as specified in guidelines
        "18": "72px",
        "22": "88px",
      },
      fontSize: {
        // Typography system from guidelines
        hero: ["3.5rem", { lineHeight: "1.2", fontWeight: "800" }], // 56px
        section: ["2.25rem", { lineHeight: "1.3", fontWeight: "700" }], // 36px
        subhead: ["1.5rem", { lineHeight: "1.4", fontWeight: "600" }], // 24px
      },
      textShadow: {
        none: "none",
      },
    },
  },
  plugins: [],
};

export default config;
