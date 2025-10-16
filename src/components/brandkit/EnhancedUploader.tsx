import React, { useState, useCallback } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Upload,
  FileText,
  Image,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  File,
  CloudUpload
} from "lucide-react";
import { useBrandKit } from "../../contexts/BrandKitContext";

interface FilePreview {
  file: File;
  id: string;
  preview?: string;
  type: 'pdf' | 'docx' | 'image' | 'other';
}

const EnhancedUploader: React.FC = () => {
  const { uploadAndAnalyzeManual, isAnalyzing } = useBrandKit();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const allowedTypes = {
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/msword': 'docx',
    'image/png': 'image',
    'image/jpeg': 'image',
    'image/jpg': 'image',
    'image/gif': 'image',
    'image/webp': 'image'
  };

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const getFileType = (file: File): 'pdf' | 'docx' | 'image' | 'other' => {
    return allowedTypes[file.type as keyof typeof allowedTypes] || 'other';
  };

  const validateFile = (file: File): string | null => {
    if (!allowedTypes[file.type as keyof typeof allowedTypes]) {
      return 'Tipo de archivo no soportado. Usa PDF, DOCX o imágenes (PNG, JPG, GIF, WebP).';
    }
    
    if (file.size > maxFileSize) {
      return 'El archivo es demasiado grande. Máximo 10MB permitido.';
    }

    return null;
  };

  const createFilePreview = useCallback(async (file: File): Promise<FilePreview> => {
    const id = Math.random().toString(36).substr(2, 9);
    const type = getFileType(file);
    
    let preview: string | undefined;
    
    if (type === 'image') {
      preview = URL.createObjectURL(file);
    }
    
    return { file, id, preview, type };
  }, []);

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const newFiles: FilePreview[] = [];
    const errors: string[] = [];
    
    for (const file of Array.from(fileList)) {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
        continue;
      }
      
      const filePreview = await createFilePreview(file);
      newFiles.push(filePreview);
    }
    
    if (errors.length > 0) {
      setError(errors.join('\n'));
    } else {
      setError(null);
    }
    
    setFiles(prev => [...prev, ...newFiles]);
  }, [createFilePreview]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updated;
    });
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    try {
      setError(null);
      setUploadProgress(0);
      
      // For now, just use the first file
      const primaryFile = files[0].file;
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      await uploadAndAnalyzeManual(primaryFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Clear files after successful upload
      setTimeout(() => {
        setFiles([]);
        setUploadProgress(0);
      }, 1000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo');
      setUploadProgress(0);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return FileText;
      case 'docx': return File;
      case 'image': return Image;
      default: return File;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card 
        className={`transition-all duration-200 ${
          dragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
            : 'border-dashed border-2'
        }`}
      >
        <CardContent 
          className="p-8"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <CloudUpload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Sube tu Manual de Marca
              </h3>
              <p className="text-muted-foreground mb-4">
                Arrastra y suelta archivos aquí, o haz clic para seleccionar
              </p>
              
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                  <FileText className="w-3 h-3" />
                  PDF
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                  <File className="w-3 h-3" />
                  DOCX
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                  <Image className="w-3 h-3" />
                  PNG, JPG, WebP
                </div>
              </div>
            </div>
            
            <div>
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.gif,.webp"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
                disabled={isAnalyzing}
              />
              <Button asChild size="lg" disabled={isAnalyzing}>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-5 h-5 mr-2" />
                  Seleccionar Archivos
                </label>
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Máximo 10MB por archivo. La IA analizará automáticamente el contenido.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="whitespace-pre-line">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Procesando archivo...</span>
                  <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Archivos Seleccionados</h4>
              <Button 
                onClick={handleUpload} 
                disabled={isAnalyzing || files.length === 0}
                size="sm"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Analizar con IA
                  </>
                )}
              </Button>
            </div>
            
            <div className="space-y-3">
              {files.map((filePreview) => {
                const IconComponent = getFileIcon(filePreview.type);
                
                return (
                  <div key={filePreview.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    {filePreview.preview ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img 
                          src={filePreview.preview} 
                          alt={filePreview.file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{filePreview.file.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatFileSize(filePreview.file.size)}</span>
                        <span>•</span>
                        <span className="uppercase">{filePreview.type}</span>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(filePreview.id)}
                      disabled={isAnalyzing}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {uploadProgress === 100 && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700 dark:text-green-300">
            ¡Análisis completado! Tu BrandKit ha sido procesado exitosamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Processing Tips */}
      {isAnalyzing && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              ¿Qué está analizando la IA?
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Extrayendo paleta de colores y códigos HEX/RGB/CMYK</li>
              <li>• Identificando tipografías principales y secundarias</li>
              <li>• Detectando elementos de logo y variaciones</li>
              <li>• Analizando tono de voz y personalidad de marca</li>
              <li>• Generando reglas de uso y ejemplos</li>
              <li>• Creando guidelines de aplicación</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export { EnhancedUploader };