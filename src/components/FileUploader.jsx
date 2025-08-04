import { useState } from 'react'
import Papa from 'papaparse'

const isValidRow = row => (
  row.experiment_id && 
  row.metric_name && 
  !isNaN(Number(row.step)) &&
  !isNaN(Number(row.value))
)

function FileUploader({ onDataParsed }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setSelectedFile(file)
    setIsUploading(true)
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,

      complete: (results) => {
        setIsUploading(false)
        const filtered = results.data.filter(isValidRow)
        onDataParsed(filtered)
      },

      error: () => {
        setIsUploading(false)
      }
    })
  }

  const handleClearFile = () => {
    setSelectedFile(null)
    onDataParsed([])
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {selectedFile ? 'Selected file:' : 'Upload CSV file'}
      </label>
      
      {selectedFile ? (
        <div className="flex items-center justify-between bg-white py-2 px-3 rounded-md border border-gray-300">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
              {selectedFile.name}
            </span>
          </div>
          <button 
            onClick={handleClearFile}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            disabled={isUploading}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <label className={`relative cursor-pointer bg-white py-2 px-4 rounded-md shadow-sm text-sm font-medium ${isUploading ? 'text-gray-500' : 'text-indigo-600 hover:bg-indigo-50'} border ${isUploading ? 'border-gray-300' : 'border-indigo-300'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors`}>
            {isUploading ? 'Uploading...' : 'Choose file'}
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange} 
              className="sr-only"
              disabled={isUploading}
            />
            {isUploading && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2">
                <svg className="animate-spin h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            )}
          </label>
          <span className="text-sm text-gray-500">CSV files only</span>
        </div>
      )}
    </div>
  )
}

export default FileUploader;