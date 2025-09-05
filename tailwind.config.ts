import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			yellow: {
  				'300': 'var(--yellow-300)',
  				'500': 'var(--yellow-500)',
  				'800': 'var(--yellow-800)'
  			},
  			brand: {
  				DEFAULT: 'var(--brand)',
  				light: 'var(--brand-light)',
  				dark: 'var(--brand-dark)'
  			},
  			gray: {
  				'400': 'var(--gray-400)',
  				'600': 'var(--gray-600)'
  			},
  			rfa: {
  				white: 'var(--rfa-white)',
  				black: 'var(--rfa-black)',
  				surface: 'var(--surface)',
  				ink: 'var(--ink)',
  				border: 'var(--rfa-border)'
  			},
  			text: {
  				DEFAULT: 'var(--text)',
  				muted: 'var(--text-muted)'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'fade-in': {
  				from: {
  					opacity: '0',
  					transform: 'translateY(10px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'slide-in-left': {
  				from: {
  					opacity: '0',
  					transform: 'translateX(-20px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			'typing': {
  				from: {
  					width: '0'
  				},
  				to: {
  					width: '100%'
  				}
  			},
  			'blink': {
  				'0%, 50%': {
  					'border-color': 'transparent'
  				},
  				'50%, 100%': {
  					'border-color': 'currentColor'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fade-in 0.6s ease-out',
  			'slide-in-left': 'slide-in-left 0.5s ease-out',
  			'typing': 'typing 2s steps(40, end)',
  			'blink': 'blink 1s infinite'
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-sans)'
  			],
  			inter: [
  				'Inter',
  				'ui-sans-serif',
  				'system-ui',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'Roboto',
  				'Helvetica Neue',
  				'Arial',
  				'Noto Sans',
  				'sans-serif'
  			]
  		},
  		backgroundImage: {
  			'glass-gradient': 'linear-gradient(to right bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
  			'hero-gradient': 'var(--hero-gradient)',
  			'tilt-gradient': 'var(--tilt-gradient)'
  		},
  		boxShadow: {
  			glass: '0 4px 30px rgba(0, 0, 0, 0.1)',
  			soft: 'var(--shadow-soft)',
  			med: 'var(--shadow-med)'
  		},
  		backdropFilter: {
  			blur: 'blur(5px)'
  		}
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    function ({ addUtilities }: { addUtilities: any }) {
      addUtilities({
        '.glass': {
          'background-image': 'linear-gradient(to right bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
          'box-shadow': '0 4px 30px rgba(0, 0, 0, 0.1)',
          'backdrop-filter': 'blur(5px)',
          '-webkit-backdrop-filter': 'blur(5px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
      })
    }
  ],
} satisfies Config

export default config