'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { products, posts, categories, couponCodes, recipes, Recipe } from '@/data/corrin-data';
import { Marquee } from '@/components/Marquee';
import { BrandCards } from '@/components/BrandCards';
import { SupportForm } from '@/components/SupportForm';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  action?: 'show_brands' | 'collect_input' | 'complete';
  brands?: Array<{ brand: string; product: string; code: string }>;
  inputType?: 'name' | 'order' | 'problem' | 'phone';
}

interface SupportState {
  step: 'detect' | 'brand' | 'name' | 'order' | 'problem' | 'phone' | 'complete';
  data: {
    brand?: string;
    customerName?: string;
    orderNumber?: string;
    problemDetails?: string;
    customerPhone?: string;
  };
}

// Recipe Modal Component
function RecipeModal({ 
  recipe, 
  onClose,
  onAskAssistant 
}: { 
  recipe: Recipe; 
  onClose: () => void;
  onAskAssistant: (question: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Image */}
        <div className="relative h-48 sm:h-56">
          <Image
            src={`/instagram/${recipe.shortcode}.jpg`}
            alt={recipe.name}
            fill
            className="object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[calc(90vh-14rem)]">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{recipe.name}</h2>
          <p className="text-sm text-gray-600 mb-5">{recipe.description}</p>

          {/* Ingredients */}
          <div className="mb-5">
            <h3 className="font-semibold text-gray-900 mb-3">מצרכים</h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0" />
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="mb-5">
            <h3 className="font-semibold text-gray-900 mb-3">אופן ההכנה</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {recipe.instructions}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => {
                onAskAssistant(`יש לי שאלה על המתכון "${recipe.name}"`);
                onClose();
              }}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl text-sm font-medium transition-colors"
            >
              שאלה על המתכון
            </button>
            <a
              href={recipe.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-4 btn-primary rounded-xl text-sm font-medium text-center"
            >
              צפייה באינסטגרם
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Corrin's profile avatar - local file
const CORRIN_AVATAR = '/corrin-avatar.jpg';

// Instagram image component - uses local downloaded images
function InstagramImage({ 
  shortcode, 
  alt, 
  className = '',
  fill = false,
  width,
  height,
  sizes
}: { 
  shortcode: string; 
  alt: string; 
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
}) {
  // Use local images from public/instagram folder
  const imageSrc = `/instagram/${shortcode}.jpg`;

  if (fill) {
    return (
      <Image
        src={imageSrc}
        alt={alt}
        fill
        sizes={sizes}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width || 200}
      height={height || 200}
      className={`object-cover ${className}`}
    />
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'chat' | 'search'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [avatarSrc, setAvatarSrc] = useState(CORRIN_AVATAR);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [supportState, setSupportState] = useState<SupportState | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ask assistant about something
  const askAssistant = (question: string) => {
    setActiveTab('chat');
    setInputValue(question);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const startNewChat = () => {
    setMessages([]);
    setThreadId(null);
    setInputValue('');
    setSupportState(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle support flow input (from form or brand selection)
  const handleSupportInput = async (value: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: value,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: value,
          supportState,
        }),
      });

      const data = await response.json();

      if (data.supportState) {
        setSupportState(data.supportState);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        action: data.action,
        brands: data.brands,
        inputType: data.inputType,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // If complete, send WhatsApp message
      if (data.action === 'send_whatsapp' && data.supportData) {
        await fetch('/api/whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ supportData: data.supportData }),
        });
        // Reset support state after sending
        setSupportState(null);
      }
    } catch (error) {
      console.error('Support error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'אופס! משהו השתבש. נסי שוב בבקשה.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageContent = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      // If already in support mode, continue support flow
      if (supportState && supportState.step !== 'detect') {
        await handleSupportInput(messageContent);
        return;
      }

      // Check for support intent first
      const supportResponse = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          supportState: { step: 'detect', data: {} },
        }),
      });

      const supportData = await supportResponse.json();

      // If it's a support request, handle it
      if (supportData.action !== 'use_assistant') {
        if (supportData.supportState) {
          setSupportState(supportData.supportState);
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: supportData.response,
          action: supportData.action,
          brands: supportData.brands,
          inputType: supportData.inputType,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
        return;
      }

      // Otherwise, use the regular assistant
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          threadId,
        }),
      });

      const data = await response.json();

      if (data.threadId) {
        setThreadId(data.threadId);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'מצטערת, לא הצלחתי לעבד את הבקשה. נסי שוב!',
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'אופס! משהו השתבש. נסי שוב בבקשה.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' ||
      p.category === selectedCategory ||
      (selectedCategory === 'fashion' && p.category === 'אופנה') ||
      (selectedCategory === 'beauty' && p.category === 'טיפוח') ||
      (selectedCategory === 'tech' && p.category === 'טכנולוגיה') ||
      (selectedCategory === 'food' && p.category === 'אוכל') ||
      (selectedCategory === 'home' && p.category === 'בית');
    return matchesSearch && matchesCategory;
  });

  const suggestedQuestions = [
    'מה קוד הקופון הכי שווה עכשיו?',
    'יש לי שאלה על מתכון הפיצה',
    'אין לי ביצים, מה אפשר לשים במקום?',
    'תמליצי על מתכון מהיר לארוחת ערב',
  ];

  const openInstagramPost = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 glass px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 overflow-hidden leaf-tr">
              <Image
                src={avatarSrc}
                alt="קורין גדעון"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                onError={() => {}}
                priority
              />
            </div>
            <div>
              <h1 className="font-semibold text-base text-gray-900">העוזרת של קורין</h1>
              <p className="text-xs text-gray-500">מוצרים, קופונים ומתכונים</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && activeTab === 'chat' && (
              <button
                onClick={startNewChat}
                className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
              >
                שיחה חדשה
              </button>
            )}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'chat'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                צ׳אט
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'search'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                חיפוש
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col relative"
            >
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-6 pb-24 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center px-4 pt-12">
                    <div className="w-16 h-16 overflow-hidden rounded-2xl mb-5">
                      <Image
                        src={avatarSrc}
                        alt="קורין גדעון"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        onError={() => {}}
                        priority
                      />
                    </div>

                    <h2 className="text-xl font-semibold mb-2 text-gray-900">היי! אני העוזרת של קורין 👋</h2>
                    <p className="text-gray-500 mb-6 max-w-sm text-sm leading-relaxed">
                      אני כאן לעזור לכם עם מתכונים, טיפים לבישול, תחליפים למרכיבים וקודי קופון
                    </p>

                    {/* How to use */}
                    <div className="w-full max-w-md bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-xl p-4 mb-6">
                      <p className="font-medium text-gray-900 text-sm mb-3">מה אני יכולה לעשות?</p>
                      <ul className="text-right text-xs text-gray-600 space-y-2">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0" />
                          לעזור עם מתכונים - הסברים, טיפים ושיפורים
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0" />
                          להציע תחליפים למרכיבים שאין לכם
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0" />
                          לשתף קודי קופון והמלצות על מוצרים
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0" />
                          לענות על שאלות בנושא בישול ואפייה
                        </li>
                      </ul>
                    </div>

                    {/* Quick actions */}
                    <div className="w-full max-w-md grid grid-cols-2 gap-3 mb-6">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('search');
                          setSelectedCategory('recipes');
                        }}
                        className="p-4 text-right bg-gray-50 hover:bg-gray-100 transition-colors leaf-tr border border-gray-100"
                      >
                        <p className="font-medium text-gray-900 text-sm">צפייה במתכונים</p>
                        <p className="text-xs text-gray-500 mt-1">כל המתכונים של קורין</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('search');
                          setSearchQuery('קופון');
                        }}
                        className="p-4 text-right bg-gray-50 hover:bg-gray-100 transition-colors leaf-tr border border-gray-100"
                      >
                        <p className="font-medium text-gray-900 text-sm">קודי קופון</p>
                        <p className="text-xs text-gray-500 mt-1">הנחות ומבצעים</p>
                      </button>
                    </div>

                    <p className="text-xs text-gray-400 mb-3">נסו לשאול:</p>

                    {/* Suggestions */}
                    <div className="flex flex-wrap gap-2 justify-center max-w-md mb-8">
                      {suggestedQuestions.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setInputValue(q);
                            inputRef.current?.focus();
                          }}
                          className="px-3 py-2 text-sm bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-all rounded-lg"
                        >
                          {q}
                        </button>
                      ))}
                    </div>

                    {/* Products Marquee */}
                    <div className="w-full mt-6">
                      <p className="text-xs text-gray-400 mb-3 text-center">מוצרים מומלצים</p>
                      <div className="relative">
                        <Marquee speed={25} pauseOnHover>
                          {products.map((product) => (
                            <a
                              key={product.id}
                              href={product.shortLink || product.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0 w-40 bg-white border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all overflow-hidden"
                            >
                              <div className="w-full h-20 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-12 h-12 object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <span className="text-2xl font-bold text-gray-300">{product.brand.charAt(0)}</span>
                                )}
                              </div>
                              <div className="p-3">
                                <p className="font-medium text-gray-900 text-xs truncate">{product.name}</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">{product.brand}</p>
                                {product.couponCode && (
                                  <span className="inline-block mt-1.5 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-medium rounded-full">
                                    קופון
                                  </span>
                                )}
                              </div>
                            </a>
                          ))}
                        </Marquee>
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => (
                      <div key={msg.id}>
                        <div
                          className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-[85%] px-4 py-3 ${
                              msg.role === 'user'
                                ? 'chat-bubble-user'
                                : 'chat-bubble-assistant'
                            }`}
                          >
                            {msg.role === 'user' ? (
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            ) : (
                              <div className="text-sm markdown-content">
                                <ReactMarkdown
                                  components={{
                                    a: ({ href, children }) => (
                                      <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[var(--accent)] hover:underline"
                                      >
                                        {children}
                                      </a>
                                    ),
                                    strong: ({ children }) => (
                                      <strong className="font-semibold">{children}</strong>
                                    ),
                                    p: ({ children }) => (
                                      <p className="mb-2 last:mb-0">{children}</p>
                                    ),
                                    ul: ({ children }) => (
                                      <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
                                    ),
                                    ol: ({ children }) => (
                                      <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
                                    ),
                                    li: ({ children }) => <li className="text-sm">{children}</li>,
                                    code: ({ children }) => (
                                      <code className="px-1.5 py-0.5 rounded text-sm bg-gray-100 font-mono">
                                        {children}
                                      </code>
                                    ),
                                  }}
                                >
                                  {msg.content}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Show Brand Cards after assistant message with show_brands action */}
                        {msg.role === 'assistant' && msg.action === 'show_brands' && msg.brands && index === messages.length - 1 && !isLoading && (
                          <div className="mt-4">
                            <BrandCards
                              brands={msg.brands}
                              onSelect={(brand) => handleSupportInput(brand)}
                            />
                          </div>
                        )}
                        
                        {/* Show Support Form after assistant message with collect_input action */}
                        {msg.role === 'assistant' && msg.action === 'collect_input' && msg.inputType && index === messages.length - 1 && !isLoading && (
                          <div className="mt-4">
                            <SupportForm
                              inputType={msg.inputType}
                              onSubmit={(value) => handleSupportInput(value)}
                              isLoading={isLoading}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-end">
                        <div className="chat-bubble-assistant px-4 py-3 flex gap-1">
                          <div className="typing-dot" />
                          <div className="typing-dot" />
                          <div className="typing-dot" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Chat Input - Fixed at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
                <div className="max-w-2xl mx-auto flex gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="שאלי אותי משהו..."
                    className="flex-1 search-input rounded-xl px-4 py-3 text-sm outline-none"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="btn-primary px-5 py-3 rounded-xl text-sm font-medium disabled:opacity-40"
                  >
                    שלח
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full overflow-y-auto"
            >
              {/* Search Header */}
              <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-4">
                <div className="max-w-2xl mx-auto">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="חפשי מוצרים, קופונים, מתכונים..."
                    className="w-full search-input rounded-xl px-4 py-3 text-sm outline-none"
                  />

                  {/* Categories */}
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap font-medium transition-all ${
                          selectedCategory === cat.id
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-4 py-6">
                <div className="max-w-2xl mx-auto space-y-8">
                  {/* Coupon Codes */}
                  {(searchQuery.includes('קופון') || searchQuery.includes('הנחה') || searchQuery === '') && (
                    <section>
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">קודי קופון</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {couponCodes.slice(0, 6).map((coupon) => (
                          <button
                            key={coupon.code}
                            onClick={() => handleCopyCode(coupon.code)}
                            className="p-4 bg-gray-50 hover:bg-gray-100 transition-colors leaf-tr text-right"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-500">{coupon.brand}</span>
                              <span className={`text-xs font-medium ${copiedCode === coupon.code ? 'text-green-600' : 'text-gray-400'}`}>
                                {copiedCode === coupon.code ? 'הועתק!' : 'העתק'}
                              </span>
                            </div>
                            <p className="font-mono font-bold text-base text-gray-900">{coupon.code}</p>
                            <p className="text-xs text-gray-500 mt-1">{coupon.description}</p>
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Recipes */}
                  {(selectedCategory === 'all' || selectedCategory === 'recipes' || searchQuery.includes('מתכון')) && (
                    <section>
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">מתכונים</h3>
                      <div className="space-y-3">
                        {recipes.map((recipe) => (
                          <button
                            key={recipe.id}
                            onClick={() => setSelectedRecipe(recipe)}
                            className="w-full flex gap-4 p-3 bg-gray-50 hover:bg-gray-100 transition-colors leaf-tr text-right"
                          >
                            <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                              <InstagramImage
                                shortcode={recipe.shortcode}
                                alt={recipe.name}
                                width={80}
                                height={80}
                                className="w-full h-full"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm text-gray-900">{recipe.name}</h4>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{recipe.description}</p>
                              <span className="text-xs text-[var(--accent)] mt-2 inline-block">לצפייה במתכון המלא →</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Products */}
                  <section>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">מוצרים</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {filteredProducts.map((product) => (
                        <a
                          key={product.id}
                          href={product.shortLink || product.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="product-card rounded-xl overflow-hidden"
                        >
                          <div className="aspect-square relative bg-gray-100">
                            {product.image && (
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                sizes="(max-width: 768px) 50vw, 200px"
                                className="object-cover"
                              />
                            )}
                            {product.couponCode && (
                              <span className="badge absolute top-2 right-2">קופון</span>
                            )}
                          </div>
                          <div className="p-3">
                            <p className="text-xs text-[var(--accent)] font-medium">{product.brand}</p>
                            <h4 className="font-medium text-sm text-gray-900 line-clamp-2 mt-0.5">{product.name}</h4>
                            {product.couponCode && (
                              <p className="text-xs text-gray-500 font-mono mt-1">{product.couponCode}</p>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  </section>

                  {/* Instagram Posts */}
                  <section>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">פוסטים אחרונים</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {posts.map((post) => (
                        <button
                          key={post.id}
                          onClick={() => openInstagramPost(post.url)}
                          className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 group"
                        >
                          <InstagramImage
                            shortcode={post.shortcode}
                            alt={post.caption}
                            fill
                            sizes="(max-width: 768px) 33vw, 150px"
                            className="transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                            <p className="text-[10px] text-white line-clamp-2">{post.caption}</p>
                          </div>
                          {post.brand && (
                            <span className="badge absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5">
                              {post.brand}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recipe Modal */}
      <AnimatePresence>
        {selectedRecipe && (
          <RecipeModal
            recipe={selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
            onAskAssistant={askAssistant}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
