import React from 'react';
import { motion } from 'framer-motion';
import { getEmoji, getBackgroundColor } from './utils';

interface EmojiCardProps {
  value: number;
  metricName: string;
  companyName: string;
  metricAverage: number;
  companyAverage: number;
  highlighted: boolean;
  onClick: () => void;
}

export const EmojiCard: React.FC<EmojiCardProps> = ({
  value,
  highlighted,
  onClick,
}) => {
  return (
    <motion.div
      className={`w-full h-full cursor-pointer transition-all duration-300 transform 
        ${highlighted ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div className={`rounded-lg p-4 text-center h-full flex items-center justify-center ${getBackgroundColor(value)}`}>
        <span className="text-2xl">{getEmoji(value)}</span>
      </div>
    </motion.div>
  );
};