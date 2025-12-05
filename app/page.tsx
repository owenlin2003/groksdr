import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Grok SDR Demo
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          AI-Powered Sales Development Representative System
        </p>
        <p className="mt-2 text-lg text-gray-500">
          Intelligent lead qualification and personalized outreach powered by Grok
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/leads"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-900">Leads</h2>
          <p className="mt-2 text-gray-600">
            View and manage all leads with AI-powered qualification
          </p>
        </Link>

        <Link
          href="/pipeline"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-900">Pipeline</h2>
          <p className="mt-2 text-gray-600">
            Visualize leads across sales pipeline stages
          </p>
        </Link>

        <Link
          href="/evaluation"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-900">Evaluation</h2>
          <p className="mt-2 text-gray-600">
            Compare Grok model variants and analyze performance
          </p>
        </Link>
      </div>

      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Key Features</h3>
        <ul className="list-disc list-inside space-y-2 text-blue-800">
          <li>AI-powered lead qualification with customizable scoring criteria</li>
          <li>Personalized outreach message generation</li>
          <li>Automated pipeline progression based on lead scores</li>
          <li>Comprehensive activity logging and timeline</li>
          <li>Model evaluation framework for comparing Grok variants</li>
        </ul>
      </div>
    </div>
  );
}
