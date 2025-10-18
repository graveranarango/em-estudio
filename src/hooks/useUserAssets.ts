import { useState, useEffect, useCallback } from 'react';
import { getStorage, ref, listAll, getDownloadURL, uploadBytesResumable, deleteObject, UploadTaskSnapshot } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

export interface UserAsset {
  url: string;
  name: string;
  fullPath: string;
}

export function useUserAssets() {
  const [assets, setAssets] = useState<UserAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const storage = getStorage();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const listAssets = useCallback(async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const userAssetsRef = ref(storage, `users/${currentUser.uid}/assets`);
      const res = await listAll(userAssetsRef);

      const userAssets = await Promise.all(
        res.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return {
            url,
            name: itemRef.name,
            fullPath: itemRef.fullPath,
          };
        })
      );

      setAssets(userAssets);
    } catch (err) {
      console.error("Error listing assets:", err);
      setError(err instanceof Error ? err : new Error('Failed to list assets'));
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, storage]);

  useEffect(() => {
    listAssets();
  }, [listAssets]);

  const uploadAsset = useCallback((file: File) => {
    if (!currentUser) {
      setError(new Error('User not authenticated for upload.'));
      return;
    }

    const assetRef = ref(storage, `users/${currentUser.uid}/assets/${file.name}`);
    const uploadTask = uploadBytesResumable(assetRef, file);

    uploadTask.on('state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (err) => {
        console.error("Upload failed:", err);
        setError(err);
        setUploadProgress(null);
      },
      () => {
        setUploadProgress(null);
        listAssets(); // Refresh asset list after upload
      }
    );
  }, [currentUser, storage, listAssets]);

  const deleteAsset = useCallback(async (fullPath: string) => {
    try {
      const assetRef = ref(storage, fullPath);
      await deleteObject(assetRef);
      listAssets(); // Refresh asset list after deletion
    } catch (err) {
      console.error("Error deleting asset:", err);
      setError(err instanceof Error ? err : new Error('Failed to delete asset'));
    }
  }, [storage, listAssets]);

  return { assets, isLoading, error, uploadProgress, uploadAsset, deleteAsset };
}