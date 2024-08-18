import { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Sidebar';

export default function CreateProduct() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState('');
  const [cover, setCover] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [videoURL, setVideoURL] = useState('');
  const [videos, setVideos] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);
  const router = useRouter();

  const handleAddPhoto = () => {
    if (photoURL) {
      setPhotos([...photos, photoURL]);
      setPhotoURL('');
    }
  };

  const handleAddVideo = () => {
    if (videoURL) {
      // Convert the YouTube URL to embed format
      const videoID = videoURL.split('v=')[1];
      const ampersandPosition = videoID.indexOf('&');
      const formattedVideoURL = ampersandPosition !== -1 ? videoID.substring(0, ampersandPosition) : videoID;
      const embedURL = `youtube.com/embed/${formattedVideoURL}`;
      
      setVideos([...videos, embedURL]);
      setVideoURL('');
    }
  };
  
  
  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleRemoveVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const handleExpandPhoto = (photo: string) => {
    setExpandedPhoto(photo);
  };

  const handleCloseExpandedPhoto = () => {
    setExpandedPhoto(null);
  };

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.currentTarget === e.target) {
      setExpandedPhoto(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Unauthorized');
        return;
    }

    const productData = {
        name,
        description,
        platform: platform.split(',').map(p => p.trim()), 
        cover,
        quantity: Number(quantity),
        price: Number(price),
        photos,
        videos,
    };

    const response = await fetch('http://localhost:5000/products/createProductFromAdmin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
    });

    if (response.ok) {
        alert('Product created successfully!');
        router.push('/dashboard/admin/products');
    } else {
        const errorMessage = await response.text();
        alert(`Failed to create product. Error: ${errorMessage}`);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Create Product</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="platform" className="block text-sm font-medium text-gray-700">Platform</label>
            <input
              type="text"
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Comma separated platforms (e.g., PC, Mac)"
            />
          </div>
          <div>
            <label htmlFor="cover" className="block text-sm font-medium text-gray-700">Cover Image URL</label>
            <input
              type="text"
              id="cover"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="photoURL" className="block text-sm font-medium text-gray-700">Photos (Image URLs)</label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="photoURL"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={handleAddPhoto}
                className="mt-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="mt-4 flex space-x-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative" style={{ width: '100px', height: '100px' }}>
                  <img
                    src={photo}
                    alt={`Photo ${index}`}
                    className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                    onClick={() => handleExpandPhoto(photo)}
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
            <label htmlFor="videoURL" className="block text-sm font-medium text-gray-700">Videos (Youtube Videos)</label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="videoURL"
                value={videoURL}
                onChange={(e) => setVideoURL(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={handleAddVideo}
                className="mt-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {videos.map((video, index) => (
                <div key={index} className="relative">
                  <iframe
                    src={`https://${video}`}
                    title={`Video ${index}`}
                    className="w-full h-auto"
                    style={{ maxWidth: '500px', maxHeight: '500px' }}
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
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            Create Product
          </button>
        </form>

        {/* Expanded photo modal */}
        {expandedPhoto && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center"
            onClick={handleClickOutside}
          >
            <div className="relative max-w-full max-h-full p-4">
              <img
                src={expandedPhoto}
                alt="Expanded"
                className="max-w-full max-h-screen object-contain"
              />
              <button
                type="button"
                onClick={handleCloseExpandedPhoto}
                className="absolute top-0 right-0 bg-white text-black rounded-full p-2 text-xl"
              >
                &times;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
