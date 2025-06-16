import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import animate from "tailwindcss-animate";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
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
			sans: ['Roboto', 'sans-serif'],
		},
  		colors: {
  			background: {
				DEFAULT: "var(--background)",
				outer: "var(--background-outer)",
				inner: "var(--background-inner)",
				preview:"var(--preview-bg)",
				sidebar: "var(--sidebar-bg)",
				sidebarActive: "var(--sidebar-active-bg)",
			},
			icon: {
				color: "var(--icon-color)",
				colorActive: "var(--icon-color-active)",
			},
  			foreground: "var(--foreground)",
            card: {
                DEFAULT: "var(--card)",
                foreground: "var(--card-foreground)",
                check: "var(--card-check)",
            },
  			primary: {
  				DEFAULT: "var(--primary)",
  				foreground: "var(--primary-foreground)",
				500: "var(--primary-500)",
				300: "var(--primary-300)",
                100: "var(--primary-100)",
  			},
  			secondary: {
  				DEFAULT: "var(--secondary)",
  				foreground: "var(--secondary-foreground)",
				icons: "hsl(var(--secondary-icons))",
  			},
  			muted: {
  				DEFAULT: "var(--muted)",
  				foreground: "var(--muted-foreground)",
  			},
  			accent: {
  				DEFAULT: "var(--accent)",
  				foreground: "var(--accent-foreground)",
  			},
			profile: {
				border: "var(--profile-border)",
			},
            destructive: {
                DEFAULT: "var(--destructive)",
                foreground: "var(--destructive-foreground)",
            },
            button: {
                DEFAULT: "var(--button-primary)",
				primary: "var(--button-primary)",
                disabled: "var(--button-disabled)",
                outline: "var(--button-outline)",
				background: "var(--button-background)",
				close: "var(--close-button)",
				text: "var(--text-disabled)",
            },
            border:  {
				DEFAULT: "var(--border)",
				logo: "var(--logo-outline)",
			},
            ring: "var(--ring)",
			text: {
				primary: "var(--text-primary)",
				sidebar: "var(--sidebar-text)",
			},
			header: {
				DEFAULT: "var(--primary)",
				primary: "var(--header-primary)",
				secondary: "var(--header-secondary)",
			},
			input: {
				label: "var(--input-label)",
				placeholder: "var(--input-placeholder)",
				border: "var(--input-border)",
				bg: "var(--input-bg)",
			},
			link: {
				DEFAULT: "var(--link-active)",
				disabled: "var(--link-disabled)",
				active: "var(--link-active)",
			},
			modal: {
				DEFAULT: "var(--modal-content)",
				heading: "var(--modal-heading)",
				content: "var(--modal-content)",
			},
  			neutral: {
  				100: "var(--neutral-100)",
  				200: "var(--neutral-200)",
  				300: "var(--neutral-300)",
  				400: "var(--neutral-400)",
  				500: "var(--neutral-500)",
  				600: "var(--neutral-600)",
  				700: "var(--neutral-700)",
  				800: "var(--neutral-800)",
  				900: "var(--neutral-900)",
  				950: "var(--neutral-950)",
				960: "var(--neutral-960)",
  			},
            positive: {
                50: "var(--positive-50)",
                100: "var(--positive-100)",
                200: "var(--positive-200)",
                300: "var(--positive-300)",
                400: "var(--positive-400)",
                500: "var(--positive-500)",
                600: "var(--positive-600)",
                700: "var(--positive-700)",
                800: "var(--positive-800)",
                900: "var(--positive-900)",
                950: "var(--positive-950)",
            },
            warning: {
                50: "var(--warning-50)",
                100: "var(--warning-100)",
                200: "var(--warning-200)",
                300: "var(--warning-300)",
                400: "var(--warning-400)",
                500: "var(--warning-500)",
                600: "var(--warning-600)",
                700: "var(--warning-700)",
                800: "var(--warning-800)",
                900: "var(--warning-900)",
                950: "var(--warning-950)",
            },
            negative: {
				50: "var(--negative-50)",
                300: "var(--negative-300)",
                500: "var(--negative-500)",
                700: "var(--negative-700)",
                900: "var(--negative-900)",
            },
            light: {
                100: "var(--light-100)",
                200: "var(--light-200)",
                250: "var(--light-250)",
                300: "var(--light-300)",
                400: "var(--light-400)",
                500: "var(--light-500)",
                600: "var(--light-600)",
                700: "var(--light-700)",
            },
            filter: {
                icon: "var(--filter-icon)",
            },
            title: {
                color: "var(--title-color)",
            },
			mode: {
				img: "var(--img-mode)",
				adm: "var(--admin-mode)",
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
  	}
  },
  plugins: [
    animate,
    plugin(function({ addUtilities }) {
      addUtilities({
        '.button-disabled': {
          '@apply bg-button-disabled text-button-text border-button-disabled cursor-not-allowed': {},
        },
      })
    })
  ],
  safelist: [
    'bg-status-allStudies',
    'text-status-text-allStudies',
    'border-status-border-allStudies',
    'bg-violet-300',
    'bg-blue-400',
  ],
} satisfies Config;
