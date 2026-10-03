function Navbar() {
  return (
    <header className="navbar">
      <div className="brand">
        <div className="brand-icon">₿</div>

        <div>
          <h1>Bitcoin Privacy Assistant</h1>
          <span>Blockchain Privacy Analyzer</span>
        </div>
      </div>

      <div className="network-status">
        <span className="status-dot"></span>
        Bitcoin Network
      </div>
    </header>
  );
}

export default Navbar;