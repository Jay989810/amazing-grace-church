# Amazing Grace Baptist Church Website

A modern, responsive website for Amazing Grace Baptist Church located in U/Zawu, Gonin Gora, Kaduna State, Nigeria. Built with Next.js, TypeScript, and Tailwind CSS.

## 🌟 Features

### Public Website
- **Home Page**: Dynamic banner, latest sermon, upcoming events, and gallery preview
- **About Us**: Church history, mission, vision, core beliefs, and leadership team
- **Sermons**: Browse, filter, and download sermons with audio/video support
- **Events**: View upcoming and past events with registration options
- **Gallery**: Photo albums organized by categories
- **Contact**: Contact form, Google Maps integration, and church information

### Admin Dashboard (Secure)
- **Authentication**: Secure login system for admin access
- **Sermon Management**: Upload audio, video, and sermon notes
- **Event Management**: Create and manage church events
- **Gallery Management**: Upload and organize photos
- **Message Management**: View and respond to contact form submissions
- **User Management**: Manage admin users and permissions
- **Settings**: Update church information and configuration

### Technical Features
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark/Light Mode**: Theme toggle for user preference
- **SEO Optimized**: Meta tags and structured data for search engines
- **Fast Performance**: Optimized images and code splitting
- **Accessibility**: WCAG compliant design patterns

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, ShadCN UI Components
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Theme**: Next Themes (dark/light mode)
- **Backend**: Node.js, Express (for API routes)
- **Database**: MongoDB or Supabase (configurable)
- **Authentication**: NextAuth.js or custom JWT
- **File Storage**: Supabase Storage or AWS S3
- **Email**: Nodemailer for contact forms

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd amazing-grace-church
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration (see Environment Variables section)

4. **Run the development server**
```bash
npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="mongodb://localhost:27017/amazing-grace-church"
# or for Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Authentication
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Email Configuration (for contact forms)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# File Storage
NEXT_PUBLIC_STORAGE_URL="your-storage-url"
STORAGE_ACCESS_KEY="your-access-key"
STORAGE_SECRET_KEY="your-secret-key"

# Google Maps (for contact page)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Church Information
NEXT_PUBLIC_CHURCH_NAME="Amazing Grace Baptist Church"
NEXT_PUBLIC_CHURCH_ADDRESS="U/Zawu, Gonin Gora, Kaduna State, Nigeria"
NEXT_PUBLIC_CHURCH_PHONE="+234 XXX XXX XXXX"
NEXT_PUBLIC_CHURCH_EMAIL="info@amazinggracechurch.org"
```

## 📁 Project Structure

```
amazing-grace-church/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/              # Admin dashboard (secure)
│   │   ├── about/              # About page
│   │   ├── sermons/            # Sermons page
│   │   ├── events/             # Events page
│   │   ├── gallery/            # Gallery page
│   │   ├── contact/            # Contact page
│   │   ├── api/                # API routes
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/             # Reusable components
│   │   ├── ui/                 # UI components (Button, Card, etc.)
│   │   ├── navigation.tsx      # Main navigation
│   │   ├── footer.tsx          # Footer component
│   │   └── theme-provider.tsx  # Theme provider
│   ├── lib/                    # Utility functions
│   │   └── utils.ts            # Helper functions
│   └── types/                  # TypeScript type definitions
│       └── index.ts            # Type definitions
├── public/                     # Static assets
├── tailwind.config.ts         # Tailwind configuration
├── next.config.ts             # Next.js configuration
└── package.json               # Dependencies
```

## 🎨 Customization

### Colors
The website uses a custom color scheme representing the church's values:
- **Primary (Deep Blue)**: Faith and trust in God
- **Secondary (Gold)**: Grace and divine favor
- **Accent**: Supporting colors for highlights

### Content Management
- Update church information in the admin dashboard
- Upload sermons through the admin interface
- Manage events and gallery through the admin panel
- All content is stored in the database and can be updated without code changes

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on every push

### Other Platforms
- **Netlify**: Static site deployment
- **Railway**: Full-stack deployment
- **DigitalOcean**: VPS deployment
- **AWS**: Scalable cloud deployment

## 📱 Mobile App Integration

The website is designed to work seamlessly with mobile apps:
- Responsive design for mobile browsers
- API endpoints ready for mobile app consumption
- Push notification support (can be added)

## 🔒 Security Features

- **Admin Authentication**: Secure login system
- **Input Validation**: All forms validated on client and server
- **File Upload Security**: Type and size validation
- **Environment Variables**: Sensitive data stored securely
- **HTTPS**: SSL certificate recommended for production

## 📊 Analytics & Monitoring

- **Google Analytics**: Track website visitors
- **Performance Monitoring**: Core Web Vitals tracking
- **Error Tracking**: Sentry integration (optional)
- **Uptime Monitoring**: Service health checks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Email**: info@amazinggracechurch.org
- **Phone**: +234 XXX XXX XXXX
- **Address**: U/Zawu, Gonin Gora, Kaduna State, Nigeria

## 🙏 Acknowledgments

- Built with love for Amazing Grace Baptist Church
- Inspired by modern web design principles
- Community-driven development approach

---

**Built with ❤️ for Amazing Grace Baptist Church**