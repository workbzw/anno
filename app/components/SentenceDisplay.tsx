'use client';

interface SentenceDisplayProps {
  sentences: string[];
  currentSentenceIndex: number;
}

export default function SentenceDisplay({ sentences, currentSentenceIndex }: SentenceDisplayProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
      <div className="text-sm text-gray-500 mb-2">请朗读以下句子</div>
      <div className="text-lg font-medium text-gray-900 mb-2">
        {sentences[currentSentenceIndex]}
      </div>
      <div className="text-sm text-gray-400">
        <a href="#" className="text-blue-500 hover:text-blue-600">详细了解</a>
      </div>
    </div>
  );
}