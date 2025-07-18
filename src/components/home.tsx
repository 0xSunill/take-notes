"use client";

import { useState, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, web3, Idl } from "@coral-xyz/anchor";
import idl from "../../anchor/target/idl/notes_app.json";
import toast from "react-hot-toast";
import { WalletSignTransactionError } from "@solana/wallet-adapter-base";

const PROGRAM_ID = new PublicKey(
  "A1mqt2qGaBxy7yz3oX2nrxoovG9CgshHQSzyfEVdEZUg"
);
const connection = new Connection("https://api.devnet.solana.com");

export default function NotesApp() {
  const wallet = useWallet();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMessage, setEditMessage] = useState("");

  const provider = useMemo(() => {
    if (!wallet.publicKey) return null;
    return new AnchorProvider(connection, wallet as any, {
      commitment: "processed",
    });
  }, [wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(idl as Idl, provider);
  }, [provider]);

  const getNotePDA = (noteTitle: string, user: PublicKey) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from(noteTitle), user.toBuffer()],
      PROGRAM_ID
    );

  const createNote = async () => {
    if (!title || !message || !wallet.publicKey || !program) return;

    try {
      const [notePda] = getNotePDA(title, wallet.publicKey);

      // generate a fresh Keypair so the tx hash changes
      const dummy = web3.Keypair.generate();

      await program.methods
        .createNote(title, message)
        .accounts({
          note: notePda,
          owner: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .postInstructions([
          web3.SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: dummy.publicKey,
            lamports: 1,
          }),
        ])
        .rpc();

      toast.success("Note created!");
      setNotes([{ title, message }, ...notes]);
      setTitle("");
      setMessage("");
    } catch (err: any) {
      if (err instanceof WalletSignTransactionError) {
        toast.error("You cancelled the transaction.");
      } else {
        toast.error(err.message);
      }
      console.error(err);
    }
  };

  const saveEdit = async () => {
    if (
      editingIndex === null ||
      !wallet.publicKey ||
      !program ||
      !notes[editingIndex]
    )
      return;

    const updatedTitle = notes[editingIndex].title;
    const [notePda] = getNotePDA(updatedTitle, wallet.publicKey);

    try {
      const dummy = web3.Keypair.generate();

      await program.methods
        .updateNote(updatedTitle, editMessage)
        .accounts({
          note: notePda,
          owner: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .postInstructions([
          web3.SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: dummy.publicKey,
            lamports: 1,
          }),
        ])
        .rpc();

      const updatedNotes = [...notes];
      updatedNotes[editingIndex] = {
        title: updatedTitle,
        message: editMessage,
      };
      setNotes(updatedNotes);
      toast.success("Note updated!");
      setEditingIndex(null);
      setEditTitle("");
      setEditMessage("");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const deleteNote = async (index: number) => {
    if (!wallet.publicKey || !program) return;
    const noteToDelete = notes[index];
    const [notePda] = getNotePDA(noteToDelete.title, wallet.publicKey);

    try {
      await program.methods
        .deleteNote(noteToDelete.title)
        .accounts({
          note: notePda,
          owner: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      const updated = [...notes];
      updated.splice(index, 1);
      setNotes(updated);
      toast.success("Note deleted!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const startEdit = (idx: number) => {
    setEditingIndex(idx);
    setEditTitle(notes[idx].title);
    setEditMessage(notes[idx].message);
  };

  return (
    <div>
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
        <button
          onClick={createNote}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create
        </button>
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
                    disabled
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
  );
}
