import React from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

const { TextArea } = Input

const NewRelic = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)

  const onFinish = async (values) => {
    setLoading(true)
    try {
      await api.post('/relics', values)
      message.success('文档案创建成功')
      navigate('/relics')
    } catch (error) {
      message.error(error.response?.data?.error || '创建失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/relics')}
        style={{ marginBottom: 16 }}
      >
        返回列表
      </Button>

      <Card title="新增文物档案">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: 800 }}
        >
          <Form.Item
            label="文物编号"
            name="relicNo"
            rules={[{ required: true, message: '请输入文物编号' }]}
          >
            <Input placeholder="请输入唯一的文物编号，如：BW-2024-001" />
          </Form.Item>

          <Form.Item
            label="文物名称"
            name="name"
            rules={[{ required: true, message: '请输入文物名称' }]}
          >
            <Input placeholder="请输入文物名称" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item label="年代" name="era">
              <Input placeholder="如：明代、清代、新石器时代等" />
            </Form.Item>

            <Form.Item label="来源" name="source">
              <Input placeholder="如：出土、捐赠、征集等" />
            </Form.Item>

            <Form.Item label="材质" name="material">
              <Input placeholder="如：青铜、陶瓷、丝绸、纸质等" />
            </Form.Item>
          </div>

          <Form.Item label="详细描述" name="description">
            <TextArea
              rows={5}
              placeholder="请输入文物的详细描述信息..."
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              保存档案
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default NewRelic
