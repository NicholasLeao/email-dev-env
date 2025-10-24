# Email Development Environment

A modern, browser-based email template development tool built with React and Vite. Design, test, and preview your email templates with real-time JSON data injection.

![Email Dev Environment Screenshot](public/app-screenshot.png)

## Features

- **Live Preview**: Real-time email template rendering with JSON data
- **Multiple Templates**: Built-in support for welcome emails, newsletters, and automated reports
- **Handlebars Templates**: Use powerful Handlebars templating engine
- **JSON Data Input**: Test your templates with dynamic data
- **Resizable Panels**: Adjust workspace to your preference
- **Auto-save**: Your work is automatically saved to localStorage
- **Modern UI**: Clean, professional interface built with Tailwind CSS

## Available Templates

- **Welcome Email** - Comprehensive welcome email template with stats and features
- **Newsletter** - Monthly newsletter template with articles and updates  
- **Automated Report** - Automated report template with data and insights

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd email-dev-env
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Select a Template**: Use the dropdown in the navigation to choose from available email templates
2. **Input JSON Data**: Enter your test data in the left panel (JSON format)
3. **Preview**: View the rendered email template in the right panel
4. **Format**: Use the "Format" button to prettify your JSON
5. **Reset**: Use the reset button to restore template defaults

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Templates

1. Create a new `.hbs` file in `public/templates/`
2. Add template metadata to `public/templates/templates.json`
3. Optionally create a sample JSON file for default data

## Built With

- [React](https://reactjs.org/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Handlebars](https://handlebarsjs.com/) - Template engine
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Radix UI](https://www.radix-ui.com/) - UI components
- [Lucide React](https://lucide.dev/) - Icons

## License

This project is private and not licensed for public use.