"use client"

const WorkExperiencePage = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Work Experience</h1>
      <form className="space-y-4">
        <div>
          <p className="block text-sm font-medium mb-1">Current Company</p>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            placeholder="Enter your current company name"
          />
        </div>
        <div>
          <p className="block text-sm font-medium mb-1">Job Title</p>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            placeholder="Enter your job title"
          />
        </div>
        <div>
          <p className="block text-sm font-medium mb-1">Years of Experience</p>
          <input
            type="number"
            className="w-full p-2 border rounded-md"
            placeholder="Enter years of experience"
          />
        </div>
        <div>
          <p className="block text-sm font-medium mb-1">Skills</p>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            placeholder="Enter your skills (comma separated)"
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

export default WorkExperiencePage 