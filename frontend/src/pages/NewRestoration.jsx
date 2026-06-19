import React, { useState, useEffect } from 'react'
import {
  Form,
  Input,
  Button,
  Card,
  DatePicker,
  Select,
  Upload,
  message,
  Space,
  Tag,
  Row,
  Col
} from 'antd'
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UploadOutlined,
  CameraOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import api, { getPhotoUrl } from '../utils/api'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select

const NewRestoration = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [relics, setRelics] = useState([])
  const [beforePhotoPath, setBeforePhotoPath] = useState('')
  const [afterPhotoPath, setAfterPhotoPath] = useState('')
  const [beforePreview, setBeforePreview] = useState('')
  const [afterPreview, setAfterPreview] = useState('')
  const [uploadingBefore, setUploadingBefore] = useState(false)
  const [uploadingAfter, setUploadingAfter] = useState(false)

  const preselectedRelic = location.state?.relicId

  useEffect(() => {
    const fetchRelics = async () => {
      try {
        const response = await api.get('/relics')
        setRelics(response.data)
        if (preselectedRelic) {
          form.setFieldsValue({ relicId: preselectedRelic })
        }
      } catch (error) {
        message.error('加载文物列表失败')
      }
    }
    fetchRelics()
  }, [preselectedRelic, form])

  const handleUploadPhoto = async (file, type) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('prefix', type)

    try {
      if (type === 'before') {
        setUploadingBefore(true)
      } else {
        setUploadingAfter(true)
      }

      const response = await api.post('/photos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const path = response.data.path
      if (type === 'before') {
        setBeforePhotoPath(path)
        setBeforePreview(URL.createObjectURL(file))
      } else {
        setAfterPhotoPath(path)
        setAfterPreview(URL.createObjectURL(file))
      }
      message.success('照片上传成功')
    } catch (error) {
      message.error('照片上传失败')
    } finally {
      if (type === 'before') {
        setUploadingBefore(false)
      } else {
        setUploadingAfter(false)
      }
    }
  }

  const beforeUploadProps = {
    showUploadList: false,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        message.error('只能上传图片文件')
        return false
      }
      const isLt50M = file.size / 1024 / 1024 < 50
      if (!isLt50M) {
        message.error('图片大小不能超过50MB')
        return false
      }
      handleUploadPhoto(file, 'before')
      return false
    },
  }

  const afterUploadProps = {
    showUploadList: false,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        message.error('只能上传图片文件')
        return false
      }
      const isLt50M = file.size / 1024 / 1024 < 50
      if (!isLt50M) {
        message.error('图片大小不能超过50MB')
        return false
      }
      handleUploadPhoto(file, 'after')
      return false
    },
  }

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const payload = {
        ...values,
        restorationDate: values.restorationDate.format('YYYY-MM-DD'),
        beforePhotoPath,
        afterPhotoPath,
      }
      await api.post('/restorations', payload)
      message.success('修复记录创建成功')
      navigate(`/relics/${values.relicId}`)
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
        onClick={() => navigate('/restorations')}
        style={{ marginBottom: 16 }}
      >
        返回列表
      </Button>

      <Card title="新建修复记录">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ restorationDate: dayjs() }}
        >
          {location.state?.relicNo && (
            <div style={{ marginBottom: 16, padding: 12, background: '#fafaf5', borderRadius: 6 }}>
              <Tag color="brown">{location.state.relicNo}</Tag>
              <span style={{ fontWeight: 500 }}>{location.state.relicName}</span>
            </div>
          )}

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="选择文物"
                name="relicId"
                rules={[{ required: true, message: '请选择文物' }]}
              >
                <Select placeholder="请选择要修复的文物" showSearch optionFilterProp="children">
                  {relics.map(relic => (
                    <Option key={relic.id} value={relic.id}>
                      <Tag color="brown">{relic.relicNo}</Tag> {relic.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="修复日期"
                name="restorationDate"
                rules={[{ required: true, message: '请选择修复日期' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="使用材料" name="materials">
            <TextArea
              rows={3}
              placeholder="请输入修复过程中使用的材料，如：环氧树脂、丙酮溶液、加固剂等..."
            />
          </Form.Item>

          <Form.Item
            label="修复操作记录"
            name="operations"
            rules={[{ required: true, message: '请输入修复操作记录' }]}
          >
            <TextArea
              rows={6}
              placeholder="请详细记录修复操作过程，包括：
1. 文物损坏情况描述
2. 采取的修复措施和步骤
3. 使用的工具和技术方法
4. 修复过程中的重要发现等..."
            />
          </Form.Item>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 500, marginBottom: 12 }}>
              <CameraOutlined style={{ marginRight: 4 }} />
              照片上传
            </div>
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Card
                  size="small"
                  title="修复前照片"
                  extra={
                    <Upload {...beforeUploadProps}>
                      <Button
                        icon={<UploadOutlined />}
                        loading={uploadingBefore}
                        type="primary"
                        size="small"
                      >
                        上传照片
                      </Button>
                    </Upload>
                  }
                  style={{ minHeight: 220 }}
                >
                  {beforePreview || beforePhotoPath ? (
                    <img
                      src={beforePreview || getPhotoUrl(beforePhotoPath)}
                      alt="修复前"
                      style={{ width: '100%', maxHeight: 200, objectFit: 'contain' }}
                    />
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      color: '#999',
                      padding: '40px 0',
                      fontSize: 14
                    }}>
                      暂无照片
                    </div>
                  )}
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card
                  size="small"
                  title="修复后照片"
                  extra={
                    <Upload {...afterUploadProps}>
                      <Button
                        icon={<UploadOutlined />}
                        loading={uploadingAfter}
                        type="primary"
                        size="small"
                      >
                        上传照片
                      </Button>
                    </Upload>
                  }
                  style={{ minHeight: 220 }}
                >
                  {afterPreview || afterPhotoPath ? (
                    <img
                      src={afterPreview || getPhotoUrl(afterPhotoPath)}
                      alt="修复后"
                      style={{ width: '100%', maxHeight: 200, objectFit: 'contain' }}
                    />
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      color: '#999',
                      padding: '40px 0',
                      fontSize: 14
                    }}>
                      暂无照片
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </div>

          <Form.Item label="备注说明" name="notes">
            <TextArea
              rows={3}
              placeholder="其他需要记录的备注信息..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                保存修复记录
              </Button>
              <Button onClick={() => navigate(-1)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default NewRestoration
