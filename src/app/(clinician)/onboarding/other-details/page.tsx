"use client"

const OtherDetailsPage = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Other Details</h1>
      <form className="space-y-4">
        <div>
          <p className="block text-sm font-medium mb-1">LinkedIn Profile</p>
          <input
            type="url"
            className="w-full p-2 border rounded-md"
            placeholder="Enter your LinkedIn profile URL"
          />
        </div>
        <div>
          <p className="block text-sm font-medium mb-1">Portfolio Website</p>
          <input
            type="url"
            className="w-full p-2 border rounded-md"
            placeholder="Enter your portfolio website URL"
          />
        </div>
        <div>
          <p className="block text-sm font-medium mb-1">Bio</p>
          <textarea
            className="w-full p-2 border rounded-md"
            rows={4}
            placeholder="Tell us about yourself"
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

export default OtherDetailsPage 