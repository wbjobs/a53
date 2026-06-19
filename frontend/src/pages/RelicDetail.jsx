import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Descriptions, Timeline, Tag, Spin, Empty, Button, Image, Divider, Typography, List, Card } from 'antd'
import {
  ArrowLeftOutlined,
  PlusOutlined,
  CameraOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  PaperClipOutlined,
  DownloadOutlined
} from '@ant-design/icons'
import api, { getPhotoUrl } from '../utils/api'
import dayjs from 'dayjs'
import { useAuth } from '../context/AuthContext'

const { Title, Paragraph } = Typography

const PhotoGallery = ({ photos, recordId }) => {
  if (!photos || photos.length === 0) return null

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ color: '#666', marginBottom: 8, fontWeight: 500 }}>
        <CameraOutlined style={{ marginRight: 4 }} />
        过程照片序列
        <Tag color="blue" style={{ marginLeft: 8 }}>{photos.length} 张</Tag>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Image.PreviewGroup>
          {photos.map((photo, index) => (
            <div key={photo.id || index} style={{ position: 'relative' }}>
              <Image
                width={100}
                height={100}
                src={photo.url || getPhotoUrl(photo.photoPath)}
                alt={photo.photoName || `过程照片${index + 1}`}
                style={{ objectFit: 'cover', borderRadius: 4, border: '1px solid #eee' }}
              />
              <div style={{
                position: 'absolute',
                bottom: 2,
                left: 2,
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                fontSize: 10,
                padding: '1px 6px',
                borderRadius: 2
              }}>
                #{index + 1}
              </div>
            </div>
          ))}
        </Image.PreviewGroup>
      </div>
    </div>
  )
}

const SolutionFile = ({ fileName, filePath, fileUrl }) => {
  if (!filePath) return null

  const getFileIcon = (name) => {
    if (!name) return <FileWordOutlined style={{ fontSize: 24, color: '#1890ff' }} />
    if (name.toLowerCase().endsWith('.pdf')) return <FilePdfOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
    return <FileWordOutlined style={{ fontSize: 24, color: '#1890ff' }} />
  }

  const handleDownload = () => {
    const url = fileUrl || getPhotoUrl(filePath)
    window.open(url, '_blank')
  }

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ color: '#666', marginBottom: 8, fontWeight: 500 }}>
        <PaperClipOutlined style={{ marginRight: 4 }} />
        修复方案文档
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 14px',
          background: '#f0f5ff',
          border: '1px solid #adc6ff',
          borderRadius: 6,
          cursor: 'pointer'
        }}
        onClick={handleDownload}
      >
        {getFileIcon(fileName)}
        <div style={{ flex: 1, marginLeft: 10 }}>
          <div style={{ fontWeight: 500, color: '#1d39c4' }}>{fileName || '修复方案文档'}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>点击查看 / 下载</div>
        </div>
        <DownloadOutlined style={{ color: '#8c8c8c' }} />
      </div>
    </div>
  )
}

const RelicDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [relic, setRelic] = useState(null)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const { isRestorer } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [relicRes, recordsRes] = await Promise.all([
          api.get(`/relics/${id}`),
          api.get(`/restorations/relic/${id}`),
        ])
        setRelic(relicRes.data)
        setRecords(recordsRes.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!relic) {
    return <Empty description="文物不存在" />
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          <Tag color="brown" style={{ fontSize: 16 }}>{relic.relicNo}</Tag>
          {relic.name}
        </Title>
        {isRestorer() && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/restorations/new', { state: { relicId: relic.id, relicNo: relic.relicNo, relicName: relic.name } })}
          >
            添加修复记录
          </Button>
        )}
      </div>

      <Descriptions bordered column={2} size="middle" style={{ marginBottom: 32 }}>
        <Descriptions.Item label="文物编号">{relic.relicNo}</Descriptions.Item>
        <Descriptions.Item label="名称">{relic.name}</Descriptions.Item>
        <Descriptions.Item label="年代">{relic.era || '-'}</Descriptions.Item>
        <Descriptions.Item label="来源">{relic.source || '-'}</Descriptions.Item>
        <Descriptions.Item label="材质">{relic.material || '-'}</Descriptions.Item>
        <Descriptions.Item label="建档时间">{dayjs(relic.createdAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
        {relic.description && (
          <Descriptions.Item label="描述" span={2}>{relic.description}</Descriptions.Item>
        )}
      </Descriptions>

      <Divider orientation="left" style={{ fontSize: 16 }}>
        <span style={{ fontWeight: 'bold' }}>修复历史时间线</span>
        <Tag color="orange" style={{ marginLeft: 8 }}>{records.length} 次修复</Tag>
      </Divider>

      {records.length === 0 ? (
        <Empty description="暂无修复记录" style={{ padding: '40px 0' }} />
      ) : (
        <Timeline
          mode="left"
          style={{ padding: '0 20px' }}
          items={records.map((record, index) => ({
            color: index === 0 ? 'green' : 'blue',
            label: (
              <div>
                <div style={{ fontWeight: 'bold', color: '#8B4513' }}>
                  {dayjs(record.restorationDate).format('YYYY年MM月DD日')}
                </div>
                <div style={{ color: '#999', fontSize: 12 }}>
                  修复师：{record.restorerName}
                </div>
              </div>
            ),
            children: (
              <div className="timeline-content">
                <div className="detail-info" style={{ marginBottom: 12 }}>
                  {record.materials && (
                    <div className="info-item">
                      <div className="info-label">使用材料</div>
                      <div className="info-value">{record.materials}</div>
                    </div>
                  )}
                  {record.notes && (
                    <div className="info-item">
                      <div className="info-label">备注</div>
                      <div className="info-value">{record.notes}</div>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 12 }}>
                  <div style={{ color: '#666', marginBottom: 8, fontWeight: 500 }}>
                    修复操作记录：
                  </div>
                  <Paragraph style={{
                    background: '#fafaf5',
                    padding: 12,
                    borderRadius: 6,
                    whiteSpace: 'pre-wrap',
                    marginBottom: 0
                  }}>
                    {record.operations}
                  </Paragraph>
                </div>

                {(record.beforePhotoPath || record.afterPhotoPath) && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ color: '#666', marginBottom: 8, fontWeight: 500 }}>
                      <CameraOutlined style={{ marginRight: 4 }} />
                      照片对比：
                    </div>
                    <div className="photo-compare">
                      {record.beforePhotoPath && (
                        <div className="photo-item">
                          <Image
                            src={getPhotoUrl(record.beforePhotoPath)}
                            alt="修复前"
                            fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjZWVlIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij7nvZHlp5HlvI3miZ88L3RleHQ+PC9zdmc+"
                          />
                          <div className="photo-label">修复前</div>
                        </div>
                      )}
                      {record.afterPhotoPath && (
                        <div className="photo-item">
                          <Image
                            src={getPhotoUrl(record.afterPhotoPath)}
                            alt="修复后"
                            fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjZWVlIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij7nvZHlp5HlkIzniZ88L3RleHQ+PC9zdmc+"
                          />
                          <div className="photo-label">修复后</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <PhotoGallery photos={record.processPhotos} recordId={record.id} />

                <SolutionFile
                  fileName={record.solutionFileName}
                  filePath={record.solutionFilePath}
                  fileUrl={record.solutionFileUrl}
                />
              </div>
            ),
          }))}
        />
      )}
    </div>
  )
}

export default RelicDetail
