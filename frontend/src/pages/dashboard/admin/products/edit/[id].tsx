import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar";
import Loading from "@/components/Loading";
import withAdmin from "@/context/withAdmin";

type Product = {
  _id: string;
  name: string;
  description: string;
  platform: string[];
  cover: string;
  photos: string[];
  videos: string[];
  quantity: number;
  price: number;
};

function EditProduct() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedProduct, setUpdatedProduct] = useState<Partial<Product>>({});
  const [newPhoto, setNewPhoto] = useState<string>("");
  const [newVideo, setNewVideo] = useState<string>("");
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
      setError("Failed to load product data.");
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProduct),
      });

      if (response.ok) {
        alert("Product updated successfully!");
        router.push("/dashboard/admin/products");
      } else {
        setError("Failed to update product.");
      }
    } catch (error) {
      setError("Failed to update product.");
    }
  };

  const handleAddPhoto = () => {
    if (newPhoto) {
      setUpdatedProduct({
        ...updatedProduct,
        photos: [...(updatedProduct.photos || []), newPhoto],
      });
      setNewPhoto("");
    }
  };

  const handleAddVideo = () => {
    if (newVideo) {
      // Convert YouTube URL to embed format
      const videoID = newVideo.split("v=")[1];
      const ampersandPosition = videoID.indexOf("&");
      const formattedVideoURL =
        ampersandPosition !== -1
          ? videoID.substring(0, ampersandPosition)
          : videoID;
      const embedURL = `youtube.com/embed/${formattedVideoURL}`;

      setUpdatedProduct({
        ...updatedProduct,
        videos: [...(updatedProduct.videos || []), embedURL],
      });
      setNewVideo("");
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = updatedProduct.photos?.filter((_, i) => i !== index);
    setUpdatedProduct({
      ...updatedProduct,
      photos: newPhotos,
    });
  };

  const handleRemoveVideo = (index: number) => {
    const newVideos = updatedProduct.videos?.filter((_, i) => i !== index);
    setUpdatedProduct({
      ...updatedProduct,
      videos: newVideos,
    });
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
        <h1 className="text-3xl font-bold mb-4">Edit Product</h1>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={updatedProduct.name || ""}
              onChange={(e) =>
                setUpdatedProduct({ ...updatedProduct, name: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              value={updatedProduct.description || ""}
              onChange={(e) =>
                setUpdatedProduct({
                  ...updatedProduct,
                  description: e.target.value,
                })
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              rows={10}
            />
          </div>
          <div>
            <label
              htmlFor="platform"
              className="block text-sm font-medium text-gray-700"
            >
              Platform
            </label>
            <input
              type="text"
              id="platform"
              value={updatedProduct.platform?.join(", ") || ""}
              onChange={(e) =>
                setUpdatedProduct({
                  ...updatedProduct,
                  platform: e.target.value.split(", "),
                })
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="cover"
              className="block text-sm font-medium text-gray-700"
            >
              Cover Image URL
            </label>
            <input
              type="text"
              id="cover"
              value={updatedProduct.cover || ""}
              onChange={(e) =>
                setUpdatedProduct({ ...updatedProduct, cover: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="photos"
              className="block text-sm font-medium text-gray-700"
            >
              Photos (Image URLs)
            </label>
            <input
              type="text"
              id="photos"
              value={newPhoto}
              onChange={(e) => setNewPhoto(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <button
              type="button"
              onClick={handleAddPhoto}
              className="mt-2 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
              Add Photo
            </button>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {updatedProduct.photos?.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-auto"
                    style={{ maxWidth: "100px", maxHeight: "100px" }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-0 left-0 bg-red-500 text-white rounded-full p-1 text-xs"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label
              htmlFor="videos"
              className="block text-sm font-medium text-gray-700"
            >
              Videos (YouTube Videos)
            </label>
            <input
              type="text"
              id="videos"
              value={newVideo}
              onChange={(e) => setNewVideo(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <button
              type="button"
              onClick={handleAddVideo}
              className="mt-2 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
              Add Video
            </button>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {updatedProduct.videos?.map((video, index) => (
                <div key={index} className="relative">
                  <iframe
                    src={`https://${video}`}
                    title={`Video ${index}`}
                    className="w-full h-auto"
                    style={{ maxWidth: "200px", maxHeight: "150px" }}
                    allowFullScreen
                  ></iframe>
                  <button
                    type="button"
                    onClick={() => handleRemoveVideo(index)}
                    className="absolute top-0 left-0 bg-red-500 text-white rounded-full p-1 text-xs"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700"
            >
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              value={updatedProduct.quantity || ""}
              onChange={(e) =>
                setUpdatedProduct({
                  ...updatedProduct,
                  quantity: Number(e.target.value),
                })
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700"
            >
              Price
            </label>
            <input
              type="number"
              id="price"
              value={updatedProduct.price || ""}
              onChange={(e) =>
                setUpdatedProduct({
                  ...updatedProduct,
                  price: Number(e.target.value),
                })
              }
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
export default withAdmin(EditProduct);
