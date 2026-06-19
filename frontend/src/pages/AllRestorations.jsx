import React, { useState, useEffect, useCallback } from 'react'
import { Table, Input, Button, Space, Tag, message } from 'antd'
import { SearchOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import dayjs from 'dayjs'
import { useAuth } from '../context/AuthContext'

const AllRestorations = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  })
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()

  const fetchRecords = useCallback(async (page = 1, size = 20) => {
    setLoading(true)
    try {
      const response = await api.get('/restorations', {
        params: { page: page - 1, size }
      })
      const data = response.data
      setRecords(data.content || [])
      setPagination({
        current: data.currentPage + 1,
        pageSize: data.pageSize,
        total: data.totalElements,
      })
    } catch (error) {
      message.error('加载修复记录失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const filteredRecords = records.filter(record =>
    record.relicNo.toLowerCase().includes(searchText.toLowerCase()) ||
    record.relicName.toLowerCase().includes(searchText.toLowerCase()) ||
    record.restorerName.toLowerCase().includes(searchText.toLowerCase())
  )

  const columns = [
    {
      title: '修复日期',
      dataIndex: 'restorationDate',
      key: 'restorationDate',
      width: 120,
      render: (text) => dayjs(text).format('YYYY-MM-DD'),
      sorter: (a, b) => dayjs(a.restorationDate).valueOf() - dayjs(b.restorationDate).valueOf(),
    },
    {
      title: '文物编号',
      dataIndex: 'relicNo',
      key: 'relicNo',
      width: 130,
      render: (text) => <Tag color="brown">{text}</Tag>,
    },
    {
      title: '文物名称',
      dataIndex: 'relicName',
      key: 'relicName',
    },
    {
      title: '修复师',
      dataIndex: 'restorerName',
      key: 'restorerName',
      width: 100,
    },
    {
      title: '使用材料',
      dataIndex: 'materials',
      key: 'materials',
      ellipsis: true,
    },
    {
      title: '操作摘要',
      dataIndex: 'operations',
      key: 'operations',
      ellipsis: true,
    },
    {
      title: '照片',
      key: 'photos',
      width: 100,
      render: (_, record) => (
        <Space>
          {record.beforePhotoPath && <Tag color="blue">修复前</Tag>}
          {record.afterPhotoPath && <Tag color="green">修复后</Tag>}
          {!record.beforePhotoPath && !record.afterPhotoPath && <span style={{ color: '#999' }}>无</span>}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/relics/${record.relicId}`)}
        >
          查看文物
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>修复记录列表</h2>
        <Space>
          <Input
            placeholder="搜索文物编号、名称或修复师"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={filteredRecords}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
          onChange: (page, pageSize) => fetchRecords(page, pageSize),
        }}
      />
    </div>
  )
}

export default AllRestorations
