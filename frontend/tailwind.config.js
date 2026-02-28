/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";

export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	darkMode: "class",
	theme: {
		extend: {
			fontFamily: {
				sans: ["Inter", ...defaultTheme.fontFamily.sans],
				mono: ["JetBrains Mono", ...defaultTheme.fontFamily.mono],
			},
			fontSize: {
				xs: ["12px", "16px"],
				sm: ["13px", "18px"],
				base: ["14px", "20px"],
				md: ["16px", "22px"],
				lg: ["18px", "24px"],
			},
			colors: {
				bg: "var(--wl-bg)",
				surface: "var(--wl-surface)",
				elevated: "var(--wl-elevated)",
				border: "var(--wl-border)",
				"text-primary": "var(--wl-text)",
				"text-secondary": "var(--wl-text-secondary)",
				"text-muted": "var(--wl-text-muted)",
				accent: {
					DEFAULT: "var(--wl-accent)",
					hover: "var(--wl-accent-hover)",
				},
				success: "var(--wl-success)",
			},
			spacing: {
				xs: "4px",
				sm: "8px",
				md: "16px",
				lg: "24px",
				xl: "32px",
				"2xl": "40px",
				"3xl": "48px",
			},
			borderRadius: {
				sm: "6px",
				md: "8px",
				lg: "12px",
			},
		},
	},
	plugins: [],
};
