import { useState, useEffect } from 'react'
import { Table, Empty, Spin } from 'antd'
import { getAllModels } from '../../../api/settings'

export default function AIModels() {
  const [modelsData, setModelsData] = useState([])
  const [tabsLoading, setTabsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setTabsLoading(true)
      try {
        const response = await getAllModels()
        setModelsData(response.data || [])
      } catch (error) {
        console.error('Error loading AI models data:', error)
      } finally {
        setTabsLoading(false)
      }
    }

    loadData()
  }, [])

  const getModelColumns = () => [
    { title: 'Model ID', dataIndex: 'ID', key: 'id' },
    { title: 'Description', dataIndex: 'Description', key: 'description' },
    { title: 'Client', dataIndex: 'Client', key: 'client' },
  ]

  return (
    <div className="space-y-4">
      {tabsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Spin size="large" />
        </div>
      ) : modelsData.length > 0 ? (
        <Table
          columns={getModelColumns()}
          dataSource={modelsData}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      ) : (
        <Empty description="No AI models found" />
      )}
    </div>
  )
}
