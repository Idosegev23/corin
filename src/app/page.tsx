'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { 
  Search, 
  Send, 
  MessageCircle, 
  ShoppingBag, 
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  ChefHat
} from 'lucide-react';
import { products, posts, categories, couponCodes, recipes } from '@/data/corrin-data';
import { Marquee } from '@/components/Marquee';
import GlassSurface from '@/components/GlassSurface';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
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
    'מה קוד הקופון לפאפא ג\'ונס?',
    'איפה אפשר לקנות את הבגדים מאדיקט?',
    'מה המוצרים הכי פופולריים?',
    'יש הנחה על Philips?',
    'תני לי מתכון טעים',
    'מה יש לך בטיפוח?',
  ];

  return (
    <main className="min-h-screen flex flex-col">
      {/* Products Marquee - Always visible at top */}
      <div className="marquee-container py-3 overflow-hidden">
        <Marquee pauseOnHover className="[--duration:20s]" repeat={4}>
          {products.map((product) => (
            <a
              key={product.id}
              href={product.shortLink || product.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2 mx-2 rounded-full transition-all hover:scale-105"
              style={{
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(247, 127, 63, 0.2)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
              }}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <span className="text-sm font-medium text-gray-800 whitespace-nowrap">{product.name}</span>
              {product.couponCode && (
                <span className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full font-bold shadow-sm">
                  {product.couponCode}
                </span>
              )}
            </a>
          ))}
        </Marquee>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <GlassSurface
              width={56}
              height={56}
              borderRadius={28}
              brightness={95}
              opacity={0.95}
              className="flex-shrink-0"
            >
              <span className="text-2xl font-bold text-orange-500">C</span>
            </GlassSurface>
            <div>
              <h1 className="font-bold text-xl text-gray-800">Corrin Gideon</h1>
              <p className="text-sm text-gray-500">העוזרת האישית שלך</p>
            </div>
          </div>
          <div className="flex gap-2 bg-white rounded-full p-1.5 shadow-sm border border-gray-100">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === 'search'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-col"
            >
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', bounce: 0.5 }}
                    >
                      <GlassSurface
                        width={100}
                        height={100}
                        borderRadius={50}
                        brightness={98}
                        opacity={0.95}
                        className="mb-6 animate-pulse-glow"
                      >
                        <Sparkles className="w-12 h-12 text-orange-500" />
                      </GlassSurface>
                    </motion.div>
                    <h2 className="text-2xl font-bold mb-3 text-gray-800">היי! אני קורין</h2>
                    <p className="text-gray-500 mb-8 max-w-sm text-lg">
                      שאלי אותי הכל על המוצרים שלי, קודי קופון, מתכונים ומה שתרצי!
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center max-w-lg">
                      {suggestedQuestions.map((q, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          onClick={() => {
                            setInputValue(q);
                            inputRef.current?.focus();
                          }}
                          className="px-4 py-2.5 text-sm bg-white rounded-full border border-gray-200 hover:border-orange-400 hover:shadow-md transition-all text-gray-700"
                        >
                          {q}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[85%] px-5 py-4 ${
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
                                      className="text-orange-500 hover:text-orange-600 underline inline-flex items-center gap-1"
                                    >
                                      {children}
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  ),
                                  strong: ({ children }) => (
                                    <strong className="font-bold text-orange-600">{children}</strong>
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
                                  li: ({ children }) => (
                                    <li className="text-sm">{children}</li>
                                  ),
                                  code: ({ children }) => (
                                    <code className="bg-orange-50 px-2 py-0.5 rounded font-mono text-orange-600">
                                      {children}
                                    </code>
                                  ),
                                  h1: ({ children }) => (
                                    <h1 className="text-lg font-bold mb-2 text-gray-800">{children}</h1>
                                  ),
                                  h2: ({ children }) => (
                                    <h2 className="text-base font-bold mb-2 text-gray-800">{children}</h2>
                                  ),
                                  h3: ({ children }) => (
                                    <h3 className="text-sm font-bold mb-1 text-gray-800">{children}</h3>
                                  ),
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-end"
                      >
                        <div className="chat-bubble-assistant px-5 py-4 flex gap-1">
                          <div className="typing-dot" />
                          <div className="typing-dot" />
                          <div className="typing-dot" />
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 glass">
                <div className="max-w-2xl mx-auto flex gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="שאלי אותי משהו..."
                    className="flex-1 search-input rounded-full px-5 py-4 text-base outline-none"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="btn-primary w-14 h-14 rounded-full flex items-center justify-center disabled:opacity-50"
                  >
                    <Send className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full overflow-y-auto"
            >
              {/* Search Header */}
              <div className="sticky top-0 z-40 glass px-4 py-5">
                <div className="max-w-2xl mx-auto">
                  <div className="relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="חפשי מוצרים, קודי קופון, מתכונים..."
                      className="w-full search-input rounded-2xl pr-12 pl-5 py-4 text-base outline-none"
                    />
                  </div>
                  
                  {/* Categories - Bigger */}
                  <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`category-pill px-5 py-3 rounded-full text-base whitespace-nowrap flex items-center gap-2 font-medium ${
                          selectedCategory === cat.id ? 'active' : ''
                        }`}
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="px-4 py-6">
                <div className="max-w-2xl mx-auto">
                  {/* Coupon Codes Section */}
                  {searchQuery.includes('קופון') || searchQuery.includes('הנחה') || searchQuery === '' ? (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                        <span className="text-2xl">🎫</span>
                        קודי קופון
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {couponCodes.slice(0, 6).map((coupon) => (
                          <motion.div
                            key={coupon.code}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleCopyCode(coupon.code)}
                            className="product-card rounded-2xl p-4 cursor-pointer"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-500">{coupon.brand}</span>
                              {copiedCode === coupon.code ? (
                                <Check className="w-5 h-5 text-green-500" />
                              ) : (
                                <Copy className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <p className="font-mono font-bold text-lg text-orange-500">{coupon.code}</p>
                            <p className="text-sm text-gray-500 mt-1">{coupon.description}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Recipes Section */}
                  {(selectedCategory === 'all' || selectedCategory === 'recipes' || searchQuery.includes('מתכון')) && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                        <ChefHat className="w-6 h-6 text-orange-500" />
                        מתכונים
                      </h3>
                      <div className="space-y-3">
                        {recipes.slice(0, 4).map((recipe, index) => (
                          <motion.a
                            key={recipe.id}
                            href={recipe.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="product-card rounded-2xl overflow-hidden flex gap-4"
                          >
                            <div className="w-28 h-28 flex-shrink-0">
                              <img
                                src={recipe.image}
                                alt={recipe.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-4 flex-1">
                              <h4 className="font-bold text-base text-orange-600">{recipe.name}</h4>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {recipe.description}
                              </p>
                              <div className="flex items-center gap-1 mt-3 text-sm text-orange-500">
                                <ExternalLink className="w-4 h-4" />
                                <span>לצפייה במתכון</span>
                              </div>
                            </div>
                          </motion.a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Products */}
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                    <ShoppingBag className="w-6 h-6 text-orange-500" />
                    מוצרים
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {filteredProducts.map((product, index) => (
                      <motion.a
                        key={product.id}
                        href={product.shortLink || product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="product-card rounded-2xl overflow-hidden block"
                      >
                        <div className="aspect-square relative">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          {product.couponCode && (
                            <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                              קופון
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-orange-500 font-medium mb-1">{product.brand}</p>
                          <h4 className="font-medium text-base line-clamp-2 text-gray-800">{product.name}</h4>
                          {product.couponCode && (
                            <p className="text-sm text-orange-600 mt-2 font-mono font-bold">
                              {product.couponCode}
                            </p>
                          )}
                          <div className="flex items-center gap-1 mt-3 text-sm text-gray-500">
                            <ExternalLink className="w-4 h-4" />
                            <span>לצפייה</span>
                          </div>
                        </div>
                      </motion.a>
                    ))}
                  </div>

                  {/* Instagram Posts */}
                  <h3 className="text-xl font-bold mt-8 mb-4 flex items-center gap-2 text-gray-800">
                    <span className="text-2xl">📸</span>
                    פוסטים אחרונים
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {posts.map((post, index) => (
                      <motion.a
                        key={post.id}
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="aspect-square relative rounded-2xl overflow-hidden group shadow-sm"
                      >
                        <img
                          src={post.image}
                          alt={post.caption}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                          <p className="text-xs text-white line-clamp-2">{post.caption}</p>
                        </div>
                        {post.brand && (
                          <div className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] px-2 py-1 rounded-full font-medium">
                            {post.brand}
                          </div>
                        )}
                      </motion.a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
