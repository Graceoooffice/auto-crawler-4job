import React from 'react';
import { History, X } from 'lucide-react';
import { useLocale } from '../../lib/locale-context';

interface BuildLogModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function BuildLogModal({ visible, onClose }: BuildLogModalProps) {
  const { t } = useLocale();
  
  if (!visible) return null;

  const buildLogs = [
    { date: '2025-09-01', content: '初始版本发布' },
    { date: '2025-09-01', content: '添加了暗色模式支持' },
    { date: '2025-09-01', content: '添加了设置功能' },
    // 可以根据需要添加更多日志
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/40" 
        onClick={onClose}
      />
      <div className="relative card p-6 max-w-lg w-full max-h-[80vh] overflow-auto z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <History size={24} className="text-blue-600" />
            <h2 className="text-xl font-semibold">{t('buildLog.title') || '建设日志'}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="关闭"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="space-y-6">
          {buildLogs.map((log, index) => (
            <div key={index} className="flex gap-4">
              <div className="text-sm text-gray-500 whitespace-nowrap">
                {log.date}
              </div>
              <div className="text-sm text-gray-700">
                {log.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
