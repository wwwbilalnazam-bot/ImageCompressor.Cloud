export default function TrustBadges() {
  const badges = [
    { icon: '🎉', text: '100% Free', description: 'Forever free, no hidden costs', color: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
    { icon: '🔓', text: 'No Signup', description: 'Start compressing instantly', color: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' },
    { icon: '🔒', text: 'Secure & Private', description: 'Your data never leaves your device', color: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {badges.map((badge, idx) => (
        <div
          key={idx}
          className={`border-2 rounded-2xl p-5 text-center hover:shadow-md transition-all duration-300 hover:scale-105 ${badge.color}`}
        >
          <div className="text-3xl mb-2">{badge.icon}</div>
          <p className="font-bold text-sm mb-1">{badge.text}</p>
          <p className="text-xs opacity-75">{badge.description}</p>
        </div>
      ))}
    </div>
  )
}
