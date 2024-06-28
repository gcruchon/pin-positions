import './App.css';

import { useState } from "react";

import { collection, addDoc } from "firebase/firestore";
import { db } from './firebase';

function App() {
  const [name, setName] = useState(""); // State to hold the input value
  const [response, setResponse] = useState(""); // State to hold the response message

  const handleAddUser = async () => {
    try {
      const docRef = await addDoc(collection(db, "users"), {
        name: name,
      });
      setName(""); // Clear the name field on successful addition
      setResponse(docRef.id);

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
