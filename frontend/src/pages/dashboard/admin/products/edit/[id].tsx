import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Sidebar';

type Product = {
  _id: string;
  name: string;
  description: string;
  platform: string[];
  cover: string;
  quantity: number;
  price: number;
};

export default function EditProduct() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedProduct, setUpdatedProduct] = useState<Partial<Product>>({});
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:5000/products/${id}`);
      const data = await response.json();
      setProduct(data);
      setUpdatedProduct(data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load product data.');
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProduct),
      });

      if (response.ok) {
        alert('Product updated successfully!');
        router.push('/dashboard/admin/products');
      } else {
        setError('Failed to update product.');
      }
    } catch (error) {
      setError('Failed to update product.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Edit Product</h1>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={updatedProduct.name || ''}
              onChange={(e) => setUpdatedProduct({ ...updatedProduct, name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={updatedProduct.description || ''}
              onChange={(e) => setUpdatedProduct({ ...updatedProduct, description: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" rows={10}
            />
          </div>
          <div>
            <label htmlFor="platform" className="block text-sm font-medium text-gray-700">
              Platform
            </label>
            <input
              type="text"
              id="platform"
              value={updatedProduct.platform?.join(', ') || ''}
              onChange={(e) => setUpdatedProduct({ ...updatedProduct, platform: e.target.value.split(', ') })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              value={updatedProduct.quantity || ''}
              onChange={(e) => setUpdatedProduct({ ...updatedProduct, quantity: Number(e.target.value) })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              type="number"
              id="price"
              value={updatedProduct.price || ''}
              onChange={(e) => setUpdatedProduct({ ...updatedProduct, price: Number(e.target.value) })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            Update Product
          </button>
        </form>
      </div>
    </div>
  );
}
