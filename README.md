# GatorTrader

🐊 Gator Marketplace
Gator Marketplace is a student-to-student marketplace designed for University of Florida students to buy, sell, and trade items easily.

 Setup & Installation
 Clone the Repository
git clone https://github.com/yourusername/gator-marketplace.git

cd gator-marketplace
 Install Dependencies
npm install

 Start the Development Server
npm run dev
The project will be running at http://localhost:3000.

📌 Features & Pages
✅ Authentication
Sign Up (/signup) - Users can create accounts (UF emails only).
Login (/login) - Secure user login.
Password Reset (/reset-password) - Users can reset their passwords.
✅ User Dashboard
Dashboard (/dashboard/[userid]) - Personalized dashboard after login.
Profile Page (/profile/[userid]) - View and edit user profile.
Messaging (/messaging) - Direct messaging between users.
Transactions (/transactions) - View purchase & sales history.
Notifications (/notifications) - Stay updated with activity.
✅ Product Listings
View Products (/products) - Browse available products.
Product Details (/product/[productid]) - View product-specific info.
Add Product (/sell) - Users can list new items for sale.
Edit Product (/edit-product/[productid]) - Modify existing listings.
✅ Static Pages
About (/about) - Information about the marketplace.
Contact (/contact) - Contact support.
⚡ Tech Stack
Frontend: Next.js (App Router), Tailwind CSS
Backend: Supabase (PostgreSQL, Auth, Storage)
Storage: Supabase Buckets (Profile Pictures, Product Images)
🛠️ Contributing
Fork the repository
Create a new branch
Commit changes
Push to GitHub and create a Pull Request
