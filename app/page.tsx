export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">Construction POS</h1>
      <p className="text-lg mb-8">Welcome to the Point of Sale System</p>
      <a 
        href="/login" 
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Go to Login
      </a>
    </div>
  )
}
