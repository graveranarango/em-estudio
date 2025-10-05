import { useState, useCallback } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Upload, FileText, Image, X, CheckCircle } from "lucide-react";

interface BrandKitUploaderProps {
  onUploadComplete: (extractedData: any) => void;
}

export function BrandKitUploader({ onUploadComplete }: BrandKitUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && isValidFile(file)) {
      setUploadedFile(file);
      processFile(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidFile(file)) {
      setUploadedFile(file);
      processFile(file);
    }
  }, []);

  const isValidFile = (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'image/jpg'];
    return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB max
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // Progreso inicial
      setProgress(10);
      
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('file', file);
      
      setProgress(30);
      
      // Llamar al backend para análisis con Gemini
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ecf7df64/analyze-brand-manual`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: formData
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al analizar el archivo');
      }

      const result = await response.json();
      
      setProgress(90);

      if (!result.success) {
        throw new Error('El análisis no fue exitoso');
      }

      setProgress(100);

      // Use the normalized BrandKitData structure
      const normalizedBrandKit = result.analysis;

      // Show analysis information in console
      console.log('Archivo analizado por Gemini con normalización completa:', {
        brandName: normalizedBrandKit.meta.brandName,
        processingTime: result.processingTime,
        extractedBy: result.extractedBy,
        primaryColors: normalizedBrandKit.colors.primary.length,
        secondaryColors: normalizedBrandKit.colors.secondary.length,
        primaryFont: normalizedBrandKit.typography.primary.name,
        secondaryFont: normalizedBrandKit.typography.secondary.name,
        logosFound: normalizedBrandKit.logos.length,
        complianceRate: normalizedBrandKit.validation.coherenceReport.complianceRate
      });

      setTimeout(() => {
        onUploadComplete(normalizedBrandKit);
        setIsProcessing(false);
      }, 500);

    } catch (error) {
      console.error('Error processing file with Gemini:', error);
      setIsProcessing(false);
      
      // Mostrar error al usuario
      alert(`Error al procesar el archivo: ${error.message}`);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setIsProcessing(false);
    setProgress(0);
  };

  if (uploadedFile && !isProcessing) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-medium">Manual de marca procesado</p>
              <p className="text-sm text-muted-foreground">{uploadedFile.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={removeFile}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    );
  }

  if (isProcessing) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-500" />
            <div>
              <p className="font-medium">Procesando manual de marca</p>
              <p className="text-sm text-muted-foreground">{uploadedFile?.name}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Analizando con IA...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="text-sm text-muted-foreground">
            {progress < 30 && "Subiendo archivo..."}
            {progress >= 30 && progress < 70 && "Analizando con Gemini Ultra..."}
            {progress >= 70 && progress < 90 && "Extrayendo elementos de marca..."}
            {progress >= 90 && "Finalizando análisis..."}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={`p-8 border-2 border-dashed transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-muted-foreground/20'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <Upload className="w-8 h-8 text-muted-foreground" />
        </div>
        
        <div>
          <h3 className="mb-2">Sube tu manual de marca</h3>
          <p className="text-muted-foreground mb-4">
            Arrastra y suelta tu archivo aquí, o haz clic para seleccionar
          </p>
          <p className="text-sm text-muted-foreground">
            Formatos: PDF, DOCX, PNG, JPG (máx. 10MB)
          </p>
        </div>
        
        <div className="flex gap-2 justify-center">
          <Button asChild>
            <label htmlFor="file-upload" className="cursor-pointer">
              <FileText className="w-4 h-4 mr-2" />
              Seleccionar archivo
            </label>
          </Button>
          <input
            id="file-upload"
            type="file"
            accept=".pdf,.docx,.png,.jpg,.jpeg"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    </Card>
  );
}