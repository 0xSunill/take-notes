"use client";

// ✅ FIXED: Removed broken imports that didn’t exist or match your project
// import { getBasicProgram, getBasicProgramId } from '@project/anchor'

import { useConnection } from "@solana/wallet-adapter-react";
import { Cluster, PublicKey } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";

import { useMemo } from "react";
import { Program } from "@coral-xyz/anchor";
import { AnchorProvider, web3 } from "@project-serum/anchor";

// ✅ FIXED: Use your actual IDL and program ID
import idl from "@/idl.json"; // Your Anchor-generated IDL
import { useTransactionToast } from "../use-transaction-toast";
const PROGRAM_ID = new PublicKey("A1mqt2qGaBxy7yz3oX2nrxoovG9CgshHQSzyfEVdEZUg");

interface CreateEntryArgs {
  title: string;
  message: string;
  owner: PublicKey;
}

// ✅ FIXED: renamed to useNotesProgram to match your app context
export function useNotesProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();

  // ✅ FIXED: Created program instance directly with IDL and program ID
  const program = useMemo(
    () => new Program(idl as any, PROGRAM_ID, provider),
    [provider]
  );

  const accounts = useQuery({
    queryKey: ["notes", "all", { cluster }],
    queryFn: () => program.account.note.all(), // ✅ FIXED: note instead of journalEntryState
  });

  const createEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: ["note", "create", { cluster }],
    mutationFn: async ({ title, message, owner }) => {
      const [notePDA] = await PublicKey.findProgramAddress(
        [Buffer.from(title), owner.toBuffer()],
        PROGRAM_ID
      );

      // ✅ FIXED: Corrected method name to createNote (your program method)
      return await program.methods
        .createNote(title, message)
        .accounts({
          note: notePDA,
          owner,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      useTransactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create note: ${error.message}`);
    },
  });

  return {
    program,
    accounts,
    createEntry,
  };
}

// ✅ FIXED: renamed this hook to match note logic instead of journal
export function useNoteAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useNotesProgram();

  const accountQuery = useQuery({
    queryKey: ["note", "fetch", { cluster, account }],
    queryFn: () => program.account.note.fetch(account), // ✅ FIXED: fetch note not journal
  });

  const updateEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: ["note", "update", { cluster }],
    mutationFn: async ({ title, message, owner }) => {
      const [notePDA] = await PublicKey.findProgramAddress(
        [Buffer.from(title), owner.toBuffer()],
        PROGRAM_ID
      );

      // ✅ FIXED: updateNote instead of updateJournalEntry
      return await program.methods
        .updateNote(title, message)
        .accounts({
          note: notePDA,
          owner,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update note: ${error.message}`);
    },
  });

  const deleteEntry = useMutation({
    mutationKey: ["note", "delete", { cluster, account }],
    mutationFn: (title: string) =>
      program.methods
        .deleteNote(title)
        .accounts({
          note: account,
          owner: program.provider.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  return {
    accountQuery,
    updateEntry,
    deleteEntry,
  };
}
