import { useState, useCallback } from 'react'
import FileUploader from './components/FileUploader'
import ExperimentList from './components/ExperimentList'
import ChartViewer from './components/ChartViewer'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'

function App() {
  const [data, setData] = useState([])
  const [experiments, setExperiments] = useState([])
  const [selectedExperiments, setSelectedExperiments] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSmooth, setIsSmooth] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const handleParsedData = useCallback((parsedRows) => {
    setIsLoading(true)
    
    setTimeout(() => {
      setData(parsedRows)
      const uniqueIds = [...new Set(parsedRows.map(row => row.experiment_id))]
      setExperiments(uniqueIds)
      setSelectedExperiments([])
      setIsLoading(false)
    }, 0)
  }, [])

  const handleExperimentSelect = useCallback((experimentId, isSelected) => {
    setSelectedExperiments(prev => 
      isSelected 
        ? [...prev, experimentId] 
        : prev.filter(id => id !== experimentId)
    )
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Experiment Tracker</h1>
            <p className="text-gray-600 mt-2">Visualize and compare your experiment metrics</p>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Settings"
            >
              <Cog6ToothIcon className="w-6 h-6" />
            </button>
            
            {showSettings && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                  <h3 className="font-medium">Chart Settings</h3>
                </div>
                <div className="px-4 py-2">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-700">Smooth curves</span>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input 
                        type="checkbox" 
                        checked={isSmooth}
                        onChange={(e) => setIsSmooth(e.target.checked)}
                        className="sr-only"
                        id="smooth-toggle"
                      />
                      <div className={`block w-10 h-6 rounded-full ${isSmooth ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isSmooth ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <FileUploader onDataParsed={handleParsedData} />
            
            {isLoading ? (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="animate-pulse space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-8 bg-gray-100 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <ExperimentList
                experiments={experiments}
                selected={selectedExperiments}
                onSelect={handleExperimentSelect}
              />
            )}
          </div>
          
          <div className="lg:col-span-2">
            <ChartViewer 
              data={data} 
              selectedExperiments={selectedExperiments} 
              isLoading={isLoading}
              isSmooth={isSmooth}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App;