import React from 'react';
import { User, X } from 'lucide-react';
import { useLocale } from '../../lib/locale-context';
import { useSession } from 'next-auth/react';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ProfileModal({ visible, onClose }: ProfileModalProps) {
  const { t } = useLocale();
  const { data: session } = useSession();
  
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/40" 
        onClick={onClose}
      />
      <div className="relative card p-6 max-w-lg w-full z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <User size={24} className="text-blue-600" />
            <h2 className="text-xl font-semibold">{t('profile.title') || '个人主页'}</h2>
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
          {session?.user ? (
            <>
              <div className="flex items-center gap-4">
                <img
                  src={session.user.image || '/default-avatar.png'}
                  alt="Profile"
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="text-lg font-medium">{session.user.name || '未设置昵称'}</h3>
                  <p className="text-gray-500">{session.user.email}</p>
                </div>
              </div>
              
              <div className="grid gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">{t('profile.stats') || '使用统计'}</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-blue-600">0</div>
                      <div className="text-sm text-gray-500">{t('profile.cvCount') || '简历数'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-green-600">0</div>
                      <div className="text-sm text-gray-500">{t('profile.versionCount') || '版本数'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-purple-600">0</div>
                      <div className="text-sm text-gray-500">{t('profile.practiceCount') || '练习次数'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t('profile.notSignedIn') || '请先登录'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
