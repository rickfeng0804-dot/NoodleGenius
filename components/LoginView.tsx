import React, { useState } from 'react';
import { StoreSettings } from '../types';
import { Lock, User, ArrowLeft, LogIn } from 'lucide-react';

interface LoginViewProps {
  settings: StoreSettings;
  onLoginSuccess: () => void;
  onBack: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ settings, onLoginSuccess, onBack }) => {
  const [inputUser, setInputUser] = useState('');
  const [inputPass, setInputPass] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default credentials fallback if undefined in settings
    const validUser = settings.username || 'Store';
    const validPass = settings.password || '12345678';

    if (inputUser === validUser && inputPass === validPass) {
      onLoginSuccess();
    } else {
      setError('帳號或密碼錯誤');
      setInputPass('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <button 
          onClick={onBack}
          className="mb-6 text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft size={18} /> 返回
        </button>

        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-blue-600 h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">店家後台登入</h2>
          <p className="text-gray-500 text-sm mt-1">請輸入您的管理帳號與密碼</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">帳號</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={inputUser}
                onChange={(e) => {
                  setInputUser(e.target.value);
                  setError(null);
                }}
                className="w-full pl-10 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="預設: Store"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">密碼</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type="password"
                value={inputPass}
                onChange={(e) => {
                  setInputPass(e.target.value);
                  setError(null);
                }}
                className="w-full pl-10 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="預設: 12345678"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-medium animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
          >
            <LogIn size={20} />
            登入系統
          </button>
        </form>
      </div>
    </div>
  );
};