import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, User } from 'lucide-react';

const TeacherCard = ({ teacher, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
    >
      {/* Professor Image */}
      <div className="relative mb-6">
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white mb-4">
          <User size={40} />
        </div>
        
        {/* Badge */}
        <div className="absolute top-0 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
          PRO
        </div>
      </div>
      
      {/* Teacher Info */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {teacher.name}
        </h3>
        <p className="text-green-600 font-semibold mb-2">
          {teacher.role}
        </p>
        <p className="text-gray-600 text-sm">
          {teacher.title}
        </p>
      </div>
      
      {/* Features List */}
      <div className="space-y-3 mb-6">
        {teacher.features.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <CheckCircle className="text-green-500 flex-shrink-0" size={18} />
            <span className="text-gray-700 text-sm">{feature}</span>
          </div>
        ))}
      </div>
      
      {/* CTA Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
      >
        Conhecer Metodologia
      </motion.button>
    </motion.div>
  );
};

export default TeacherCard;