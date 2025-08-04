function ExperimentList({ experiments, selected, onSelect }) {
  if (experiments.length === 0) return null

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Select Experiments</h2>
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {experiments.map((id) => (
          <div 
            key={id} 
            className={`p-2 rounded-md transition-all duration-200 ${selected.includes(id) ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'}`}
          >
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(id)}
                onChange={(e) => onSelect(id, e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors"
              />
              <span className="font-mono text-sm transition-colors">{id}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ExperimentList;