import React, { useState, useEffect } from 'react'
import { Table, Input, Button, Space, Tag, Popconfirm, message } from 'antd'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import dayjs from 'dayjs'

const RelicList = () => {
  const [relics, setRelics] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  const fetchRelics = async () => {
    setLoading(true)
    try {
      const response = await api.get('/relics')
      setRelics(response.data)
    } catch (error) {
      message.error('加载文物列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRelics()
  }, [])

  const handleDelete = async (id) => {
    try {
      await api.delete(`/relics/${id}`)
      message.success('删除成功')
      fetchRelics()
    } catch (error) {
      message.error(error.response?.data?.error || '删除失败')
    }
  }

  const filteredRelics = relics.filter(relic =>
    relic.relicNo.toLowerCase().includes(searchText.toLowerCase()) ||
    relic.name.toLowerCase().includes(searchText.toLowerCase())
  )

  const columns = [
    {
      title: '文物编号',
      dataIndex: 'relicNo',
      key: 'relicNo',
      width: 150,
      render: (text) => <Tag color="brown">{text}</Tag>,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '年代',
      dataIndex: 'era',
      key: 'era',
      width: 120,
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 150,
    },
    {
      title: '材质',
      dataIndex: 'material',
      key: 'material',
      width: 120,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/relics/${record.id}`)}
          >
            查看
          </Button>
          {isAdmin() && (
            <>
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => navigate(`/relics/${record.id}/edit`)}
              >
                编辑
              </Button>
              <Popconfirm
                title="确定要删除这件文物吗？"
                onConfirm={() => handleDelete(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="link" danger icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>文物档案列表</h2>
        <Space>
          <Input
            placeholder="搜索文物编号或名称"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          {isAdmin() && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/relics/new')}
            >
              新增文物
            </Button>
          )}
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={filteredRelics}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 件文物`,
        }}
      />
    </div>
  )
}

export default RelicList
