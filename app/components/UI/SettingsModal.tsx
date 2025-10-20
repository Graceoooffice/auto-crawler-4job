import React from 'react';
import { Settings, X } from 'lucide-react';
import { useLocale } from '../../lib/locale-context';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenBuildLog: () => void;
  onOpenProfile: () => void;
}

export default function SettingsModal({ visible, onClose, onOpenBuildLog, onOpenProfile }: SettingsModalProps) {
  const { t } = useLocale();
  
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/40" 
        onClick={onClose}
      />
      <div className="relative card p-4 w-64 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t('settings.title') || '设置'}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="关闭"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="space-y-2">
          <button
            onClick={onOpenBuildLog}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
          >
            <span className="text-gray-700">{t('settings.buildLog') || '建设日志'}</span>
          </button>
          <button
            onClick={onOpenProfile}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
          >
            <span className="text-gray-700">{t('settings.profile') || '个人主页'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
