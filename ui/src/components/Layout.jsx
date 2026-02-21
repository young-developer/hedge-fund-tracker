import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Layout as AntdLayout, Menu, Button, Drawer, ConfigProvider, theme } from 'antd'
import {
  LayoutDashboard,
  BarChart3,
  Building2,
  TrendingUp,
  FileText,
  Settings,
  Sparkles,
  Search
} from 'lucide-react'

const { Header, Sider, Content } = AntdLayout

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Quarter Analysis', href: '/quarters', icon: BarChart3 },
  { name: 'Funds', href: '/funds', icon: Building2 },
  { name: 'Stocks', href: '/stocks', icon: TrendingUp },
  { name: 'Filings', href: '/filings', icon: FileText },
  { name: 'AI Analyst', href: '/ai-analyst', icon: Sparkles },
  { name: 'AI Due Diligence', href: '/ai-due-diligence', icon: Search },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )

  const handleMenuClick = (e) => {
    setMobileMenuOpen(false)
    navigate(e.key)
  }

  const menuItems = navigation.map((item) => ({
    key: item.href,
    icon: <item.icon size={20} />,
    label: item.name,
  }))

  const getSelectedKeys = () => {
    return [location.pathname]
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
        },
      }}
    >
      <AntdLayout className="min-h-screen bg-gray-50">
        {/* Header */}
        <Header
          className="bg-white shadow-md px-4 sm:px-6 lg:px-8"
          style={{
            height: '64px',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div className="flex items-center">
            <Button
              type="text"
              icon={<MenuIcon />}
              onClick={() => setMobileMenuOpen(true)}
              className="mr-4 lg:hidden"
              style={{
                padding: '8px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
              }}
            />
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Hedge Fund Tracker
            </h1>
          </div>
        </Header>

        <AntdLayout>
          {/* Mobile Sidebar */}
          <Drawer
            title="Menu"
            placement="right"
            onClose={() => setMobileMenuOpen(false)}
            open={mobileMenuOpen}
            width={280}
            className="bg-white"
            styles={{
              body: {
                padding: 0,
              },
            }}
          >
            <Menu
              mode="inline"
              selectedKeys={getSelectedKeys()}
              onClick={(e) => {
                setMobileMenuOpen(false)
                navigate(e.key)
              }}
              items={menuItems}
              style={{ border: 'none' }}
            />
          </Drawer>

          {/* Desktop Sidebar */}
          <Sider
            collapsible
            defaultCollapsed={true}
            breakpoint="lg"
            collapsedWidth="0"
            zeroWidthTriggerStyle={{ display: 'none' }}
            className="bg-white shadow-md"
            style={{
              borderRight: '1px solid #f0f0f0',
              position: 'sticky',
              top: 0,
              height: '100vh',
            }}
          >
            <Menu
              mode="inline"
              selectedKeys={getSelectedKeys()}
              onClick={handleMenuClick}
              items={menuItems}
              style={{ border: 'none' }}
            />
          </Sider>

          {/* Main Content */}
          <Content className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </Content>
        </AntdLayout>
      </AntdLayout>
    </ConfigProvider>
  )
}
