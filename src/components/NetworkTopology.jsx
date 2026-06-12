import React, { useCallback, useMemo } from 'react';
import { ReactFlow, useNodesState, useEdgesState, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  const nodeWidth = 180;
  const nodeHeight = 80;

  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
    return newNode;
  });

  return { nodes: newNodes, edges };
};

const NetworkTopology = ({ networks }) => {
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes = [];
    const edges = [];

    // Root Node (Router/OPNsense)
    nodes.push({
      id: 'root',
      data: { label: '🌐 Ana Yönlendirici (Gateway)' },
      style: { background: 'rgba(0, 229, 200, 0.1)', border: '2px solid var(--neon-cyan)', color: 'var(--text-light)', borderRadius: '8px', padding: '10px' }
    });

    const vlans = networks.filter(n => n.type === 'vlan');
    const devices = networks.filter(n => n.type !== 'vlan');

    vlans.forEach(vlan => {
      nodes.push({
        id: `vlan-${vlan.id}`,
        data: { label: `VLAN: ${vlan.name}\n${vlan.subnet || ''}` },
        style: { background: 'rgba(37, 211, 102, 0.1)', border: '2px solid #25D366', color: 'var(--text-light)', borderRadius: '8px', padding: '10px' }
      });
      edges.push({ id: `e-root-vlan-${vlan.id}`, source: 'root', target: `vlan-${vlan.id}`, animated: true, style: { stroke: 'var(--neon-cyan)' } });
    });

    devices.forEach(dev => {
      nodes.push({
        id: `dev-${dev.id}`,
        data: { label: `${dev.name}\n${dev.ip || ''}` },
        style: { background: 'rgba(255, 255, 255, 0.05)', border: `1px solid ${dev.status === 'online' ? '#25D366' : 'var(--neon-red)'}`, color: 'var(--text-light)', borderRadius: '8px', padding: '10px' }
      });

      // Find parent VLAN
      const parentVlan = vlans.find(v => v.name === dev.vlan);
      if (parentVlan) {
        edges.push({ id: `e-vlan-${parentVlan.id}-dev-${dev.id}`, source: `vlan-${parentVlan.id}`, target: `dev-${dev.id}`, style: { stroke: '#25D366' } });
      } else {
        // If no vlan, attach to root
        edges.push({ id: `e-root-dev-${dev.id}`, source: 'root', target: `dev-${dev.id}`, style: { stroke: 'var(--text-muted)' } });
      }
    });

    return getLayoutedElements(nodes, edges);
  }, [networks]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div style={{ height: '70vh', width: '100%', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(0, 229, 200, 0.2)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background color="#ccc" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default NetworkTopology;
