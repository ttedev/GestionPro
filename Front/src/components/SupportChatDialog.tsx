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
import { Send, MessageCircle, RefreshCw } from 'lucide-react';
import { supportAPI, type SupportMessage } from '../api/apiClient';
import { toast } from 'sonner';

interface SupportChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnreadCountChange?: (count: number) => void;
}

export function SupportChatDialog({ open, onOpenChange, onUnreadCountChange }: SupportChatDialogProps) {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await supportAPI.getMessages();
      setMessages(data);
      // Marquer comme lus
      await supportAPI.markAsRead();
    } catch (e) {
      console.error('Erreur chargement messages', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadMessages().then(() => {
        onUnreadCountChange?.(0);
      });
    }

    // Reset quand le dialog se ferme
    if (!open) {
      hasLoadedRef.current = false;
    }
  }, [open, loadMessages, onUnreadCountChange]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const sent = await supportAPI.sendMessage(newMessage.trim());
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[100dvh] sm:h-[600px] max-h-[100dvh] sm:max-h-[90vh] flex flex-col p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            Contacter le support
          </DialogTitle>
          <DialogDescription>
            Envoyez-nous un message, nous vous répondrons dès que possible.
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
                <p className="text-sm">Commencez la conversation !</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.fromAdmin ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.fromAdmin
                        ? 'bg-white border border-gray-200'
                        : 'bg-green-600 text-white'
                    }`}
                  >
                    {msg.fromAdmin && (
                      <p className="text-xs text-green-600 font-medium mb-1">Support</p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.fromAdmin ? 'text-gray-400' : 'text-green-200'
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
            placeholder="Écrivez votre message..."
            className="resize-none"
            rows={2}
            disabled={sending}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="bg-green-600 hover:bg-green-700 px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

