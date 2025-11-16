import React from 'react';
import { BrainCircuitIcon } from './Icons';

export const EmptyState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
        <BrainCircuitIcon className="w-20 h-20 mb-6 text-gray-600" />
        <h3 className="text-2xl font-semibold text-gray-400 mb-2">Ignite the Nexus</h3>
        <p className="max-w-md">Input a core concept and the AI will deconstruct it into a visual, explorable knowledge matrix.</p>
    </div>
);