function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    {
      id: "dashboard",
      icon: "⌂",
      label: "Dashboard",
    },
    {
      id: "privacy",
      icon: "◉",
      label: "Privacy Checker",
    },
    {
      id: "assistant",
      icon: "✦",
      label: "AI Assistant",
    },
    {
      id: "knowledge",
      icon: "▤",
      label: "Knowledge Base",
    },
    {
      id: "history",
      icon: "◷",
      label: "History",
    },
  ];

  return (
    <aside className="sidebar">

      <div className="sidebar-title">
        ANALYSIS
      </div>

      <nav>
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={
              activePage === item.id
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() => setActivePage(item.id)}
          >
            <span className="sidebar-icon">
              {item.icon}
            </span>

            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-warning">
        <strong>Privacy first</strong>

        <p>
          Never enter a private key,
          seed phrase, or wallet secret.
        </p>
      </div>

    </aside>
  );
}

export default Sidebar;