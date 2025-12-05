import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <Image
            src="/images.png"
            alt="Grok Logo"
            width={120}
            height={120}
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">
          Grok SDR Demo
        </h1>
        <p className="text-lg text-gray-600 sm:text-xl mb-2">
          AI-Powered Sales Development Representative System
        </p>
        <p className="text-base text-gray-500 max-w-2xl mx-auto">
          Intelligent lead qualification and personalized outreach powered by Grok
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-16">
        <Link
          href="/leads"
          className="group block p-6 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-900">Leads</h2>
            <span className="text-gray-400 group-hover:text-gray-600 transition-colors">→</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            View and manage all leads with AI-powered qualification
          </p>
        </Link>

        <Link
          href="/pipeline"
          className="group block p-6 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-900">Pipeline</h2>
            <span className="text-gray-400 group-hover:text-gray-600 transition-colors">→</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Visualize leads across sales pipeline stages
          </p>
        </Link>

        <Link
          href="/evaluation"
          className="group block p-6 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-900">Evaluation</h2>
            <span className="text-gray-400 group-hover:text-gray-600 transition-colors">→</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Compare Grok model variants and analyze performance
          </p>
        </Link>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-sm text-gray-700">
            <span className="text-gray-400 mr-2">•</span>
            AI-powered lead qualification with customizable scoring criteria
          </div>
          <div className="text-sm text-gray-700">
            <span className="text-gray-400 mr-2">•</span>
            Personalized outreach message generation
          </div>
          <div className="text-sm text-gray-700">
            <span className="text-gray-400 mr-2">•</span>
            Automated pipeline progression based on lead scores
          </div>
          <div className="text-sm text-gray-700">
            <span className="text-gray-400 mr-2">•</span>
            Comprehensive activity logging and timeline
          </div>
          <div className="text-sm text-gray-700 md:col-span-2">
            <span className="text-gray-400 mr-2">•</span>
            Model evaluation framework for comparing Grok variants
          </div>
        </div>
      </div>
    </div>
  );
}
