import { useState } from "react";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import PrivacyChecker from "./pages/PrivacyChecker";
import Assistant from "./pages/Assistant";
import KnowledgeBase from "./pages/KnowledgeBase";
import History from "./pages/History";


function App() {

  const [activePage, setActivePage] =
    useState("dashboard");


  const renderPage = () => {

    switch (activePage) {

      case "privacy":
        return <PrivacyChecker />;

      case "assistant":
        return <Assistant />;

      case "knowledge":
        return <KnowledgeBase />;

      case "history":
        return <History />;

      default:
        return (
          <Dashboard
            setActivePage={setActivePage}
          />
        );
    }
  };


  return (
    <div className="app">

      <Navbar />

      <div className="app-body">

        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
        />

        {renderPage()}

      </div>

    </div>
  );
}


export default App;