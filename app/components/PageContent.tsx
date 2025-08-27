import HomePage from './HomePage';
import InputPage from './InputPage';
import ReviewPage from './ReviewPage';
import DownloadPage from './DownloadPage';
import AboutPage from './AboutPage';

interface PageContentProps {
  currentPage: string;
}

export default function PageContent({ currentPage }: PageContentProps) {
  const renderContent = () => {
    switch (currentPage) {
      case 'input':
        return <InputPage />;
      case 'review':
        return <ReviewPage />;
      case 'download':
        return <DownloadPage />;
      case 'about':
        return <AboutPage />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="relative pt-16">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 opacity-60"></div>
      
      {/* 动态渲染内容 */}
      {renderContent()}
    </div>
  );
}