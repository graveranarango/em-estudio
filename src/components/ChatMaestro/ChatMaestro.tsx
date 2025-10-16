import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { uploadFile, subscribeToGroups } from '../../services/chatService';

export function ChatMaestro() {
  const { user } = useAuth();
  const [attachments, setAttachments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToGroups(user.uid, (newGroups) => {
        setGroups(newGroups);
        if (!activeGroupId && newGroups.length > 0) {
          setActiveGroupId(newGroups[0].id);
        }
      });
      return () => unsubscribe();
    }
  }, [user, activeGroupId]);

  useEffect(() => {
    if (user && activeGroupId) {
      const unsubscribe = subscribeToThreads(user.uid, activeGroupId, setThreads);
      return () => unsubscribe();
    }
  }, [user, activeGroupId]);

  const handleFileChange = async (event) => {
    if (event.target.files && event.target.files[0] && user) {
      const file = event.target.files[0];
      try {
        const downloadURL = await uploadFile(user.uid, file);
        setAttachments([...attachments, { name: file.name, url: downloadURL }]);
        console.log('File uploaded successfully:', downloadURL);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  return (
    <div>
      <h2>Chat Maestro</h2>
      <input type="file" onChange={handleFileChange} />
      <div>
        <h3>Attachments:</h3>
        <ul>
          {attachments.map((file, index) => (
            <li key={index}>
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                {file.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
      {/* Rest of the chat interface */}
    </div>
  );
}