"use client"

import JournalEntryList from "@/components/Journal/JournalEntryList"
import JournalEntryForm from "@/components/Journal/JournalEntryForm"
import { useJournal } from "@/hooks/useJournal"

export default function JournalPage() {
  const { entries, loading, error, refresh } = useJournal()

  return (
    <main className="min-h-screen bg-[#1a1a2e] px-8 py-12">
      <h1 className="text-white text-3xl font-bold mb-8">My Journal</h1>
      <div className="max-w-2xl">
        <JournalEntryForm onSuccess={refresh} />
        {loading && <p className="text-white/40">Loading...</p>}
        {error && <p className="text-red-400">{error}</p>}
        {!loading && !error && <JournalEntryList entries={entries} />}
      </div>
    </main>
  )
}

