import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy_google_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_google_client_secret',
    }),
    // Local / Testing Credentials Provider for instant one-click login testing
    CredentialsProvider({
      id: 'credentials',
      name: 'Demo Account',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@dinedesk.com' },
        name: { label: 'Name', type: 'text', placeholder: 'Admin' },
        role: { label: 'Role', type: 'text', placeholder: 'admin or customer' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const adminEmail = (process.env.ADMIN_EMAIL || 'lokeshwaranlokeshwaran2006@gmail.com').trim().toLowerCase();
        const email = credentials.email.trim().toLowerCase();
        const role = (email === adminEmail || credentials.role === 'admin') ? 'admin' : 'customer';
        
        return {
          id: 'user_' + Date.now(),
          name: credentials.name || (role === 'admin' ? 'Admin Manager' : 'Guest Customer'),
          email: credentials.email.trim(),
          role: role,
          image: role === 'admin' 
            ? 'https://api.dicebear.com/7.x/bottts/svg?seed=admin'
            : 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(credentials.email),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const adminEmail = (process.env.ADMIN_EMAIL || 'lokeshwaranlokeshwaran2006@gmail.com').trim().toLowerCase();
      if (user) {
        const userEmail = (user.email || '').trim().toLowerCase();
        token.role = (userEmail === adminEmail || user.role === 'admin') ? 'admin' : 'customer';
        token.id = user.id;
      } else if (token?.email) {
        const tokenEmail = token.email.trim().toLowerCase();
        token.role = tokenEmail === adminEmail ? 'admin' : (token.role || 'customer');
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        const adminEmail = (process.env.ADMIN_EMAIL || 'lokeshwaranlokeshwaran2006@gmail.com').trim().toLowerCase();
        const userEmail = (session.user.email || token.email || '').trim().toLowerCase();
        session.user.role = (userEmail === adminEmail || token.role === 'admin') ? 'admin' : 'customer';
        session.user.id = token.id || token.sub;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'dinedesk_nextauth_secret_key_restaurant_2026_super_secure',
  pages: {
    signIn: '/login',
  },
};
