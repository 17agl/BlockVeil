import { useState } from "react";

function AddressRelationshipGraph({ graph }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);

  if (!graph || !graph.nodes || graph.nodes.length === 0) {
    return null;
  }

  const { nodes, edges } = graph;

  const getNodeColor = (type) => {
    switch (type) {
      case "primary":
        return "#f7931a";
      case "co_spent":
        return "#ef4444";
      case "change":
        return "#f59e0b";
      case "recipient":
        return "#3b82f6";
      default:
        return "#64748b";
    }
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  };

  const handleEdgeClick = (edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  };

  return (
    <div className="graph-card">
      <div className="card-header">
        <p className="section-label">BLOCKCHAIN RELATIONSHIP CLUSTER</p>
        <h2>Interactive Address Relationship Graph</h2>
        <p>Explore observable transaction links, co-spent address clusters, and candidate change outputs.</p>
      </div>

      <div className="graph-legend">
        <div className="legend-item">
          <span className="legend-dot primary" /> Primary Analyzed Address
        </div>
        <div className="legend-item">
          <span className="legend-dot co_spent" /> Co-Spent Address (CIOH Cluster)
        </div>
        <div className="legend-item">
          <span className="legend-dot change" /> Candidate Change Output
        </div>
        <div className="legend-item">
          <span className="legend-dot recipient" /> Recipient Output
        </div>
      </div>

      <div className="graph-visualization-area">
        <div className="nodes-grid">
          {nodes.map((node) => {
            const isSelected = selectedNode && selectedNode.id === node.id;
            const color = getNodeColor(node.type);

            return (
              <div
                key={node.id}
                className={`graph-node ${node.type} ${isSelected ? "selected" : ""}`}
                onClick={() => handleNodeClick(node)}
                style={{ borderColor: color }}
              >
                <div className="node-icon-dot" style={{ backgroundColor: color }} />
                <div className="node-label-text">{node.label}</div>
                <div className="node-script-type">{node.script_type}</div>
              </div>
            );
          })}
        </div>

        <div className="edges-list-section">
          <h3>Observable Transaction Connections ({edges.length})</h3>
          <div className="edges-scroll">
            {edges.map((edge, idx) => {
              const isSelected = selectedEdge === edge;
              return (
                <div
                  key={idx}
                  className={`edge-row ${isSelected ? "selected" : ""}`}
                  onClick={() => handleEdgeClick(edge)}
                >
                  <span className={`edge-type-tag ${edge.type}`}>{edge.type.toUpperCase()}</span>
                  <div className="edge-path">
                    <code>{edge.source.slice(0, 6)}...</code> ➔ <code>{edge.target.slice(0, 6)}...</code>
                  </div>
                  {edge.amount_btc && <span className="edge-amount">{edge.amount_btc} BTC</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {(selectedNode || selectedEdge) && (
        <div className="graph-explanation-panel">
          <div className="panel-header">
            <h4>💡 Why is this connected? (Graph Context)</h4>
            <button className="panel-close" onClick={() => { setSelectedNode(null); setSelectedEdge(null); }}>✕</button>
          </div>

          {selectedNode && (
            <div className="panel-body">
              <p><strong>Address:</strong> <code>{selectedNode.full_address}</code></p>
              <p><strong>Node Type:</strong> {selectedNode.type.toUpperCase()} ({selectedNode.script_type})</p>
              <p className="panel-explanation">
                {selectedNode.type === "primary" && "This is the target address being analyzed."}
                {selectedNode.type === "co_spent" && "This address was co-spent alongside the target address in a multi-input transaction. The Common Input Ownership Heuristic (CIOH) assumes both addresses belong to the same wallet entity."}
                {selectedNode.type === "change" && "This address received an output from a transaction spending your funds. Heuristics suggest it is likely a change output created by your wallet."}
                {selectedNode.type === "recipient" && "This address received a payment from a transaction originating from your address."}
              </p>
            </div>
          )}

          {selectedEdge && (
            <div className="panel-body">
              <p><strong>Transaction ID:</strong> <code>{selectedEdge.txid}</code></p>
              <p><strong>Connection Type:</strong> {selectedEdge.type.toUpperCase()}</p>
              <p className="panel-explanation">{selectedEdge.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AddressRelationshipGraph;
