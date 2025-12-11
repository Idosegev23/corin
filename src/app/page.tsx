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
  X,
  ChevronDown
} from 'lucide-react';
import { products, posts, categories, couponCodes, recipes } from '@/data/corrin-data';
import { Marquee } from '@/components/Marquee';
import { ChefHat } from 'lucide-react';

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
  ];

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
              <span className="text-lg font-bold">C</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">Corrin Gideon</h1>
              <p className="text-xs text-[var(--text-secondary)]">העוזרת האישית שלך</p>
            </div>
          </div>
          <div className="flex gap-1 bg-[var(--bg-card)] rounded-full p-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                activeTab === 'chat'
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                activeTab === 'search'
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              <Search className="w-4 h-4" />
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
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', bounce: 0.5 }}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center mb-6 animate-pulse-glow"
                    >
                      <Sparkles className="w-10 h-10 text-white" />
                    </motion.div>
                    <h2 className="text-xl font-bold mb-2">היי! אני קורין</h2>
                    <p className="text-[var(--text-secondary)] mb-6 max-w-xs">
                      שאלי אותי הכל על המוצרים שלי, קודי קופון, ומה שתרצי!
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center max-w-sm">
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
                          className="px-3 py-2 text-sm bg-[var(--bg-card)] rounded-full border border-[rgba(255,255,255,0.1)] hover:border-[var(--primary)] transition-all"
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
                                      className="text-[var(--primary)] hover:text-[var(--accent)] underline inline-flex items-center gap-1"
                                    >
                                      {children}
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  ),
                                  strong: ({ children }) => (
                                    <strong className="font-bold text-[var(--accent)]">{children}</strong>
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
                                    <code className="bg-[rgba(255,255,255,0.1)] px-2 py-0.5 rounded font-mono text-[var(--primary)]">
                                      {children}
                                    </code>
                                  ),
                                  h1: ({ children }) => (
                                    <h1 className="text-lg font-bold mb-2">{children}</h1>
                                  ),
                                  h2: ({ children }) => (
                                    <h2 className="text-base font-bold mb-2">{children}</h2>
                                  ),
                                  h3: ({ children }) => (
                                    <h3 className="text-sm font-bold mb-1">{children}</h3>
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
                        <div className="chat-bubble-assistant px-4 py-3 flex gap-1">
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
                <div className="max-w-lg mx-auto flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="שאלי אותי משהו..."
                    className="flex-1 search-input rounded-full px-4 py-3 text-sm outline-none"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="btn-primary w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
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
              {/* Products Marquee */}
              <div className="border-b border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)]">
                <Marquee pauseOnHover className="py-2" repeat={3}>
                  {products.slice(0, 6).map((product) => (
                    <a
                      key={product.id}
                      href={product.shortLink || product.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-[var(--bg-card)] rounded-full px-3 py-2 border border-[rgba(255,255,255,0.1)] hover:border-[var(--primary)] transition-all whitespace-nowrap"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium">{product.name}</span>
                      {product.couponCode && (
                        <span className="text-xs bg-[var(--accent)] text-black px-2 py-0.5 rounded-full font-bold">
                          {product.couponCode}
                        </span>
                      )}
                    </a>
                  ))}
                </Marquee>
              </div>

              {/* Search Header */}
              <div className="sticky top-0 z-40 glass px-4 py-4">
                <div className="max-w-lg mx-auto">
                  <div className="relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="חפשי מוצרים, קודי קופון, מתכונים..."
                      className="w-full search-input rounded-xl pr-12 pl-4 py-3 text-sm outline-none"
                    />
                  </div>
                  
                  {/* Categories */}
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`category-pill px-4 py-2 rounded-full text-sm whitespace-nowrap flex items-center gap-1 ${
                          selectedCategory === cat.id ? 'active' : ''
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="px-4 py-4">
                <div className="max-w-lg mx-auto">
                  {/* Coupon Codes Section */}
                  {searchQuery.includes('קופון') || searchQuery.includes('הנחה') || searchQuery === '' ? (
                    <div className="mb-6">
                      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <span className="text-[var(--accent)]">🎫</span>
                        קודי קופון
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {couponCodes.slice(0, 4).map((coupon) => (
                          <motion.div
                            key={coupon.code}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleCopyCode(coupon.code)}
                            className="product-card rounded-xl p-3 cursor-pointer"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-[var(--text-secondary)]">{coupon.brand}</span>
                              {copiedCode === coupon.code ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-[var(--text-secondary)]" />
                              )}
                            </div>
                            <p className="font-mono font-bold text-[var(--primary)]">{coupon.code}</p>
                            <p className="text-xs text-[var(--text-secondary)] mt-1">{coupon.description}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Products */}
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[var(--primary)]" />
                    מוצרים
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {filteredProducts.map((product, index) => (
                      <motion.a
                        key={product.id}
                        href={product.shortLink || product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="product-card rounded-xl overflow-hidden block"
                      >
                        <div className="aspect-square relative">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          {product.couponCode && (
                            <div className="absolute top-2 right-2 bg-[var(--accent)] text-black text-xs font-bold px-2 py-1 rounded-full">
                              קופון
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-xs text-[var(--primary)] mb-1">{product.brand}</p>
                          <h4 className="font-medium text-sm line-clamp-2">{product.name}</h4>
                          {product.couponCode && (
                            <p className="text-xs text-[var(--accent)] mt-1 font-mono">
                              {product.couponCode}
                            </p>
                          )}
                          <div className="flex items-center gap-1 mt-2 text-xs text-[var(--text-secondary)]">
                            <ExternalLink className="w-3 h-3" />
                            <span>לצפייה</span>
                          </div>
                        </div>
                      </motion.a>
                    ))}
                  </div>

                  {/* Recipes Section */}
                  {(selectedCategory === 'all' || selectedCategory === 'recipes' || searchQuery.includes('מתכון')) && (
                    <>
                      <h3 className="text-lg font-bold mt-6 mb-3 flex items-center gap-2">
                        <ChefHat className="w-5 h-5 text-[var(--accent)]" />
                        מתכונים
                      </h3>
                      <div className="space-y-3">
                        {recipes.map((recipe, index) => (
                          <motion.a
                            key={recipe.id}
                            href={recipe.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="product-card rounded-xl overflow-hidden flex gap-3"
                          >
                            <div className="w-24 h-24 flex-shrink-0">
                              <img
                                src={recipe.image}
                                alt={recipe.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-3 flex-1">
                              <h4 className="font-bold text-sm text-[var(--accent)]">{recipe.name}</h4>
                              <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                                {recipe.description}
                              </p>
                              <div className="flex items-center gap-1 mt-2 text-xs text-[var(--primary)]">
                                <ExternalLink className="w-3 h-3" />
                                <span>לצפייה במתכון</span>
                              </div>
                            </div>
                          </motion.a>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Instagram Posts */}
                  <h3 className="text-lg font-bold mt-6 mb-3 flex items-center gap-2">
                    <span className="text-pink-500">📸</span>
                    פוסטים אחרונים
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {posts.map((post, index) => (
                      <motion.a
                        key={post.id}
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="aspect-square relative rounded-xl overflow-hidden group"
                      >
                        <img
                          src={post.image}
                          alt={post.caption}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                          <p className="text-xs line-clamp-2">{post.caption}</p>
                        </div>
                        {post.brand && (
                          <div className="absolute top-2 right-2 bg-[var(--primary)] text-white text-[10px] px-2 py-0.5 rounded-full">
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
