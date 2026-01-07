import React, { useState } from 'react';
import { NavItem, View } from './types';
import HomePractice from './components/HomePractice';
import ReviewBank from './components/ReviewBank';
import MaterialLibrary from './components/MaterialLibrary';
import UserProfile from './components/UserProfile';
import ListeningCenter from './components/ListeningCenter';
import { IconCheck, IconList, IconFolder, IconUser, IconHeadphones } from './components/Icons';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);

  const NAV_ITEMS: NavItem[] = [
    { id: View.HOME, label: '今日练习', icon: 'check' },
    { id: View.LISTENING, label: '听力课', icon: 'headphones' },
    { id: View.LIBRARY, label: '语料库', icon: 'folder' },
    { id: View.REVIEW, label: '复习', icon: 'list' },
    { id: View.PROFILE, label: '我的', icon: 'user' },
  ];

  const renderIcon = (name: string, active: boolean) => {
    const className = `w-6 h-6 mb-0.5 ${active ? 'text-wechat' : 'text-slate-400'}`;
    switch(name) {
      case 'check': return <IconCheck className={className} />;
      case 'list': return <IconList className={className} />;
      case 'folder': return <IconFolder className={className} />;
      case 'user': return <IconUser className={className} />;
      case 'headphones': return <IconHeadphones className={className} />;
      default: return null;
    }
  };

  const renderContent = () => {
    switch(currentView) {
      case View.HOME: return <HomePractice />;
      case View.LISTENING: return <ListeningCenter />;
      case View.REVIEW: return <ReviewBank />;
      case View.LIBRARY: return <MaterialLibrary />;
      case View.PROFILE: return <UserProfile />;
      default: return <HomePractice />;
    }
  };

  const getHeaderTitle = () => {
     switch(currentView) {
        case View.HOME: return 'Penny的英语演练场';
        case View.LISTENING: return '听力课堂';
        case View.REVIEW: return '错题与复习';
        case View.LIBRARY: return '专属语料库';
        case View.PROFILE: return '个人中心';
        default: return '英语演练场';
     }
  }

  return (
    <div className="min-h-screen bg-[#ededed] font-sans max-w-md mx-auto shadow-2xl relative">
      {/* Top Navigation Bar Simulation */}
      <div className="sticky top-0 z-50 bg-[#ededed] px-4 py-3 flex items-center justify-center border-b border-slate-200/50 backdrop-blur-md">
        <span className="font-semibold text-slate-900 text-[17px]">{getHeaderTitle()}</span>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-[87px] h-[32px] border border-slate-300/60 rounded-full bg-white/60 flex items-center justify-around px-2 box-border">
            <div className="flex gap-[3px] items-center">
                 <div className="w-[3px] h-[3px] bg-black rounded-full"></div>
                 <div className="w-[4px] h-[4px] bg-black rounded-full"></div>
                 <div className="w-[3px] h-[3px] bg-black rounded-full"></div>
            </div>
            <div className="w-[1px] h-[18px] bg-slate-300/60"></div>
            <div className="w-4 h-4 rounded-full border-[1.5px] border-black box-border"></div>
        </div>
      </div>

      <main className="min-h-[calc(100vh-140px)]">
        {renderContent()}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur border-t border-slate-200 flex justify-around items-center pb-safe-bottom z-50 max-w-md mx-auto right-0">
        {NAV_ITEMS.map((item) => {
            const active = currentView === item.id;
            return (
            <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className="flex flex-col items-center justify-center w-full py-1.5 pt-2 active:bg-slate-50 transition-colors"
            >
                {renderIcon(item.icon, active)}
                <span className={`text-[10px] font-medium scale-90 ${active ? 'text-wechat' : 'text-slate-400'}`}>
                    {item.label}
                </span>
            </button>
            );
        })}
      </nav>
    </div>
  );
};

export default App;