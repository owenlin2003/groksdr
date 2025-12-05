import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Grok SDR Demo
        </h1>
        <p className="mt-4 text-lg text-gray-600 sm:text-xl">
          AI-Powered Sales Development Representative System
        </p>
        <p className="mt-2 text-base text-gray-500">
          Intelligent lead qualification and personalized outreach powered by Grok
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        <Link
          href="/leads"
          className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Leads</h2>
          <p className="text-sm text-gray-600">
            View and manage all leads with AI-powered qualification
          </p>
        </Link>

        <Link
          href="/pipeline"
          className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Pipeline</h2>
          <p className="text-sm text-gray-600">
            Visualize leads across sales pipeline stages
          </p>
        </Link>

        <Link
          href="/evaluation"
          className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Evaluation</h2>
          <p className="text-sm text-gray-600">
            Compare Grok model variants and analyze performance
          </p>
        </Link>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="mr-2 text-gray-400">•</span>
            <span>AI-powered lead qualification with customizable scoring criteria</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-gray-400">•</span>
            <span>Personalized outreach message generation</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-gray-400">•</span>
            <span>Automated pipeline progression based on lead scores</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-gray-400">•</span>
            <span>Comprehensive activity logging and timeline</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-gray-400">•</span>
            <span>Model evaluation framework for comparing Grok variants</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
