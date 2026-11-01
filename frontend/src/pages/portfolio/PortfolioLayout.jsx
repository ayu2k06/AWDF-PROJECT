import { Outlet } from 'react-router-dom';
import PortfolioHeader from '../../components/portfolio/PortfolioHeader';
import PortfolioFooter from '../../components/portfolio/PortfolioFooter';

const PortfolioLayout = () => {
  return (
    <div className="public-page">
      <PortfolioHeader name="Aryan Tada" />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
        <Outlet />
      </div>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
        <PortfolioFooter name="Aryan Tada" email="aryantada@example.com" github="https://github.com/ayu2k06" />
      </div>
    </div>
  );
};

export default PortfolioLayout;
