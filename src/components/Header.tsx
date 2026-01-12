import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">Gazoduc Invest</Link>
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
          <button className="text-gray-700">FR</button>
          <span>|</span>
          <button className="text-gray-700">EN</button>
        </div>
      </nav>
    </header>
  )
}
