# Portfolio Website - Next.js 15 Full Stack

A modern, responsive portfolio website built with Next.js 15, TypeScript, and MongoDB. Features a beautiful UI with smooth animations, admin dashboard, and contact form with email notifications.

## 🚀 Features

### Frontend
- **Modern Design**: Clean, professional UI with dark/light mode support
- **Responsive**: Fully responsive design for desktop and mobile
- **Animations**: Smooth animations powered by Framer Motion
- **SEO Optimized**: Built-in SEO with Next.js Metadata API
- **TypeScript**: Full type safety throughout the application

### Backend
- **MongoDB Integration**: Database operations with Mongoose
- **API Routes**: RESTful API endpoints for projects and contacts
- **Authentication**: JWT-based admin authentication
- **Email Notifications**: Contact form submissions sent via email
- **Admin Dashboard**: Full CRUD operations for projects and contact management

### Admin Dashboard
- **Project Management**: Add, edit, and delete projects
- **Contact Management**: View and manage contact form submissions
- **Secure Authentication**: Protected admin routes
- **Real-time Updates**: Dynamic data loading and updates

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Animations**: Framer Motion
- **Database**: MongoDB Atlas with Mongoose
- **Authentication**: JWT with bcryptjs
- **Email**: Nodemailer
- **Deployment**: Vercel ready

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portfolio-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio?retryWrites=true&w=majority

   # Email Configuration (for contact form)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password

   # Admin Credentials
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your-secure-password

   # Next.js
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Seed the database**
   ```bash
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

### Projects Collection
```typescript
{
  title: string
  description: string
  techStack: string[]
  githubLink: string
  demoLink: string
  image: string
  createdAt: Date
  updatedAt: Date
}
```

### Contacts Collection
```typescript
{
  name: string
  email: string
  message: string
  createdAt: Date
}
```

### Users Collection
```typescript
{
  username: string
  passwordHash: string
  createdAt: Date
}
```

## 🎨 Customization

### Personal Information
Update the following files with your information:
- `components/hero.tsx` - Hero section content
- `components/about.tsx` - About section details
- `components/footer.tsx` - Footer information
- `app/layout.tsx` - SEO metadata

### Styling
- Modify `app/globals.css` for global styles
- Update `tailwind.config.js` for theme customization
- Customize component styles in individual component files

### Content
- Add your projects through the admin dashboard
- Update skills and experience in the about section
- Modify contact information in the contact section

## 🔐 Admin Access

1. Navigate to `/admin/login`
2. Use the credentials set in your environment variables
3. Default credentials (after seeding):
   - Username: `admin`
   - Password: `admin123`

## 📧 Email Configuration

The contact form sends email notifications using Nodemailer. Configure your email settings in the environment variables:

- **Gmail**: Use an App Password for authentication
- **Other providers**: Update the SMTP settings accordingly

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Connect your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy automatically

3. **Update MongoDB connection**
   - Ensure your MongoDB Atlas cluster allows connections from Vercel
   - Update `NEXTAUTH_URL` to your production domain

### Other Platforms

The application can be deployed to any platform that supports Node.js:
- Netlify
- Railway
- DigitalOcean
- AWS

## 📁 Project Structure

```
portfolio-nextjs/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── admin/            # Admin-specific components
│   └── ...               # Page components
├── lib/                  # Utility functions
├── models/               # MongoDB models
├── scripts/              # Database seeding
└── public/               # Static assets
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/portfolio-nextjs/issues) page
2. Create a new issue with detailed information
3. Contact me directly through the portfolio contact form

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [MongoDB](https://www.mongodb.com/) - Database
- [Vercel](https://vercel.com/) - Deployment platform

---

**Happy coding! 🚀**
