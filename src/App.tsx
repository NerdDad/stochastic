import "./App.css";
// import { useState, useEffect } from "react";
import User from "./components/user/User";

function App() {
  return (
    <div className="row flex flex-center">
      <h1 className="header">Stochastic Games</h1>
      <User />
    </div>
  );
}

export default App;
