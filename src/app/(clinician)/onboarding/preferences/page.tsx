"use client"

const PreferencesPage = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Preferences</h1>
      <form className="space-y-4">
        <div>
          <p className="block text-sm font-medium mb-1">Job Type</p>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <span>Full-time</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <span>Part-time</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <span>Contract</span>
            </label>
          </div>
        </div>
        <div>
          <p className="block text-sm font-medium mb-1">Work Location</p>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <span>Remote</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <span>On-site</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <span>Hybrid</span>
            </label>
          </div>
        </div>
        <div>
          <p className="block text-sm font-medium mb-1">Salary Range</p>
          <select className="w-full p-2 border rounded-md">
            <option value="">Select salary range</option>
            <option value="0-50k">$0 - $50,000</option>
            <option value="50k-100k">$50,000 - $100,000</option>
            <option value="100k-150k">$100,000 - $150,000</option>
            <option value="150k+">$150,000+</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90"
        >
          Complete Setup
        </button>
      </form>
    </div>
  )
}

export default PreferencesPage 