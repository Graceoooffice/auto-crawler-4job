import React from 'react';
import { History, User } from 'lucide-react';
import { useLocale } from '../../lib/locale-context';

interface SettingsDropdownProps {
  isOpen: boolean;
  onOpenBuildLog: () => void;
  onOpenProfile: () => void;
}

export default function SettingsDropdown({ isOpen, onOpenBuildLog, onOpenProfile }: SettingsDropdownProps) {
  const { t } = useLocale();
  if (!isOpen) return null;
  
  return (
    <div className="absolute bottom-14 left-4 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <button
        onClick={onOpenBuildLog}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <History size={16} />
        {t('settings.buildLog') || '建设日志'}
      </button>
      <button
        onClick={onOpenProfile}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
      >
        <User size={16} />
        {t('settings.profile') || '个人主页'}
      </button>
    </div>
  );
}
