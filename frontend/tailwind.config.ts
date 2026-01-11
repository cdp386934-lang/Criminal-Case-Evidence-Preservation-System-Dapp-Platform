import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      colors: {
        // 司法系统风格 - 深蓝/藏蓝主色（低饱和度）
        primary: {
          50: '#f5f7fa',
          100: '#e4e8ec',
          200: '#c8d1d9',
          300: '#a3b0bc',
          400: '#788896',
          500: '#5c6b7a',
          600: '#4a5568', // 主要辅助色
          700: '#3d4556',
          800: '#2d3748', // 标题、重要文本
          900: '#1e293b', // 主色 - 深蓝/藏蓝
        },
        // 中性灰 - 辅助色
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // 状态色 - 低饱和度
        success: {
          DEFAULT: '#2d5016', // 低饱和深绿
          light: '#4a7c2a',
          dark: '#1e3409',
        },
        warning: {
          DEFAULT: '#8b6f00', // 暗黄色
          light: '#b8950a',
          dark: '#5d4a00',
        },
        error: {
          DEFAULT: '#8b2635', // 暗红色
          light: '#b83247',
          dark: '#5d1a23',
        },
        // 背景色
        background: {
          DEFAULT: '#ffffff',
          secondary: '#f7f8fa', // 区块/分组背景
          tertiary: '#f0f1f3',
        },
        // 边框色
        border: {
          DEFAULT: '#e5e5e5',
          dark: '#d4d4d4',
        },
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '4px', // 轻微圆角
        md: '6px',
        lg: '8px',
      },
      boxShadow: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}
export default config

