const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Portfolio Next.js Project...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local file...');
  
  const envContent = `# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio?retryWrites=true&w=majority

# Email Configuration (for contact form)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Next.js
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local file created!');
  console.log('⚠️  Please update the environment variables with your actual values.\n');
} else {
  console.log('✅ .env.local file already exists.\n');
}

console.log('📋 Next steps:');
console.log('1. Update .env.local with your MongoDB connection string');
console.log('2. Configure email settings for contact form');
console.log('3. Run: npm run seed (to populate database with sample data)');
console.log('4. Run: npm run dev (to start development server)');
console.log('5. Visit: http://localhost:3000');
console.log('6. Admin panel: http://localhost:3000/admin/login');
console.log('\n🎉 Setup complete! Happy coding!');
