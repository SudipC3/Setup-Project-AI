"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"; // From image, not used in snippet below
import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Answer = {
  summary: string;
  confidence: number;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]); // Assuming initial state is an empty string or array based on common practice
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleQuerySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = query.trim();

    if (!q || loading) return; // Removed `|| loading` as it's already checked

    setLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: q }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const { summary, confidence } = data as {
        summary: string;
        confidence: number;
      };

      setAnswers((prev) => [{ summary, confidence }, ...prev]);
      setQuery("");
      inputRef.current?.focus(); // Assuming inputRef is defined and correctly typed
    } catch (e) {
      console.error(e); // Changed console.log to console.error for error handling
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-dvh w-full bg-zinc-50">
      <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 pb-24 pt-8">
        <header className="mb-4">
          <h1 className="text-xl font-semibold tracking-tight">
            Hello Agent - Ask anything
          </h1>
        </header>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Answers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {answers.length === 0 ? (
              <p className="text-sm text-zinc-600">No answers yet. Ask a question below</p>
            ) : (
              answers.map((ans, index) => (
                <div key={index} className="rounded-xl border border-zinc-200 p-3">
                  <div className="text-sm leading-6">
                    {ans.summary}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    Confidence: {ans.confidence.toFixed(2)}
                  </div>
                </div>
              ))
            )}

          </CardContent>
        </Card>

        <form
          ref={formRef}
          onSubmit={handleQuerySubmit}
          className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-2xl px-4 py-4 backdrop-blur-lg"
        >
          <div className="flex gap-2">
            <Input
              ref={inputRef} // Assuming inputRef is defined elsewhere in the component
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type your questions and press"
              disabled={loading}
              className="h-11"
            />
            <Button type="submit" disabled={loading} className="h-11" >
              {
                loading ? "Thinking" : "Ask"
              }
            </Button>
          </div>
        </form>

      </div>
    </div>
  )
}
