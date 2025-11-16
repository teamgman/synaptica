import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { LoaderIcon, XMarkIcon } from './Icons';
import { ErrorBoundary } from './ErrorBoundary';

interface ProofModalProps {
    isOpen: boolean;
    onClose: () => void;
    conceptName: string;
    proofText: string;
    isLoading: boolean;
}

export const ProofModal: React.FC<ProofModalProps> = ({ isOpen, onClose, conceptName, proofText, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="proof-modal-title"
        >
            <div 
                className="bg-gray-900/80 border border-cyan-400/20 backdrop-blur-xl rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-modalContentEnter"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-cyan-400/20 flex-shrink-0">
                    <h2 id="proof-modal-title" className="text-xl font-bold text-cyan-400">
                        Node Intel: <span className="text-white">{conceptName}</span>
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-white transition-colors"
                        aria-label="Close proof modal"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>
                <div className="p-6 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center min-h-[200px] text-gray-400">
                            <LoaderIcon className="w-10 h-10 mb-4" />
                            <p>Generating proof...</p>
                        </div>
                    ) : (
                        <ErrorBoundary>
                            <div 
                                className="prose prose-invert prose-p:text-gray-300 prose-headings:text-emerald-400 prose-strong:text-white prose-code:text-amber-400 prose-blockquote:border-l-cyan-500"
                            >
                            <ReactMarkdown
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                            >
                                {proofText}
                            </ReactMarkdown>
                            </div>
                        </ErrorBoundary>
                    )}
                </div>
            </div>
        </div>
    );
};