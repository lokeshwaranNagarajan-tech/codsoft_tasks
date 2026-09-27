import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          MarketHub
        </Link>
        <div className="space-x-6">
          <Link href="/" className="hover:text-blue-200">Shop</Link>
          <Link href="/vendor/dashboard" className="hover:text-blue-200">Vendor Dashboard</Link>
          <button className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium">
            Cart (0)
          </button>
        </div>
      </div>
    </nav>
  );
}