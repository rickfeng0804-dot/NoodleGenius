import React, { useState, useRef } from 'react';
import { Upload, Loader2, ChefHat, ScanLine, FileSpreadsheet } from 'lucide-react';
import { parseMenuImage } from '../services/geminiService';
import { MenuCategory, MenuItem } from '../types';

interface UploadViewProps {
  onMenuGenerated: (menu: MenuCategory[]) => void;
}

export const UploadView: React.FC<UploadViewProps> = ({ onMenuGenerated }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const rawData = await parseMenuImage(base64String);
        
        if (rawData && rawData.categories) {
          // Transform raw data to internal format with IDs
          const processedMenu: MenuCategory[] = rawData.categories.map((cat, catIdx) => ({
            name: cat.name,
            items: cat.items.map((item, itemIdx) => ({
              ...item,
              id: `item-${catIdx}-${itemIdx}`,
              category: cat.name
            }))
          }));
          onMenuGenerated(processedMenu);
        } else {
          setError("無法辨識菜單，請試試看更清晰的照片。");
        }
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setError("發生錯誤，請重試。");
      setIsAnalyzing(false);
    }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const newMenu = parseCSV(text);
        onMenuGenerated(newMenu);
        setError(null);
      } catch (err) {
        setError("CSV 格式錯誤，請確認檔案內容符合格式 (Category, Name, Price...)。");
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  // Helper to parse CSV (Duplicated logic for standalone capability in this view)
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

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center animate-fade-in">
      <div className="bg-orange-100 p-6 rounded-full mb-8">
        <ChefHat className="w-16 h-16 text-orange-600" />
      </div>
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        AI 智能麵店點餐系統
      </h1>
      <p className="text-gray-600 mb-8 max-w-md">
        上傳您的菜單照片或 CSV 檔案，系統將自動為您生成數位點餐APP、廚房管理系統以及結帳通知功能。
      </p>

      {isAnalyzing ? (
        <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl border border-orange-100">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
          <p className="text-lg font-medium text-gray-700">正在分析菜單圖片...</p>
          <p className="text-sm text-gray-500 mt-2">Gemini AI 正在識別菜色與價格</p>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full max-w-lg">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer group relative w-full bg-white p-10 rounded-3xl border-2 border-dashed border-gray-300 hover:border-orange-500 transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex flex-col items-center">
              <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:bg-orange-50 transition-colors">
                <ScanLine className="w-10 h-10 text-blue-500 group-hover:text-orange-500 transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">點擊上傳菜單照片</h3>
              <p className="text-gray-400 text-sm">支援 JPG, PNG 格式，AI 自動辨識</p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <div className="mt-6 flex items-center gap-4 w-full">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-gray-400 text-sm">或</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          <button
            onClick={() => csvInputRef.current?.click()}
            className="mt-6 w-full flex items-center justify-center gap-2 text-gray-600 hover:text-green-700 transition-colors px-6 py-4 rounded-2xl border border-gray-200 hover:border-green-300 bg-white hover:bg-green-50 shadow-sm"
          >
            <FileSpreadsheet size={20} className="text-green-600"/>
            <span className="font-bold">匯入現有菜單 CSV</span>
          </button>
          <input 
            type="file" 
            ref={csvInputRef} 
            onChange={handleCSVUpload} 
            accept=".csv" 
            className="hidden" 
          />
        </div>
      )}
      
      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg max-w-md w-full">
          {error}
        </div>
      )}
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl w-full">
        <FeatureCard 
          icon="📱" 
          title="自動生成 APP" 
          desc="顧客掃描即可點餐，無需手動輸入菜單。" 
        />
        <FeatureCard 
          icon="🔔" 
          title="Line / Email 通知" 
          desc="訂單確認後自動發送通知給顧客與店家。" 
        />
        <FeatureCard 
          icon="👨‍🍳" 
          title="廚房顯示系統 (KDS)" 
          desc="後台即時顯示訂單，掌控出餐進度。" 
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="text-3xl mb-3">{icon}</div>
    <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
  </div>
);