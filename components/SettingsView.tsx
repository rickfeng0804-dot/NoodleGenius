import React, { useRef, useState } from 'react';
import { MenuCategory, MenuItem, StoreSettings } from '../types';
import { Download, Upload, FileSpreadsheet, Trash2, AlertCircle, RefreshCw, Mail, Save, Database, Shield, Eye, EyeOff, MessageCircle, Copy, Code } from 'lucide-react';

interface SettingsViewProps {
  menu: MenuCategory[];
  settings: StoreSettings;
  onUpdateMenu: (newMenu: MenuCategory[]) => void;
  onUpdateSettings: (newSettings: StoreSettings) => void;
  onReset: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ menu, settings, onUpdateMenu, onUpdateSettings, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showScript, setShowScript] = useState(false);
  
  // Local state for form inputs to avoid excessive re-renders on parent
  const [localSettings, setLocalSettings] = useState<StoreSettings>(settings);

  const handleSaveSettings = () => {
    onUpdateSettings(localSettings);
    setSuccessMsg("設定已儲存！");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleDownloadCSV = () => {
    const BOM = "\uFEFF";
    let csvContent = BOM + "Category,Name,Price,Description,Recommended\n";

    menu.forEach(category => {
      category.items.forEach(item => {
        const escape = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
        const row = [
          escape(category.name),
          escape(item.name),
          item.price,
          escape(item.description || ''),
          item.recommended ? 'TRUE' : 'FALSE'
        ].join(',');
        csvContent += row + "\n";
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `menu_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const newMenu = parseCSV(text);
        onUpdateMenu(newMenu);
        setError(null);
        setSuccessMsg(`成功匯入 ${newMenu.reduce((acc, c) => acc + c.items.length, 0)} 個品項`);
        setTimeout(() => setSuccessMsg(null), 3000);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        setError("CSV 格式錯誤");
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const parseCSV = (csvText: string): MenuCategory[] => {
    const lines = csvText.split(/\r?\n/);
    const categoriesMap = new Map<string, MenuItem[]>();
    let startIndex = 0;
    if (lines[0].toLowerCase().includes('category')) startIndex = 1;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = parseCSVLine(line);
      if (parts.length < 3) continue; 

      const categoryName = parts[0]?.trim();
      const name = parts[1]?.trim();
      const priceStr = parts[2]?.trim();
      
      if (!categoryName || !name || !priceStr) continue;

      const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
      if (isNaN(price)) continue;

      const description = parts[3]?.trim() || '';
      const recommended = parts[4]?.trim().toLowerCase() === 'true';

      const item: MenuItem = {
        id: `csv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        price,
        description,
        category: categoryName,
        recommended
      };

      if (!categoriesMap.has(categoryName)) categoriesMap.set(categoryName, []);
      categoriesMap.get(categoryName)?.push(item);
    }

    const menu: MenuCategory[] = [];
    categoriesMap.forEach((items, name) => menu.push({ name, items }));
    if (menu.length === 0) throw new Error("No valid items found");
    return menu;
  };

  const parseCSVLine = (text: string) => {
    const result = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuote && text[i+1] === '"') {
           cur += '"';
           i++;
        } else {
           inQuote = !inQuote;
        }
      } else if (char === ',' && !inQuote) {
        result.push(cur);
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur);
    return result;
  };

  const GAS_SCRIPT_CODE = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  // 如果是第一列，自動建立標題
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["時間", "單號", "桌號", "品項內容", "總金額", "狀態"]);
  }
  
  var itemsStr = data.items.map(function(i) { 
    return i.name + " x" + i.quantity; 
  }).join(", ");
  
  sheet.appendRow([
    new Date().toLocaleString(),
    data.id,
    data.tableNumber,
    itemsStr,
    data.totalAmount,
    data.status
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
    .setMimeType(ContentService.MimeType.JSON);
}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccessMsg("程式碼已複製！");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen animate-fade-in pb-24">
      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <RefreshCw className="text-blue-600" size={36} />
          管理後台設定
        </h1>
        <p className="text-gray-600 mt-2">管理菜單資料、外部系統串接與帳號安全。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        
        {/* Left Column: Store & Integration */}
        <div className="space-y-8">
          {/* Account Settings */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
             <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Shield size={24} className="text-blue-600"/>
              帳號安全設定
            </h2>
             <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">後台登入帳號</label>
                  <input 
                    type="text" 
                    value={localSettings.username}
                    onChange={e => setLocalSettings({...localSettings, username: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">後台登入密碼</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={localSettings.password}
                      onChange={e => setLocalSettings({...localSettings, password: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
               </div>
               <button 
                onClick={handleSaveSettings}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors text-sm"
              >
                更新帳號密碼
              </button>
             </div>
          </div>

          {/* Integration Settings */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Database size={24} className="text-purple-600"/>
              外部串接設定
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">商店名稱</label>
                <input 
                  type="text" 
                  value={localSettings.storeName}
                  onChange={e => setLocalSettings({...localSettings, storeName: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              {/* Line Notify Settings */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <MessageCircle size={16} className="text-green-600" /> Line Notify 通知
                  </label>
                  <input 
                    type="checkbox" 
                    checked={localSettings.enableLineNotify}
                    onChange={e => setLocalSettings({...localSettings, enableLineNotify: e.target.checked})}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="Line Notify Token"
                  value={localSettings.lineToken}
                  disabled={!localSettings.enableLineNotify}
                  onChange={e => setLocalSettings({...localSettings, lineToken: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                />
                <p className="text-xs text-gray-500 mt-1">啟用後，每筆新訂單將透過 Line Notify 通知店家。</p>
              </div>

              {/* Email Settings */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Mail size={16} /> 訂單 Email 通知
                  </label>
                  <input 
                    type="checkbox" 
                    checked={localSettings.enableEmailNotify}
                    onChange={e => setLocalSettings({...localSettings, enableEmailNotify: e.target.checked})}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </div>
                <input 
                  type="email" 
                  placeholder="owner@example.com"
                  value={localSettings.ownerEmail}
                  disabled={!localSettings.enableEmailNotify}
                  onChange={e => setLocalSettings({...localSettings, ownerEmail: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                />
                <p className="text-xs text-gray-500 mt-1">啟用後，每筆新訂單將寄送至此信箱。</p>
              </div>

              {/* Google Sheet Settings */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <FileSpreadsheet size={16} /> Google Sheet 同步
                  </label>
                  <input 
                    type="checkbox" 
                    checked={localSettings.enableSheetSync}
                    onChange={e => setLocalSettings({...localSettings, enableSheetSync: e.target.checked})}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </div>
                
                <div className="space-y-3 mt-3">
                  {localSettings.enableSheetSync && (
                     <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                       <button 
                        onClick={() => setShowScript(!showScript)}
                        className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline"
                       >
                         <Code size={16}/> {showScript ? '隱藏 Apps Script 程式碼' : '顯示 Apps Script 程式碼'}
                       </button>
                       
                       {showScript && (
                         <div className="mt-2 relative">
                           <pre className="bg-slate-800 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">
                             {GAS_SCRIPT_CODE}
                           </pre>
                           <button 
                            onClick={() => copyToClipboard(GAS_SCRIPT_CODE)}
                            className="absolute top-2 right-2 p-1.5 bg-white/20 hover:bg-white/30 rounded text-white"
                            title="複製程式碼"
                           >
                             <Copy size={14} />
                           </button>
                           <p className="text-xs text-blue-700 mt-2">
                             說明: 請在 Google Sheet 點選「擴充功能」&gt;「Apps Script」，貼上此程式碼，並部署為網頁應用程式 (Web App)，權限設為「任何人」。
                           </p>
                         </div>
                       )}
                     </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Apps Script 網頁應用程式網址 (Web URL)</label>
                    <input 
                      type="text" 
                      placeholder="https://script.google.com/macros/s/..."
                      value={localSettings.googleScriptUrl}
                      disabled={!localSettings.enableSheetSync}
                      onChange={e => setLocalSettings({...localSettings, googleScriptUrl: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-gray-100 disabled:text-gray-400 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Google Sheet 檢視連結 (僅供參考)</label>
                    <input 
                      type="text" 
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      value={localSettings.googleSheetUrl}
                      disabled={!localSettings.enableSheetSync}
                      onChange={e => setLocalSettings({...localSettings, googleSheetUrl: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-gray-100 disabled:text-gray-400 text-sm"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSaveSettings}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Save size={18} /> 儲存設定
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Menu Maintenance */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FileSpreadsheet size={24} className="text-green-600"/>
            菜單資料維護
          </h2>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              您可以匯出菜單進行批次修改，再匯入更新。
            </p>
            
            <button 
              onClick={handleDownloadCSV}
              className="w-full py-3 bg-white border-2 border-blue-100 text-blue-600 hover:bg-blue-50 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Download size={20} />
              匯出菜單 CSV
            </button>

            <div className="relative w-full">
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Upload size={20} />
                匯入菜單 CSV
              </button>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="font-bold text-red-600 mb-2 flex items-center gap-2">
                <Trash2 size={18} /> 危險區域
              </h3>
              <button 
                onClick={() => {
                  if(window.confirm('警告：確定要清除所有資料嗎？')) onReset();
                }}
                className="w-full py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-100 transition-colors"
              >
                重置系統資料
              </button>
            </div>
          </div>
        </div>
      </div>

      {(error || successMsg) && (
        <div className={`fixed bottom-6 right-6 p-4 rounded-lg shadow-lg flex items-center gap-2 border animate-bounce-in z-50 ${
          error ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'
        }`}>
          {error ? <AlertCircle size={20} /> : <RefreshCw size={20} />}
          {error || successMsg}
        </div>
      )}
    </div>
  );
};