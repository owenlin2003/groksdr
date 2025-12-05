import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div className="text-center mb-16">
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
          Grok SDR
        </h1>
        <p className="text-xl sm:text-2xl text-gray-700 mb-4 font-medium">
          AI-Powered Sales Development
        </p>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Intelligent lead qualification and personalized outreach powered by Grok AI
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-20">
        <Link
          href="/leads"
          className="group block p-8 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Leads</h2>
            <span className="text-2xl text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200">→</span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed">
            View and manage all leads with AI-powered qualification and scoring
          </p>
        </Link>

        <Link
          href="/pipeline"
          className="group block p-8 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Pipeline</h2>
            <span className="text-2xl text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200">→</span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed">
            Visualize and manage leads across your sales pipeline stages
          </p>
        </Link>

        <Link
          href="/evaluation"
          className="group block p-8 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Evaluation</h2>
            <span className="text-2xl text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200">→</span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed">
            Compare Grok model variants and analyze AI performance metrics
          </p>
        </Link>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-xl p-10 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-900 mb-8">Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4"></div>
            <div>
              <p className="text-base font-medium text-gray-900 mb-1">AI-Powered Qualification</p>
              <p className="text-sm text-gray-600">Customizable scoring criteria for accurate lead assessment</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4"></div>
            <div>
              <p className="text-base font-medium text-gray-900 mb-1">Personalized Messaging</p>
              <p className="text-sm text-gray-600">Generate tailored outreach messages for each lead</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4"></div>
            <div>
              <p className="text-base font-medium text-gray-900 mb-1">Automated Progression</p>
              <p className="text-sm text-gray-600">Smart pipeline movement based on lead scores</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4"></div>
            <div>
              <p className="text-base font-medium text-gray-900 mb-1">Activity Tracking</p>
              <p className="text-sm text-gray-600">Comprehensive logging and timeline of all interactions</p>
            </div>
          </div>
          <div className="flex items-start md:col-span-2">
            <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4"></div>
            <div>
              <p className="text-base font-medium text-gray-900 mb-1">Model Evaluation</p>
              <p className="text-sm text-gray-600">Compare Grok variants to find the best model for your needs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
