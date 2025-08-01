
"use client"

import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { Idl, Wallet } from "@project-serum/anchor";
const PROGRAM_ID = new PublicKey("BdUTLSpMArGqxZyUjZYbeFUfoaCCyHizEjkXfiNSTLCf")
import { AnchorProvider, Program } from "@project-serum/anchor";
import { useCallback, useEffect, useState } from "react";
const IDL = {
  "version": "0.1.0",
  "name": "notes",
  "instructions": [
    {
      "name": "createNote",
      "accounts": [
        {
          "name": "noteEntry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "message",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateNote",
      "accounts": [
        {
          "name": "noteEntry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "message",
          "type": "string"
        }
      ]
    },
    {
      "name": "deleteNote",
      "accounts": [
        {
          "name": "noteEntry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "NoteState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "message",
            "type": "string"
          }
        ]
      }
    }
  ]
}
import { toast } from "sonner";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";

type Note = {
  publicKey: PublicKey;
  account: {
    title: string;
    message: string;
  };
};

export default function Home() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [edtTitle, setEdtTitle] = useState("")
  const [edtMessage, setEdtMessage] = useState("")
  const isFormValid = title.trim() !== "" && message.trim() !== "";


  const getNoteAddress = (title: string) => {
    if (!wallet.publicKey || !wallet.signTransaction) return null;
    const [noteAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("note"), wallet.publicKey.toBuffer(), Buffer.from(title)],
      PROGRAM_ID
    );
    return noteAddress;
  }
  const getProgram = useCallback(() => {
    if (!wallet) return null;
    return new Program(
      IDL as Idl,
      PROGRAM_ID,
      new AnchorProvider(connection, wallet as unknown as Wallet, {})
    );
  }, [wallet, connection]);

  const loadNotes = useCallback(async () => {
    if (!wallet?.publicKey) return;

    setLoading(true);
    try {
      const program = getProgram();
      if (!program) return;

      const raw = await program.account.noteState.all([{
        memcmp: { offset: 8, bytes: wallet.publicKey.toBase58() }
      }]);

      const formatted: Note[] = raw.map((n) => ({
        publicKey: n.publicKey,
        account: { title: n.account.title, message: n.account.message }
      }));

      setNotes(formatted);
    } catch (err) {
      console.error("error loading notes", err);
      toast.error("error loading notes");
    } finally {
      setLoading(false);
    }
  }, [wallet?.publicKey, getProgram]);


  const createNote = async () => {

    if (!title.trim() || !message.trim()) {
      toast.error("Enter the title and message")
      return;
    }

    if (title.length > 50) {
      toast.error("title is too long max length is 50 char")
      return;
    }

    if (message.length > 1000) {
      toast.error("message is too long max length is 1000 char")
      return
    }

    setLoading(true)
    try {
      const program = getProgram();
      if (!program) return;

      const noteAddress = getNoteAddress(title);
      if (!noteAddress) return;

      await program.methods
        .createNote(title, message)
        .accounts({
          noteEntry: noteAddress,
          owner: wallet.publicKey ?? undefined,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.success("note created successfully")
      setTitle("")
      setMessage("")
      await loadNotes();
    } catch (error) {
      console.log(`error creating the notes ${error}`)
      toast.error(`error creating the notes ${error}`)

    }
    setLoading(false)
  }


  const updateNote = async (note: Note) => {
    if (!edtMessage.trim()) {
      toast.error("Message can’t be empty");
      return;
    }
    if (edtMessage.length > 1000) {
      toast.error("message is too long max length is 1000 char")
      return;
    }

    setLoading(true)
    try {
      const program = getProgram();
      if (!program) return;

      const noteAddress = getNoteAddress(note.account.title);
      if (!noteAddress) return;
      await program.methods
        .updateNote(note.account.title, edtMessage)
        .accounts({
          noteEntry: noteAddress,
          owner: wallet.publicKey ?? undefined,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      toast.success("Note updated");


      setEdtTitle("");
      setEdtMessage("")
      await loadNotes();
    } catch (error) {
      console.log(`error updating the notes ${error}`)
      toast.success(`error updating the notes ${error}`)
    }
    setLoading(false)
  }



  const deleteNote = async (note: Note) => {
    setLoading(true)
    try {
      const program = getProgram();
      if (!program) return;

      const noteAddress = getNoteAddress(note.account.title);
      if (!noteAddress) return;

      await program.methods
        .deleteNote(note.account.title)
        .accounts({
          noteEntry: noteAddress,
          owner: wallet.publicKey ?? undefined,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      toast.success("Note deleted");

      await loadNotes();
    } catch (error) {
      console.log(`error deletinng the notes ${error}`)
      toast.error(`error deletinng the notes ${error}`)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (wallet?.connected) {
      loadNotes();
    }
  }, [wallet?.connected]);

  if (!wallet.connected) {
    return (
      <div className="text-gray-100 text-center mt-44 text-3xl font-bold">
        Wallet is not connected
      </div>
    )

  }
  return (
    <div className="pt-24 text-white  p-4 flex flex-col h-screen">
      <div className="mx-auto w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 transition-all duration-200">
        <div className="flex flex-col gap-3 px-5 py-4">
          <input
            type="text"
            placeholder="Title"
            className="text-lg font-semibold bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Take a note..."
            rows={4}
            className="text-sm resize-none bg-transparent outline-none text-gray-800 dark:text-gray-300 placeholder:text-gray-500 dark:placeholder:text-gray-500"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="flex justify-end">
            <button
              onClick={createNote}
              disabled={!isFormValid || loading}
              className={`text-sm font-medium px-5 py-2 rounded-md transition-colors duration-150 ${isFormValid && !loading
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>



      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {notes.map((note: Note) => (
          <Card
            key={note.publicKey.toBase58()}
            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-md"
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {note.account.title}
                </h4>

              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                {note.account.message}
              </p>
            </CardContent>

            <CardFooter className="flex justify-end px-4 py-2 space-x-4">
              <button
                value={edtTitle}
                // onChange={(e) => setEdtTitle(e.target.value)}
                onClick={() => {
                  setEdtTitle(note.account.title);
                  setEdtMessage(note.account.message);
                  updateNote(note);
                }}
                className="hover:text-blue-600"
              >
                <Edit className="w-5 h-5 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100" />
              </button>

              <button onClick={() => deleteNote(note)} className="hover:text-red-600">
                <Trash2 className="w-5 h-5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200" />
              </button>
            </CardFooter>
          </Card>
        ))}
      </div>

    </div >
  );
}
