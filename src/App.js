import './App.css';

import { useState } from "react";
import { functions } from "./firebase";
import { httpsCallable } from "firebase/functions";

function App() {
  const [name, setName] = useState(""); // State to hold the input value
  const [response, setResponse] = useState(""); // State to hold the response message

  const handleAddUser = async () => {
    try {
      const addUserFunction = httpsCallable(functions, "addUser");
      const result = await addUserFunction({ name });

      if (result.data.success) {
        setResponse(result.data.message);
        setName(""); // Clear the name field on successful addition
      } else {
        setResponse("Failed to add user.");
      }
    } catch (error) {
      setResponse("An error occurred.");
      console.error(
        "There was an error calling the addUser Firebase function",
        error
      );
    }
  };

  return (
    <div className="container">
      <h1>
        Pin positions
      </h1>

      <div className="user-input-section">
        <input
          type="text"
          placeholder="Enter name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleAddUser} disabled={!name.trim()}>
          Add User
        </button>
      </div>

      <div className="alert alert-primary" role="alert">{response}</div>
    </div >
  );
}

export default App;
