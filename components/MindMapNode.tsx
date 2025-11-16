import React from 'react';
import type { MindMapNodeData } from '../types';
import { PlusSquareIcon, MinusSquareIcon, LoaderIcon, BookOpenIcon } from './Icons';

interface MindMapNodeProps {
  node: MindMapNodeData;
  onExpand: (nodeId: string) => void;
  onCollapse: (nodeId:string) => void;
  onGenerateProof: (conceptName: string) => void;
  isLast: boolean[];
}

const colorPalette = [
    'text-cyan-400',
    'text-emerald-400',
    'text-amber-400',
    'text-rose-400',
    'text-indigo-400',
    'text-pink-400'
];

export const MindMapNode: React.FC<MindMapNodeProps> = ({ node, onExpand, onCollapse, onGenerateProof, isLast }) => {

  const handleToggle = () => {
    if (node.isExpanded) {
      onCollapse(node.id);
    } else {
      onExpand(node.id);
    }
  };
  
  const nodeColor = colorPalette[node.depth % colorPalette.length];
  const animationDelay = `${Math.min(node.depth * 50 + (isLast.length > 0 ? isLast.length * 10 : 0), 500)}ms`;

  return (
    <div 
        className="relative animate-fadeInUp" 
        style={{ animationDelay, animationFillMode: 'backwards' }}
    >
      <div className="absolute flex h-full -left-5">
        {isLast.slice(0, -1).map((last, index) => (
            <div key={index} className={`w-5 border-l-2 ${last ? 'border-transparent' : 'border-cyan-400/20'}`}></div>
        ))}
      </div>
      
      <div className="flex items-center space-x-3 py-1.5 relative">
         <div className="absolute -left-5 w-5 h-1/2 border-l-2 border-b-2 border-cyan-400/20 rounded-bl-lg"></div>
         {isLast[isLast.length-1] && <div className="absolute -left-5 top-1/2 w-5 h-1/2 border-l-2 border-transparent"></div>}
        <div className="flex-shrink-0">
          {node.isLoading ? (
            <LoaderIcon className="w-6 h-6 text-gray-500" />
          ) : (
            <button onClick={handleToggle} className="text-gray-400 hover:text-white transition-colors duration-200" aria-label={node.isExpanded ? `Collapse ${node.name}` : `Expand ${node.name}`}>
              {node.isExpanded ? <MinusSquareIcon className="w-6 h-6"/> : <PlusSquareIcon className="w-6 h-6"/>}
            </button>
          )}
        </div>
        <span className={`font-medium ${nodeColor} text-lg hover:brightness-125 transition-all`}>{node.name}</span>
        <button 
            onClick={() => onGenerateProof(node.name)}
            className="text-gray-500 hover:text-cyan-400 transition-colors duration-200 group relative"
            aria-label={`Generate explanation for ${node.name}`}
            title="Generate Explanation"
        >
            <BookOpenIcon className="w-5 h-5"/>
        </button>
      </div>

      <div className="pl-12 pb-2">
        {node.description && <p className="text-gray-400 text-base">{node.description}</p>}
      </div>

      <div className={`pl-5 overflow-hidden transition-[max-height] duration-500 ease-in-out ${node.isExpanded && node.children ? 'max-h-[1000px]' : 'max-h-0'}`}>
          {node.children && node.children.map((child, index) => (
            <MindMapNode
              key={child.id}
              node={child}
              onExpand={onExpand}
              onCollapse={onCollapse}
              onGenerateProof={onGenerateProof}
              isLast={[...isLast, index === node.children.length-1]}
            />
          ))}
      </div>
    </div>
  );
};