import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { uploadFile, subscribeToGroups, subscribeToThreads, updateMessageContent, subscribeToMessages } from '../../services/chatService';
import { BrandGuardPanel } from '../BrandGuard/BrandGuardPanel';
import { Button } from '../ui/button';

export function ChatMaestro() {
  const { user } = useAuth();
  const [attachments, setAttachments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState([]);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

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
      const unsubscribe = subscribeToThreads(user.uid, activeGroupId, (newThreads) => {
        setThreads(newThreads);
        if (!activeThreadId && newThreads.length > 0) {
          setActiveThreadId(newThreads[0].id);
        }
      });
      return () => unsubscribe();
    }
  }, [user, activeGroupId, activeThreadId]);

  useEffect(() => {
    if (user && activeThreadId) {
      const unsubscribe = subscribeToMessages(user.uid, activeThreadId, setMessages);
      return () => unsubscribe();
    }
  }, [user, activeThreadId]);

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

  const handleToggleReport = (messageId: string) => {
    setExpandedReportId(prevId => (prevId === messageId ? null : messageId));
  };

  const handleApplySuggestion = (messageId: string, suggestion: string) => {
    if (user && activeThreadId) {
      updateMessageContent(user.uid, activeThreadId, messageId, suggestion)
        .catch(error => console.error("Failed to apply suggestion:", error));
    }
  };

  return (
    <div>
      <h2>Chat Maestro</h2>
      <div className="message-list p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`message p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <p>{msg.content}</p>
            {msg.role === 'assistant' && msg.brandGuardReport && (
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={() => handleToggleReport(msg.id)}>
                  Ver Informe de Marca
                </Button>
                {expandedReportId === msg.id && (
                  <div className="mt-2">
                    <BrandGuardPanel
                      report={msg.brandGuardReport}
                      onApplySuggestion={(suggestion) => handleApplySuggestion(msg.id, suggestion)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Rest of the chat interface */}
    </div>
  );
}