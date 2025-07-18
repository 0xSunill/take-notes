"use client"
import { useState } from "react";

export default function NotesApp() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState([]);
  const [dark, setDark] = useState(false);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMessage, setEditMessage] = useState("");

  const createNote = () => {
    if (!title || !message) return;
    setNotes([{ title, message }, ...notes]);
    setTitle("");
    setMessage("");
  };

  const deleteNote = (index: number) => {
    const updatedNotes = [...notes];
    updatedNotes.splice(index, 1);
    setNotes(updatedNotes);
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditTitle(notes[index].title);
    setEditMessage(notes[index].message);
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    const updatedNotes = [...notes];
    updatedNotes[editingIndex] = { title: editTitle, message: editMessage };
    setNotes(updatedNotes);
    setEditingIndex(null);
    setEditTitle("");
    setEditMessage("");
  };

  return (
    <div >
      <div >


        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow mb-6">
          <input
            type="text"
            placeholder="Title"
            className="border p-2 mr-2 mb-2 w-full md:w-1/3 bg-white dark:bg-gray-700 dark:text-white"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Message"
            className="border p-2 mr-2 w-full md:w-2/3 mb-2 bg-white dark:bg-gray-700 dark:text-white"
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
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 p-4 rounded shadow"
              >
                {editingIndex === idx ? (
                  <>
                    <input
                      type="text"
                      className="border p-2 w-full mb-2 bg-white dark:bg-gray-700 dark:text-white"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <textarea
                      className="border p-2 w-full mb-2 bg-white dark:bg-gray-700 dark:text-white"
                      rows={3}
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                    />
                    <button
                      onClick={saveEdit}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 mr-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <h2 className="font-bold text-lg">{note.title}</h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {note.message}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(idx)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteNote(idx)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No notes yet. Add one above 👆
          </p>
        )}
      </div>
    </div>
  );
}
