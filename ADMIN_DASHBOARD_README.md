# Amazing Grace Baptist Church - Admin Dashboard

A comprehensive real-time admin dashboard for managing the Amazing Grace Baptist Church website with live content synchronization.

## 🚀 Features

### ✅ Authentication & Security
- **Default Admin Login**: `admin@amazinggracechurch.org` / `grace1234`
- **JWT Session Management**: Secure authentication with NextAuth
- **Route Protection**: Middleware-protected admin routes
- **Role-based Access**: Admin-only operations

### ✅ Real-Time Content Management
- **Live Updates**: All changes sync instantly across the website
- **Real-time Notifications**: Instant alerts for new contact messages
- **WebSocket Integration**: Supabase Realtime for live synchronization
- **Global Sync**: Changes reflect immediately for all users worldwide

### ✅ Comprehensive Content Management
- **Sermons**: Upload audio, video, and text notes with metadata
- **Events**: Create and manage church events with registration
- **Gallery**: Upload and organize photos in albums
- **Messages**: Real-time contact form message management
- **Settings**: Global church configuration and contact info

### ✅ Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **ShadCN UI Components**: Beautiful, accessible components
- **Toast Notifications**: Success/error feedback
- **Loading States**: Smooth user experience
- **Real-time Indicators**: Live counters and status updates

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: TailwindCSS + ShadCN UI
- **Authentication**: NextAuth.js
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime
- **File Storage**: Supabase Storage
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

## 🚀 Quick Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd amazing-grace-church
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Run the SQL schema from `database-schema.sql` in your Supabase SQL editor

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Default Admin Credentials
ADMIN_EMAIL=admin@amazinggracechurch.org
ADMIN_PASSWORD=grace1234

# Email Configuration (for contact form replies)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./public/uploads
```

### 4. Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000/admin` and login with the default credentials.

## 📁 Project Structure

```
amazing-grace-church/
├── src/
│   ├── app/
│   │   ├── admin/                 # Admin dashboard
│   │   ├── api/                   # API routes
│   │   │   ├── auth/             # Authentication
│   │   │   ├── sermons/           # Sermon CRUD
│   │   │   ├── events/            # Event CRUD
│   │   │   ├── messages/          # Contact messages
│   │   │   ├── gallery/           # Gallery management
│   │   │   └── settings/          # Church settings
│   │   └── ...
│   ├── components/
│   │   └── ui/                    # ShadCN UI components
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client
│   │   └── auth.ts                # Auth configuration
│   └── types/
│       └── index.ts               # TypeScript definitions
├── database-schema.sql            # Database setup
└── README.md
```

## 🔧 Admin Dashboard Features

### Dashboard Overview
- **Live Statistics**: Real-time counts of sermons, events, messages, and gallery images
- **Recent Activity**: Latest messages and sermons with quick actions
- **Notification Bell**: Shows unread message count with real-time updates

### Sermon Management
- **Add Sermons**: Upload audio, video, and text notes with metadata
- **Edit/Delete**: Full CRUD operations with instant updates
- **Categories**: Sunday Service, Mid-week, Bible Study
- **Live Publishing**: Changes appear immediately on the website

### Event Management
- **Create Events**: Add upcoming church events with full details
- **Registration**: Optional registration links and requirements
- **Event Types**: Service, Conference, Crusade, Youth Program, Other
- **Real-time Updates**: Events sync instantly to the frontend

### Gallery Management
- **Upload Images**: Add photos to organized albums
- **Album Organization**: Create albums like "Crusade 2025", "Youth Service"
- **Photographer Credits**: Track photo credits
- **Live Gallery**: Images appear immediately on the website

### Contact Messages
- **Real-time Notifications**: Instant alerts for new messages
- **Status Management**: Mark as read/replied
- **Reply System**: Direct email integration
- **Message History**: Complete conversation tracking

### Settings Panel
- **Church Information**: Name, address, contact details
- **Service Times**: Configure worship schedules
- **Social Media**: Update social media links
- **Global Updates**: Changes reflect across the entire website

## 🔄 Real-Time Features

### Live Synchronization
- **Supabase Realtime**: WebSocket-based live updates
- **Instant Publishing**: No redeployment needed
- **Global Sync**: Changes visible worldwide immediately
- **Conflict Resolution**: Automatic handling of concurrent edits

### Notification System
- **New Messages**: Instant alerts for contact form submissions
- **Admin Actions**: Success/error notifications
- **Status Updates**: Real-time status changes
- **Toast Messages**: User-friendly feedback

## 🔐 Security Features

### Authentication
- **JWT Tokens**: Secure session management
- **Role-based Access**: Admin-only operations
- **Session Expiration**: Automatic logout after 24 hours
- **Password Protection**: Secure credential handling

### Data Protection
- **Row Level Security**: Database-level access control
- **API Protection**: Authenticated endpoints only
- **Input Validation**: Server-side data validation
- **SQL Injection Prevention**: Parameterized queries

## 📱 Mobile Responsiveness

The admin dashboard is fully responsive and works seamlessly on:
- **Desktop**: Full-featured experience
- **Tablet**: Optimized touch interface
- **Mobile**: Streamlined mobile experience
- **Cross-browser**: Chrome, Firefox, Safari, Edge

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment

```bash
npm run build
npm start
```

## 🔧 Customization

### Adding New Content Types
1. Update the database schema
2. Create API routes in `/api/`
3. Add UI components in the admin dashboard
4. Update TypeScript types

### Styling Customization
- Modify `tailwind.config.ts` for theme changes
- Update ShadCN UI components
- Customize colors in `globals.css`

### Feature Extensions
- Add file upload with drag-and-drop
- Implement email notifications
- Add user management
- Create analytics dashboard

## 🐛 Troubleshooting

### Common Issues

**Authentication Issues**
- Check environment variables
- Verify Supabase configuration
- Ensure database policies are correct

**Real-time Notifications Not Working**
- Verify Supabase Realtime is enabled
- Check WebSocket connections
- Ensure proper subscription setup

**File Upload Issues**
- Check file size limits
- Verify storage permissions
- Ensure proper CORS configuration

## 📞 Support

For technical support or feature requests:
- Email: admin@amazinggracechurch.org
- Create an issue in the repository
- Check the documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for Amazing Grace Baptist Church**

