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
  Col,
  Progress,
  Alert,
  Image,
  Tooltip,
  Divider
} from 'antd'
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UploadOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  PaperClipOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import api, { getPhotoUrl, uploadPhotoWithRetry, uploadPhotosBatch, uploadDocument } from '../utils/api'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select

const PhotoUploadCard = ({ title, type, photoPath, preview, uploading, progress, uploadError, onUpload, onRetry }) => (
  <Card
    size="small"
    title={title}
    extra={
      <Space>
        {uploadError && (
          <Button
            icon={<ReloadOutlined />}
            size="small"
            onClick={onRetry}
            danger
          >
            重试
          </Button>
        )}
        <Upload showUploadList={false} beforeUpload={(file) => { onUpload(file); return false }}>
          <Button
            icon={<UploadOutlined />}
            loading={uploading}
            type="primary"
            size="small"
          >
            {uploading ? '上传中...' : '上传照片'}
          </Button>
        </Upload>
      </Space>
    }
    style={{ minHeight: 280 }}
  >
    {uploading && (
      <Progress
        percent={progress}
        status={progress < 100 ? 'active' : 'success'}
        style={{ marginBottom: 12 }}
      />
    )}
    {uploadError && (
      <Alert
        message="上传失败"
        description={uploadError}
        type="error"
        showIcon
        icon={<WarningOutlined />}
        style={{ marginBottom: 12 }}
        action={
          <Button size="small" onClick={onRetry} icon={<ReloadOutlined />}>
            重试
          </Button>
        }
      />
    )}
    {preview || photoPath ? (
      <div style={{ textAlign: 'center' }}>
        <img
          src={preview || getPhotoUrl(photoPath)}
          alt={title}
          style={{ width: '100%', maxHeight: 200, objectFit: 'contain' }}
        />
        {!uploading && !uploadError && (
          <Tag color="success" style={{ marginTop: 8 }} icon={<CheckCircleOutlined />}>
            文件校验通过
          </Tag>
        )}
      </div>
    ) : (
      <div style={{
        textAlign: 'center',
        color: '#999',
        padding: '40px 0',
        fontSize: 14
      }}>
        {uploading ? '正在上传并校验...' : '暂无照片'}
      </div>
    )}
  </Card>
)

const BatchPhotoUpload = ({ photos, setPhotos, uploading, progress, uploadError, onBatchUpload, onRemove }) => {
  const handleFiles = (fileList) => {
    const validFiles = []
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      if (!file.type.startsWith('image/')) {
        message.warning(`文件 ${file.name} 不是图片，已跳过`)
        continue
      }
      if (file.size / 1024 / 1024 > 50) {
        message.warning(`文件 ${file.name} 超过50MB，已跳过`)
        continue
      }
      validFiles.push(file)
    }
    if (validFiles.length > 0) {
      onBatchUpload(validFiles)
    }
  }

  return (
    <Card
      size="small"
      title={
        <Space>
          <span>修复过程照片</span>
          <Tag color="blue">{photos.length} 张</Tag>
        </Space>
      }
      extra={
        <Upload
          multiple
          showUploadList={false}
          beforeUpload={(file, fileList) => { handleFiles(fileList); return false }}
          accept="image/*"
        >
          <Button
            icon={<PlusOutlined />}
            type="primary"
            size="small"
            loading={uploading}
          >
            {uploading ? '上传中...' : '批量上传'}
          </Button>
        </Upload>
      }
    >
      {uploading && (
        <Progress
          percent={progress}
          status="active"
          style={{ marginBottom: 12 }}
        />
      )}
      {uploadError && (
        <Alert
          message="批量上传失败"
          description={uploadError}
          type="error"
          showIcon
          style={{ marginBottom: 12 }}
        />
      )}
      {photos.length === 0 && !uploading ? (
        <div style={{
          textAlign: 'center',
          color: '#999',
          padding: '30px 0',
          fontSize: 13,
          border: '1px dashed #d9d9d9',
          borderRadius: 6,
          background: '#fafafa'
        }}>
          <CameraOutlined style={{ fontSize: 24, marginBottom: 8, color: '#bfbfbf' }} />
          <div>点击"批量上传"一次选择多张照片</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>系统将按时间顺序自动排列</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {photos.map((photo, index) => (
            <div
              key={index}
              style={{
                position: 'relative',
                width: 80,
                height: 80,
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid #eee'
              }}
            >
              <Image
                src={photo.preview || getPhotoUrl(photo.path)}
                alt={`过程照片${index + 1}`}
                width={80}
                height={80}
                style={{ objectFit: 'cover' }}
                preview={{ mask: <div style={{ color: '#fff' }}>查看</div> }}
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(0,0,0,0.5)',
                color: '#fff',
                fontSize: 10,
                padding: '1px 4px',
                textAlign: 'center'
              }}>
                #{index + 1}
              </div>
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  padding: 0,
                  width: 20,
                  height: 20,
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: 0,
                  borderBottomLeftRadius: 4
                }}
                onClick={() => onRemove(index)}
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

const SolutionUpload = ({ fileName, filePath, uploading, progress, uploadError, onUpload, onRemove }) => {
  const handleFile = (file) => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/rtf'
    ]
    const validExtensions = ['.pdf', '.doc', '.docx', '.rtf']
    const name = file.name.toLowerCase()
    const isValid = validTypes.includes(file.type) || validExtensions.some(ext => name.endsWith(ext))

    if (!isValid) {
      message.error('只支持 PDF、Word 文档（.pdf, .doc, .docx）')
      return
    }
    if (file.size / 1024 / 1024 > 100) {
      message.error('文档大小不能超过 100MB')
      return
    }
    onUpload(file)
  }

  const getFileIcon = (name) => {
    if (name.toLowerCase().endsWith('.pdf')) return <FilePdfOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />
    return <FileWordOutlined style={{ fontSize: 32, color: '#1890ff' }} />
  }

  return (
    <Card size="small" title={<span><PaperClipOutlined style={{ marginRight: 4 }} />修复方案文档</span>}>
      {uploading && (
        <Progress percent={progress} status="active" style={{ marginBottom: 12 }} />
      )}
      {uploadError && (
        <Alert message="上传失败" description={uploadError} type="error" showIcon style={{ marginBottom: 12 }} />
      )}
      {filePath ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          background: '#f6ffed',
          border: '1px solid #b7eb8f',
          borderRadius: 6
        }}>
          {getFileIcon(fileName || 'file.doc')}
          <div style={{ flex: 1, marginLeft: 12 }}>
            <div style={{ fontWeight: 500 }}>{fileName}</div>
            <Tag color="success" style={{ marginTop: 4 }} icon={<CheckCircleOutlined />}>文件校验通过</Tag>
          </div>
          <Button type="text" danger icon={<DeleteOutlined />} onClick={onRemove}>移除</Button>
        </div>
      ) : (
        <Upload showUploadList={false} beforeUpload={(file) => { handleFile(file); return false }}>
          <div style={{
            textAlign: 'center',
            padding: '24px 0',
            border: '1px dashed #d9d9d9',
            borderRadius: 6,
            background: '#fafafa',
            cursor: 'pointer'
          }}>
            <PaperClipOutlined style={{ fontSize: 24, color: '#bfbfbf', marginBottom: 8 }} />
            <div style={{ color: '#999', fontSize: 13 }}>点击上传修复方案文档</div>
            <div style={{ color: '#ccc', fontSize: 12, marginTop: 4 }}>支持 PDF、Word 格式，最大 100MB</div>
          </div>
        </Upload>
      )}
    </Card>
  )
}

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
  const [beforeProgress, setBeforeProgress] = useState(0)
  const [afterProgress, setAfterProgress] = useState(0)
  const [beforeError, setBeforeError] = useState('')
  const [afterError, setAfterError] = useState('')
  const [currentBeforeFile, setCurrentBeforeFile] = useState(null)
  const [currentAfterFile, setCurrentAfterFile] = useState(null)

  const [processPhotos, setProcessPhotos] = useState([])
  const [uploadingBatch, setUploadingBatch] = useState(false)
  const [batchProgress, setBatchProgress] = useState(0)
  const [batchError, setBatchError] = useState('')

  const [solutionFileName, setSolutionFileName] = useState('')
  const [solutionFilePath, setSolutionFilePath] = useState('')
  const [uploadingSolution, setUploadingSolution] = useState(false)
  const [solutionProgress, setSolutionProgress] = useState(0)
  const [solutionError, setSolutionError] = useState('')

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
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('只能上传图片文件')
      return
    }
    const isLt50M = file.size / 1024 / 1024 < 50
    if (!isLt50M) {
      message.error('图片大小不能超过50MB')
      return
    }

    if (type === 'before') {
      setUploadingBefore(true)
      setBeforeProgress(0)
      setBeforeError('')
      setCurrentBeforeFile(file)
    } else {
      setUploadingAfter(true)
      setAfterProgress(0)
      setAfterError('')
      setCurrentAfterFile(file)
    }

    try {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(1)
      if (parseFloat(fileSizeMB) > 5) {
        message.info({ content: `文件较大(${fileSizeMB}MB)，使用分片上传，请耐心等待...`, duration: 5 })
      }

      const data = await uploadPhotoWithRetry(
        file,
        type,
        (percent) => {
          if (type === 'before') {
            setBeforeProgress(percent)
          } else {
            setAfterProgress(percent)
          }
        }
      )

      if (type === 'before') {
        setBeforePhotoPath(data.path)
        setBeforePreview(URL.createObjectURL(file))
      } else {
        setAfterPhotoPath(data.path)
        setAfterPreview(URL.createObjectURL(file))
      }
      message.success({ content: '照片上传成功，文件完整性校验通过', duration: 3 })
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || '上传失败'
      if (errorMsg.includes('完整性校验失败')) {
        message.error({ content: '文件完整性校验失败，上传的文件可能已损坏，请重新上传', duration: 5 })
      } else {
        message.error({ content: `照片上传失败: ${errorMsg}`, duration: 5 })
      }
      if (type === 'before') {
        setBeforeError(errorMsg)
      } else {
        setAfterError(errorMsg)
      }
    } finally {
      if (type === 'before') {
        setUploadingBefore(false)
      } else {
        setUploadingAfter(false)
      }
    }
  }

  const handleBatchUpload = async (files) => {
    setUploadingBatch(true)
    setBatchProgress(0)
    setBatchError('')

    try {
      const totalSizeMB = (files.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(1)
      if (parseFloat(totalSizeMB) > 20) {
        message.info({ content: `共 ${files.length} 张照片(${totalSizeMB}MB)，正在批量上传，请耐心等待...`, duration: 5 })
      }

      const data = await uploadPhotosBatch(files, 'process', (percent) => {
        setBatchProgress(percent)
      })

      const newPhotos = files.map((file, index) => ({
        path: data.paths[index],
        preview: URL.createObjectURL(file),
        name: file.name
      }))

      setProcessPhotos(prev => [...prev, ...newPhotos])
      message.success({ content: `成功上传 ${files.length} 张照片，文件完整性校验通过`, duration: 3 })
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || '批量上传失败'
      setBatchError(errorMsg)
      message.error({ content: `批量上传失败: ${errorMsg}`, duration: 5 })
    } finally {
      setUploadingBatch(false)
    }
  }

  const handleRemovePhoto = (index) => {
    setProcessPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSolutionUpload = async (file) => {
    setUploadingSolution(true)
    setSolutionProgress(0)
    setSolutionError('')

    try {
      const data = await uploadDocument(file, 'solutions', (percent) => {
        setSolutionProgress(percent)
      })

      setSolutionFilePath(data.path)
      setSolutionFileName(file.name)
      message.success({ content: '方案文档上传成功，文件完整性校验通过', duration: 3 })
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || '上传失败'
      setSolutionError(errorMsg)
      message.error({ content: `方案文档上传失败: ${errorMsg}`, duration: 5 })
    } finally {
      setUploadingSolution(false)
    }
  }

  const handleSolutionRemove = () => {
    setSolutionFilePath('')
    setSolutionFileName('')
  }

  const handleRetry = (type) => {
    const file = type === 'before' ? currentBeforeFile : currentAfterFile
    if (file) {
      handleUploadPhoto(file, type)
    }
  }

  const onFinish = async (values) => {
    if (beforeError || afterError) {
      message.warning('照片上传存在问题，请先修复后重试')
      return
    }
    setLoading(true)
    try {
      const payload = {
        ...values,
        restorationDate: values.restorationDate.format('YYYY-MM-DD'),
        beforePhotoPath,
        afterPhotoPath,
        processPhotoPaths: processPhotos.map(p => p.path),
        solutionFilePath,
        solutionFileName,
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
              placeholder="请详细记录修复操作过程，包括：&#10;1. 文物损坏情况描述&#10;2. 采取的修复措施和步骤&#10;3. 使用的工具和技术方法&#10;4. 修复过程中的重要发现等..."
            />
          </Form.Item>

          <Divider orientation="left" style={{ fontSize: 15 }}>
            <span style={{ fontWeight: 'bold' }}>
              <CameraOutlined style={{ marginRight: 4 }} />
              照片资料
            </span>
            <span style={{ fontWeight: 'normal', color: '#999', fontSize: 12, marginLeft: 8 }}>
              （大文件自动分片上传，上传后自动校验完整性）
            </span>
          </Divider>

          <Row gutter={24} style={{ marginBottom: 16 }}>
            <Col xs={24} md={12}>
              <PhotoUploadCard
                title="修复前照片"
                type="before"
                photoPath={beforePhotoPath}
                preview={beforePreview}
                uploading={uploadingBefore}
                progress={beforeProgress}
                uploadError={beforeError}
                onUpload={(file) => handleUploadPhoto(file, 'before')}
                onRetry={() => handleRetry('before')}
              />
            </Col>
            <Col xs={24} md={12}>
              <PhotoUploadCard
                title="修复后照片"
                type="after"
                photoPath={afterPhotoPath}
                preview={afterPreview}
                uploading={uploadingAfter}
                progress={afterProgress}
                uploadError={afterError}
                onUpload={(file) => handleUploadPhoto(file, 'after')}
                onRetry={() => handleRetry('after')}
              />
            </Col>
          </Row>

          <div style={{ marginBottom: 24 }}>
            <BatchPhotoUpload
              photos={processPhotos}
              setPhotos={setProcessPhotos}
              uploading={uploadingBatch}
              progress={batchProgress}
              uploadError={batchError}
              onBatchUpload={handleBatchUpload}
              onRemove={handleRemovePhoto}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <SolutionUpload
              fileName={solutionFileName}
              filePath={solutionFilePath}
              uploading={uploadingSolution}
              progress={solutionProgress}
              uploadError={solutionError}
              onUpload={handleSolutionUpload}
              onRemove={handleSolutionRemove}
            />
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
