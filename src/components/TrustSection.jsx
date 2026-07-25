export default function TrustSection() {
  const trustItems = [
    {
      icon: '🛡️',
      title: 'Completely Secure',
      description: 'Browser-based processing. Zero server uploads. Your data stays private.',
    },
    {
      icon: '⚡',
      title: 'Blazingly Fast',
      description: 'Compression in seconds. No waiting. Optimized for all connection speeds.',
    },
    {
      icon: '💰',
      title: 'Free Forever',
      description: 'No subscriptions. No hidden costs. No premium plans. Truly free.',
    },
    {
      icon: '🔓',
      title: 'No Sign-up',
      description: 'Use immediately. No account required. No email needed. Just compress.',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-slate-950">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by Millions
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Built on principles of privacy, speed, and simplicity.
          </p>
        </div>

        {/* Trust Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {trustItems.map((item, idx) => (
            <div
              key={idx}
              className="p-6 text-center hover:shadow-lg transition-shadow duration-300 rounded-xl"
            >
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Privacy Highlight */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-2xl p-8 md:p-12 border border-green-200 dark:border-green-800">
          <div className="flex gap-4 items-start">
            <div className="text-4xl">🔐</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Your Privacy is Guaranteed
              </h3>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2 text-sm">
                <li>✓ Images never uploaded to servers</li>
                <li>✓ Compression happens locally in your browser</li>
                <li>✓ No cookies or tracking</li>
                <li>✓ No data collection</li>
                <li>✓ GDPR compliant</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
