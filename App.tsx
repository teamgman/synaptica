import React, { useState, useCallback } from 'react';
import { generateConceptData, generateProof } from './services/geminiService';
import type { MindMapNodeData } from './types';
import { LoaderIcon, BrainCircuitIcon } from './components/Icons';
import { MindMapNode } from './components/MindMapNode';
import { ProofModal } from './components/ProofModal';
import { EmptyState } from './components/EmptyState';

// Helper function to recursively update the node tree
const updateNodeInTree = (
  nodes: MindMapNodeData[], 
  nodeId: string, 
  update: (node: MindMapNodeData) => MindMapNodeData
): MindMapNodeData[] => {
  return nodes.map(node => {
    if (node.id === nodeId) {
      return update(node);
    }
    if (node.children) {
      return { ...node, children: updateNodeInTree(node.children, nodeId, update) };
    }
    return node;
  });
};

interface ProofModalState {
    isOpen: boolean;
    conceptName: string;
    proof: string;
    isLoading: boolean;
}

const App: React.FC = () => {
  const [rootNode, setRootNode] = useState<MindMapNodeData | null>(null);
  const [concept, setConcept] = useState<string>('Calculus');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [proofModalState, setProofModalState] = useState<ProofModalState>({
      isOpen: false,
      conceptName: '',
      proof: '',
      isLoading: false
  });

  const handleGenerate = async () => {
    if (!concept.trim()) {
      setError('Please enter a concept to generate a mind map.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setRootNode(null);

    try {
      const data = await generateConceptData(concept);
      const initialChildren: MindMapNodeData[] = data.subconcepts.map(subName => ({
        id: crypto.randomUUID(),
        name: subName,
        isExpanded: false,
        isLoading: false,
        depth: 1,
      }));

      setRootNode({
        id: crypto.randomUUID(),
        name: concept,
        description: data.description,
        children: initialChildren,
        isExpanded: true,
        isLoading: false,
        depth: 0
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpand = useCallback(async (nodeId: string) => {
    if (!rootNode) return;

    let targetNode: MindMapNodeData | null = null;
    const findNode = (node: MindMapNodeData): void => {
        if (node.id === nodeId) {
            targetNode = node;
            return;
        }
        if (node.children) {
            for (const child of node.children) {
                findNode(child);
                if (targetNode) return;
            }
        }
    };
    findNode(rootNode);

    if (!targetNode) return;

    // If node already has children, just expand it without fetching
    if (targetNode.children && targetNode.children.length > 0) {
         setRootNode(prevRoot => {
            if (!prevRoot) return null;
            return updateNodeInTree([prevRoot], nodeId, node => ({ ...node, isExpanded: true }))[0];
        });
        return;
    }
    
    // Set loading state on the specific node immediately for better UX
    setRootNode(prevRoot => {
        if (!prevRoot) return null;
        return updateNodeInTree([prevRoot], nodeId, node => ({ ...node, isLoading: true, isExpanded: true }))[0];
    });

    try {
        const data = await generateConceptData(targetNode.name);
        const newChildren: MindMapNodeData[] = data.subconcepts.map(subName => ({
            id: crypto.randomUUID(),
            name: subName,
            isExpanded: false,
            isLoading: false,
            depth: (targetNode?.depth ?? 0) + 1,
        }));
        
        // Final update with new children
        setRootNode(prevRoot => {
            if (!prevRoot) return null;
            return updateNodeInTree([prevRoot], nodeId, node => ({
                ...node,
                children: newChildren,
                description: data.description,
                isLoading: false,
                isExpanded: true,
            }))[0];
        });

    } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch sub-concepts.');
        // Revert loading state on error
        setRootNode(prevRoot => {
            if (!prevRoot) return null;
            return updateNodeInTree([prevRoot], nodeId, node => ({ ...node, isLoading: false, isExpanded: false }))[0];
        });
    }
}, [rootNode]);


  const handleCollapse = useCallback((nodeId: string) => {
      if (!rootNode) return;
      const newRoot = updateNodeInTree([rootNode], nodeId, (node) => ({
          ...node,
          isExpanded: false,
      }))[0];
      setRootNode(newRoot);
  }, [rootNode]);

  const handleGenerateProof = useCallback(async (conceptName: string) => {
      setProofModalState({ isOpen: true, conceptName, proof: '', isLoading: true });
      try {
          const proofText = await generateProof(conceptName);
          setProofModalState(prev => ({ ...prev, proof: proofText, isLoading: false }));
      } catch (e) {
          const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
          setProofModalState(prev => ({ ...prev, proof: `Error: ${errorMessage}`, isLoading: false }));
      }
  }, []);

  const handleCloseProofModal = useCallback(() => {
    setProofModalState({ isOpen: false, conceptName: '', proof: '', isLoading: false });
  }, []);


  return (
    <>
    <div className="min-h-screen bg-transparent text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto animate-fadeInUp">
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-4">
              <BrainCircuitIcon className="w-12 h-12 text-cyan-400"/>
              <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]">
                  Synaptica
              </h1>
          </div>
          <p className="mt-4 text-lg text-gray-400">Visualize your ideas. Powered by intelligence.</p>
        </header>

        <main>
          <div className="bg-gray-900/60 p-6 rounded-2xl shadow-2xl shadow-cyan-500/10 backdrop-blur-lg border border-cyan-400/20 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="e.g., Linear Algebra, Quantum Mechanics"
                className="flex-grow bg-gray-900 border-2 border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
              />
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="flex justify-center items-center bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold py-3 px-6 rounded-lg hover:from-cyan-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-cyan-500/50"
              >
                {isLoading ? (
                  <>
                    <LoaderIcon className="w-5 h-5 mr-2" />
                    Generating...
                  </>
                ) : (
                  'Generate Mind Map'
                )}
              </button>
            </div>
            {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
          </div>

          <div className="bg-gray-900/60 p-6 rounded-2xl shadow-2xl shadow-cyan-500/10 backdrop-blur-lg border border-cyan-400/20 min-h-[300px]">
            {isLoading && !rootNode ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <LoaderIcon className="w-12 h-12 mb-4" />
                    <p className="text-lg">Building your knowledge map...</p>
                </div>
            ) : rootNode ? (
                <MindMapNode 
                  node={rootNode}
                  onExpand={handleExpand}
                  onCollapse={handleCollapse}
                  onGenerateProof={handleGenerateProof}
                  isLast={[true]}
                />
            ) : (
                <EmptyState />
            )}
          </div>
        </main>
      </div>
    </div>
    <ProofModal 
        isOpen={proofModalState.isOpen}
        onClose={handleCloseProofModal}
        conceptName={proofModalState.conceptName}
        proofText={proofModalState.proof}
        isLoading={proofModalState.isLoading}
    />
    </>
  );
};

export default App;