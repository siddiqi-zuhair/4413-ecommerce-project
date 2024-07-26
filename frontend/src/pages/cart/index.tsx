import { useState } from "react";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  const calculateTotal = () => {
    let total = 0;
    for (let i = 0; i < cart.length; i++) {
      total += cart[i]?.price * cart[i]?.ordered_quantity;
    }
    setTotal(total);
  }

  const fetchProducts = async () => {
    // Retrieve the cart from localStorage
    const cart = localStorage.getItem("cart");

    // Check if cart exists and parse it
    if (cart) {
      const cartItems = JSON.parse(cart);
      const ids = cartItems.map((item: { id: string }) => item.id);

      // Fetch products based on IDs
      if (ids.length > 0) {
        try {
          // Replace with your actual endpoint
          const response = await fetch(
            `http://localhost:5000/products/multiple?ids=${ids.join(",")}`
          );
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const products = await response.json();
          //set the cart with the ordered quantity of each product
          for (let i = 0; i < products.length; i++) {
            products[i].ordered_quantity = cartItems[i].quantity;
          }
          setCart(products);

          // Handle the fetched products as needed
          // For example, set them in state or update the UI
        } catch (error) {
          console.error("Error fetching products:", error);
        }
      } else {
        console.log("No product IDs found in cart.");
      }
    } else {
      console.log("Cart is empty.");
    }
    calculateTotal();
  };

  fetchProducts();
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-600">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-semibold mb-6 text-center">Cart</h2>
        <div className="space-y-4">
          {cart.map((product: any) => (
            <div
              key={product._id}
              className="flex items-center justify-between border-b border-gray-300 pb-2"
            >
              <div>
                <h3 className="text-xl font-semibold">{product.name}</h3>
                <p className="text-gray-500">Price: ${product.price}</p>
                <p className="text-gray-500">
                  Quantity: {product.ordered_quantity}
                </p>
              </div>
              <div>
                <img
                  src={
                    "https://images.igdb.com/igdb/image/upload/t_cover_big/" +
                    product.cover +
                    ".jpg"
                  }
                  alt={product.name}
                  className="w-20 h-auto object-cover"
                />
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Total:</h3>
            <p className="text-xl font-semibold">${total.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
