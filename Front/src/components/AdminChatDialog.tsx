import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Send, MessageCircle, RefreshCw, User } from 'lucide-react';
import { adminAPI, type SupportMessage, type AdminUser } from '../api/apiClient';
import { toast } from 'sonner';

interface AdminChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  onMessagesRead?: () => void;
}

export function AdminChatDialog({ open, onOpenChange, user, onMessagesRead }: AdminChatDialogProps) {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);
  const currentUserIdRef = useRef<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await adminAPI.getUserMessages(user.id);
      setMessages(data);
      // Marquer comme lus
      await adminAPI.markUserMessagesAsRead(user.id);
    } catch (e) {
      console.error('Erreur chargement messages', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Reset le flag si l'utilisateur change
    if (user?.id !== currentUserIdRef.current) {
      hasLoadedRef.current = false;
      currentUserIdRef.current = user?.id || null;
    }

    if (open && user && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadMessages().then(() => {
        // Appeler onMessagesRead après le chargement
        onMessagesRead?.();
      });
    }

    // Reset quand le dialog se ferme
    if (!open) {
      hasLoadedRef.current = false;
    }
  }, [open, user, loadMessages, onMessagesRead]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      const sent = await adminAPI.sendMessageToUser(user.id, newMessage.trim());
      setMessages([...messages, sent]);
      setNewMessage('');
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="inset-0 w-full h-full max-w-full max-h-full rounded-none p-4 pt-12 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[500px] sm:h-[600px] sm:max-w-[500px] sm:max-h-[90vh] sm:rounded-lg sm:p-6 flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <span>{user.firstName} {user.lastName}</span>
              <p className="text-sm font-normal text-gray-500">@{user.username}</p>
            </div>
          </DialogTitle>
          <DialogDescription>
            Conversation avec cet utilisateur
          </DialogDescription>
        </DialogHeader>

        {/* Messages area */}
        <div className="flex-1 min-h-0 overflow-y-auto border rounded-lg p-4 bg-gray-50 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Aucun message</p>
                <p className="text-sm">Cet utilisateur n'a pas encore envoyé de message</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.fromAdmin ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.fromAdmin
                        ? 'bg-purple-600 text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    {!msg.fromAdmin && (
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        {user.firstName}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.fromAdmin ? 'text-purple-200' : 'text-gray-400'
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input area */}
        <div className="flex gap-2 pt-2 flex-shrink-0">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Répondre à l'utilisateur..."
            className="resize-none"
            rows={2}
            disabled={sending}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="bg-purple-600 hover:bg-purple-700 px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

