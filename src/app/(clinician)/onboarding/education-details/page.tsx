"use client"

const EducationDetailsPage = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Education Details</h1>
      <form className="space-y-4">
        <div>
          <p className="block text-sm font-medium mb-1">Highest Education</p>
          <select className="w-full p-2 border rounded-md">
            <option value="">Select your highest education</option>
            <option value="high-school">High School</option>
            <option value="bachelors">Bachelor Degree</option>
            <option value="masters">Master Degree</option>
            <option value="phd">PhD</option>
          </select>
        </div>
        <div>
          <p className="block text-sm font-medium mb-1">Field of Study</p>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            placeholder="Enter your field of study"
          />
        </div>
        <div>
          <p className="block text-sm font-medium mb-1">Graduation Year</p>
          <input
            type="number"
            className="w-full p-2 border rounded-md"
            placeholder="Enter graduation year"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90"
        >
          Continue
        </button>
      </form>
    </div>
  )
}

export default EducationDetailsPage 