import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { generateImage } from '../../services/imageService';
import { createPost } from '../../services/postService';
import PostsLibrary from './PostsLibrary'; // Import the new library component

// Renaming the creator part to its own component for clarity
const PostEditor = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateImage = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setError('');
    try {
      const result = await generateImage(prompt);
      setImageUrl(result.imageUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePost = async () => {
    const postData = {
      title,
      content,
      tags: tags.split(',').map(tag => tag.trim()),
      imageUrl,
    };
    try {
      await createPost(postData);
      alert('Post guardado con éxito!');
      setTitle('');
      setContent('');
      setTags('');
      setPrompt('');
      setImageUrl('');
    } catch (err) {
      setError('Error al guardar el post: ' + err.message);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold">Crear Nuevo Post</h2>

      <div className="space-y-2">
        <Label htmlFor="title">Título del Post</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Un título atractivo para tu post" />
      </div>

      <div className="space-y-2">
        <Label>Contenido del Post</Label>
        <div className="bg-white">
          <ReactQuill theme="snow" value={content} onChange={setContent} style={{ height: '250px', marginBottom: '40px' }} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Etiquetas (separadas por comas)</Label>
        <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tecnologia, ia, marketing" />
      </div>

      <div className="p-4 border rounded-lg space-y-4">
        <h3 className="font-semibold">Asistente de Imágenes</h3>
        <div className="space-y-2">
          <Label htmlFor="prompt">Describe la imagen que quieres crear</Label>
          <Input id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ej: Un cerebro hecho de circuitos brillantes" />
        </div>
        <Button onClick={handleGenerateImage} disabled={isGenerating}>
          {isGenerating ? 'Generando...' : 'Generar Imagen'}
        </Button>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {imageUrl && (
          <div className="mt-4">
            <img src={imageUrl} alt={prompt} className="rounded-lg shadow-md max-w-xs" />
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSavePost}>Guardar Post</Button>
      </div>
    </div>
  );
};


export default function PostsCreatorModule() {
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'library'

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 border-b">
        <Button variant={activeTab === 'create' ? 'default' : 'ghost'} onClick={() => setActiveTab('create')}>
          Crear Post
        </Button>
        <Button variant={activeTab === 'library' ? 'default' : 'ghost'} onClick={() => setActiveTab('library')}>
          Biblioteca
        </Button>
      </div>

      <div>
        {activeTab === 'create' && <PostEditor />}
        {activeTab === 'library' && <PostsLibrary />}
      </div>
    </div>
  );
}