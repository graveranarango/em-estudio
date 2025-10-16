import React, { useState, useEffect } from 'react';
import { getPosts } from '../../services/postService';

export default function PostsLibrary() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const userPosts = await getPosts();
        setPosts(userPosts);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (isLoading) {
    return <p>Cargando posts...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Biblioteca de Posts</h2>
      {posts.length === 0 ? (
        <p>Aún no has creado ningún post.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map(post => (
            <div key={post.id} className="border rounded-lg p-4 space-y-2">
              {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="rounded-md" />}
              <h3 className="font-semibold text-lg">{post.title}</h3>
              <div className="text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: post.content.substring(0, 100) + '...' }} />
              <p className="text-xs text-gray-400">
                Creado: {post.createdAt?.toDate().toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}