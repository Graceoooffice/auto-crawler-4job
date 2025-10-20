import React from 'react';

interface LogoutModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  t: (key: string) => string;
}

export default function LogoutModal({ visible, onConfirm, onCancel, t }: LogoutModalProps) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="card p-8 w-80 text-center">
        <h2 className="text-xl font-bold mb-4">{t('signout')}</h2>
        <p className="mb-6">{t('signout_confirm')}</p>
        <div className="flex justify-center gap-4">
          <button className="btn btn-secondary" onClick={onCancel}>{t('cancel')}</button>
          <button className="btn btn-primary" onClick={onConfirm}>{t('signout')}</button>
        </div>
      </div>
    </div>
  );
}