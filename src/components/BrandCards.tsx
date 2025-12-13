'use client';

import { motion } from 'framer-motion';

interface Brand {
  brand: string;
  product: string;
  code: string;
}

interface BrandCardsProps {
  brands: Brand[];
  onSelect: (brand: string) => void;
}

export function BrandCards({ brands, onSelect }: BrandCardsProps) {
  return (
    <div className="w-full">
      <p className="text-sm text-gray-600 mb-3 text-center">בחרי את המותג:</p>
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        {brands.map((brand, index) => (
          <motion.button
            key={brand.brand}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(brand.brand)}
            className="p-4 bg-white border border-gray-200 rounded-xl hover:border-[var(--accent)] hover:shadow-md transition-all text-right"
          >
            <p className="font-medium text-gray-900 text-sm">{brand.brand}</p>
            <p className="text-xs text-gray-500 mt-1">{brand.product}</p>
            <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-mono rounded">
              {brand.code}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
