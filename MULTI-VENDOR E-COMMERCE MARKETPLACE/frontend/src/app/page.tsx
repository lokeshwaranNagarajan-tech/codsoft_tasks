export default function HomePage() {
    // Dummy data for UI testing
    const products = [
        { id: 1, name: "Wireless Headphones", price: "$99", seller: "TechStore" },
        { id: 2, name: "Running Shoes", price: "$75", seller: "FitGear" },
        { id: 3, name: "Smart Watch", price: "$150", seller: "TechStore" },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Discover Products</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <div className="h-40 bg-gray-200 rounded-md mb-4 flex items-center justify-center text-gray-500">
                            [Image Placeholder]
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800">{product.name}</h2>
                        <p className="text-sm text-gray-500 mb-2">Sold by: {product.seller}</p>
                        <div className="flex justify-between items-center mt-4">
                            <span className="text-lg font-bold text-blue-600">{product.price}</span>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}