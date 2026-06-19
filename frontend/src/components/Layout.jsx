import React from 'react'
import { Layout, Menu, Avatar, Dropdown, Button } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  AppstoreOutlined,
  PlusCircleOutlined,
  HistoryOutlined,
  FileAddOutlined,
  LogoutOutlined,
  UserOutlined
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout

const MainLayout = () => {
  const { user, logout, isAdmin, isRestorer } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/relics',
      icon: <AppstoreOutlined />,
      label: '文物档案',
    },
    {
      key: '/restorations',
      icon: <HistoryOutlined />,
      label: '修复记录',
    },
  ]

  if (isAdmin()) {
    menuItems.splice(1, 0, {
      key: '/relics/new',
      icon: <PlusCircleOutlined />,
      label: '新增文物',
    })
  }

  if (isRestorer()) {
    menuItems.push({
      key: '/restorations/new',
      icon: <FileAddOutlined />,
      label: '新建修复记录',
    })
  }

  const userMenu = {
    items: [
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: () => {
          logout()
          navigate('/login')
        },
      },
    ],
  }

  const roleText = isAdmin() ? '管理员' : '修复师'

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} style={{ background: '#fff', borderRight: '1px solid #e8e8e8' }}>
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #e8e8e8',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#8B4513'
        }}>
          🏛️ 文物修复系统
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, marginTop: 8 }}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          borderBottom: '1px solid #e8e8e8'
        }}>
          <Dropdown menu={userMenu} placement="bottomRight">
            <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar size="small" icon={<UserOutlined />} />
              <span>{user?.realName}</span>
              <span style={{ color: '#999', fontSize: '12px' }}>({roleText})</span>
            </Button>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px', padding: '24px', background: '#fff', borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
