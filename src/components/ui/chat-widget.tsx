'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  UserIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'support' | 'system';
  timestamp: Date;
  senderName: string;
  type?: 'text' | 'file' | 'image';
}

interface ChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  userName?: string;
  userEmail?: string;
  // Props pour la personnalisation future
  theme?: 'light' | 'dark' | 'auto';
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  showTypingIndicator?: boolean;
  enableFileUpload?: boolean;
  enableVoiceMessage?: boolean;
  enableQuickReplies?: boolean;
  autoStart?: boolean;
}

// Hook personnalisé pour gérer le chat
const useChat = (userName?: string, userEmail?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Messages de bienvenue initiaux
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      content: `Bonjour${userName ? ` ${userName}` : ''} ! 👋\n\nBienvenue sur le support Gazoduc Invest. Comment puis-je vous aider aujourd'hui ?\n\nVous pouvez me poser des questions sur :\n• Vos investissements\n• Les transactions\n• Les fonctionnalités de la plateforme\n• Les problèmes techniques`,
      sender: 'support',
      timestamp: new Date(),
      senderName: 'Support Gazoduc'
    };

    setMessages([welcomeMessage]);
  }, [userName]);

  const sendMessage = async (content: string, type: 'text' | 'file' | 'image' = 'text') => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
      senderName: userName || 'Vous',
      type
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulation de réponse du support
    setTimeout(() => {
      let response: Message;

      if (content.toLowerCase().includes('investissement') || content.toLowerCase().includes('pack')) {
        response = {
          id: (Date.now() + 1).toString(),
          content: "Je vois que vous avez une question sur les investissements. Vous pouvez consulter vos packs actifs dans la section 'Mes Packs' du dashboard. Si vous souhaitez souscrire à un nouveau pack, assurez-vous d'avoir suffisamment de solde disponible.\n\nAvez-vous d'autres questions spécifiques ?",
          sender: 'support',
          timestamp: new Date(),
          senderName: 'Marie - Support Investissement'
        };
      } else if (content.toLowerCase().includes('transaction') || content.toLowerCase().includes('paiement')) {
        response = {
          id: (Date.now() + 1).toString(),
          content: "Pour les questions de transactions, vous pouvez consulter l'historique complet dans la section 'Transactions' du dashboard. Les dépôts sont généralement traités sous 24h, et les retraits sous 48h.\n\nSi votre transaction n'apparaît pas, pouvez-vous me donner le numéro de référence ?",
          sender: 'support',
          timestamp: new Date(),
          senderName: 'Pierre - Support Paiements'
        };
      } else if (content.toLowerCase().includes('problème') || content.toLowerCase().includes('erreur') || content.toLowerCase().includes('bug')) {
        response = {
          id: (Date.now() + 1).toString(),
          content: "Désolé d'apprendre que vous rencontrez un problème. Pourriez-vous me décrire précisément ce qui se passe ? Plus vous me donnerez de détails (étapes pour reproduire, messages d'erreur, etc.), plus je pourrai vous aider efficacement.\n\nJe peux également créer un ticket de support si nécessaire.",
          sender: 'support',
          timestamp: new Date(),
          senderName: 'Thomas - Support Technique'
        };
      } else {
        response = {
          id: (Date.now() + 1).toString(),
          content: "Merci pour votre message. Je vais transmettre votre demande à notre équipe spécialisée qui vous répondra dans les plus brefs délais.\n\nEn attendant, vous pouvez consulter notre FAQ ou créer un ticket détaillé dans la section Support du dashboard.\n\nY a-t-il autre chose dont vous auriez besoin ?",
          sender: 'support',
          timestamp: new Date(),
          senderName: 'Équipe Support'
        };
      }

      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1500 + Math.random() * 2000); // Délai aléatoire pour simuler la réalité
  };

  return {
    messages,
    isTyping,
    isConnected,
    sendMessage
  };
};

export function ChatWidget({
  isOpen,
  onToggle,
  userName,
  userEmail,
  theme = 'auto',
  position = 'bottom-right',
  primaryColor = '#2563eb',
  showTypingIndicator = true,
  enableFileUpload = false,
  enableVoiceMessage = false,
  enableQuickReplies = false,
  autoStart = false
}: ChatWidgetProps) {
  const { messages, isTyping, isConnected, sendMessage } = useChat(userName, userEmail);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickReplies = [
    "Comment souscrire à un pack ?",
    "Problème de transaction",
    "Question sur les gains",
    "Support technique"
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggle}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 bg-red-600 hover:bg-red-700"
          size="lg"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        </Button>
        {/* Badge de notification (pour personnalisation future) */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          1
        </div>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[500px] z-50 shadow-2xl border-2 border-blue-100 dark:border-blue-800">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg text-white">Support Gazoduc</CardTitle>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-xs text-white/80">
                  {isConnected ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col p-0 h-[calc(100%-80px)]">
        {/* Zone des messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : message.sender === 'system'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg'
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-bl-sm'
                }`}
              >
                {message.sender !== 'user' && (
                  <div className="flex items-center space-x-2 mb-1">
                    <UserIcon className="h-3 w-3" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {message.senderName}
                    </span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user'
                    ? 'text-blue-100'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Indicateur de frappe */}
          {isTyping && showTypingIndicator && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg rounded-bl-sm p-3 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-3 w-3" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Support Gazoduc
                  </span>
                </div>
                <div className="flex space-x-1 mt-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Réponses rapides (pour personnalisation future) */}
        {enableQuickReplies && messages.length === 1 && (
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage(reply)}
                  className="text-xs"
                >
                  {reply}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Zone de saisie */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Tapez votre message..."
                onKeyPress={handleKeyPress}
                className="pr-12"
                disabled={!isConnected}
              />
              {/* Boutons supplémentaires (pour personnalisation future) */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                {enableFileUpload && (
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    📎
                  </Button>
                )}
                {enableVoiceMessage && (
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    🎤
                  </Button>
                )}
              </div>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || !isConnected}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Statut de connexion */}
          {!isConnected && (
            <p className="text-xs text-red-500 mt-2">
              Déconnecté - Reconnexion en cours...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Export par défaut pour utilisation simple
export default function SupportChat({
  userName,
  userEmail
}: {
  userName?: string;
  userEmail?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ChatWidget
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
      userName={userName}
      userEmail={userEmail}
    />
  );
}
