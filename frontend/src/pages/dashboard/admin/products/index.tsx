import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Loading from '@/components/Loading';

type Product = {
  _id: string;
  name: string;
  description: string;
  platform: string[];
  cover: string;
  quantity: number;
  price: number;
};

export default function ManageProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/products');
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load products data.');
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Unauthorized');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setProducts(products.filter((product) => product._id !== id));
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Manage Products</h1>
        <Link href="/dashboard/admin/products/create" className="block py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700 text-center mb-4">
          Add New Product
        </Link>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Description</th>
              <th className="py-2 px-4">Platform</th>
              <th className="py-2 px-4">Quantity</th>
              <th className="py-2 px-4">Price</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-t">
                <td className="py-2 px-4">{product.name}</td>
                <td className="py-2 px-4">{product.description}</td>
                <td className="py-2 px-4">{product.platform.join(', ')}</td>
                <td className="py-2 px-4">{product.quantity}</td>
                <td className="py-2 px-4">${product.price.toFixed(2)}</td>
                <td className="py-2 px-4">
                  <Link href={`/dashboard/admin/products/edit/${product._id}`} className="p-2 bg-blue-500 text-white rounded mr-2">
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteProduct(product._id)}
                    className="p-2 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
