export default function VendorDashboard() {
    return (
        <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Vendor Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <h3 className="text-gray-500 text-sm">Total Revenue</h3>
                    <p className="text-2xl font-bold text-gray-800">$4,500</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <h3 className="text-gray-500 text-sm">Active Orders</h3>
                    <p className="text-2xl font-bold text-gray-800">12</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <h3 className="text-gray-500 text-sm">Products Listed</h3>
                    <p className="text-2xl font-bold text-gray-800">34</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <h3 className="text-gray-500 text-sm">Platform Commission</h3>
                    <p className="text-2xl font-bold text-red-500">-$450</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-900">
                    + Add New Product
                </button>
                <button className="bg-white text-gray-800 border border-gray-300 px-6 py-2 rounded hover:bg-gray-50">
                    View All Orders
                </button>
            </div>
        </div>
    );
}