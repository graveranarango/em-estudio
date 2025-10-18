import { useState, useRef, memo } from "react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Upload, Trash2, Image, Video } from "lucide-react";
import { useUserAssets, UserAsset } from "../../hooks/useUserAssets";
import { Card, CardContent } from "../ui/card";

function AssetGridCard({ asset, onDelete }: { asset: UserAsset; onDelete: (path: string) => void; }) {
  const isVideo = asset.name.endsWith('.mp4') || asset.name.endsWith('.mov');
  return (
    <Card className="group relative">
      <CardContent className="p-0">
        {isVideo ? (
          <video src={asset.url} className="aspect-square w-full rounded-t-lg object-cover" />
        ) : (
          <img src={asset.url} alt={asset.name} className="aspect-square w-full rounded-t-lg object-cover" />
        )}
        <div className="absolute top-2 right-2">
          <Button size="icon" variant="destructive" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onDelete(asset.fullPath)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-2 text-xs text-muted-foreground truncate">
          {asset.name}
        </div>
      </CardContent>
    </Card>
  );
}

function AssetsLibraryDynamic() {
  const { assets, isLoading, error, uploadProgress, uploadAsset, deleteAsset } = useUserAssets();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAsset(file);
    }
  };

  const handleDelete = async (fullPath: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar este archivo?`)) {
      await deleteAsset(fullPath);
    }
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Biblioteca de Assets</h1>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <Button variant="outline" className="gap-2" onClick={handleUploadClick} disabled={uploadProgress !== null}>
          <Upload className="w-4 h-4" />
          {uploadProgress !== null ? `Subiendo... ${Math.round(uploadProgress)}%` : 'Subir Archivo'}
        </Button>
      </div>

      {uploadProgress !== null && (
        <div className="mb-4">
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded-lg">
          Error: {error.message}
        </div>
      )}

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : assets.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {assets.map((asset) => (
            <AssetGridCard key={asset.fullPath} asset={asset} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Tu biblioteca de assets está vacía.</p>
            <p className="text-sm text-muted-foreground">Sube tu primer archivo para empezar.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(AssetsLibraryDynamic);