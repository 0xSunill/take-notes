"use client"
import { useState } from "react";

export default function home() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState([]);

  const createNote = () => {
    if (!title || !message) return;
    const newNote = { title, message };
    setNotes([newNote, ...notes]);
    setTitle("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">📝 Take Notes App</h1>
        {/* <WalletMultiButton /> */}
      </div>

      <div className="bg-white p-6 rounded shadow mb-6">
        <input
          type="text"
          placeholder="Title"
          className="border p-2 mr-2 mb-2 w-full md:w-1/3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Message"
          className="border p-2 mr-2 w-full md:w-2/3 mb-2"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div>
          <button
            onClick={createNote}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </div>

      {notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note, idx) => (
            <div key={idx} className="bg-white p-4 rounded shadow">
              <h2 className="font-bold text-lg">{note.title}</h2>
              <p className="text-gray-700 mt-1">{note.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No notes yet. Add one above 👆</p>
      )}
    </div>
  );
}
