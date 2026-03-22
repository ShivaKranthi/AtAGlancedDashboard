import "./styles.css";
import { useState, useEffect } from "react";

const WORD_LENGTH = 5;
const MAX_GUESSES = 5;
const SECRET_WORD_URL = ""; // ← paste CTF URL here

type Status = "correct" | "present" | "absent" | "empty";
const COLOR: Record<Status, string> = { correct: "green", present: "yellow", absent: "red", empty: "#fff" };

function evaluate(guess: string, secret: string): Status[] {
    const result: Status[] = Array(WORD_LENGTH).fill("absent");
    const sec = secret.split("");
    guess.split("").forEach((c, i) => { if (c === sec[i]) { result[i] = "correct"; sec[i] = "#"; } });
    guess.split("").forEach((c, i) => { if (result[i] === "correct") return; const j = sec.indexOf(c); if (j !== -1) { result[i] = "present"; sec[j] = "#"; } });
    return result;
}

export default function App(): JSX.Element {
    const [secret, setSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState(() => Array.from({ length: MAX_GUESSES }, () => Array.from({ length: WORD_LENGTH }, () => ({ letter: "", status: "empty" as Status }))));
    const [currentRow, setCurrentRow] = useState(0);
    const [input, setInput] = useState("");
    const [message, setMessage] = useState("");
    const [done, setDone] = useState(false);

    useEffect(() => {
        fetch(SECRET_WORD_URL).then(r => r.text()).then(w => { setSecret(w.trim().toUpperCase()); setLoading(false); });
    }, []);

    const submit = () => {
        if (input.length !== WORD_LENGTH || !secret || done) return;
        const guess = input.toUpperCase();
        const statuses = evaluate(guess, secret);
        setRows(prev => prev.map((row, ri) => ri === currentRow ? guess.split("").map((letter, ci) => ({ letter, status: statuses[ci] })) : row));
        if (guess === secret) { setMessage("You've won!"); setDone(true); }
        else if (currentRow + 1 >= MAX_GUESSES) { setMessage("You've lost!"); setDone(true); }
        setCurrentRow(r => r + 1);
        setInput("");
    };

    if (loading) return <div>Loading</div>;

    return (
        <div>
            {rows.map((row, ri) => (
                <div key={ri} style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                    {row.map((cell, ci) => (
                        <div key={ci} className="guess-letter" style={{ backgroundColor: COLOR[cell.status] }}>{cell.letter}</div>
                    ))}
                </div>
            ))}
            {!done && (
                <div style={{ marginTop: 12 }}>
                    <input value={input} onChange={e => setInput(e.target.value.slice(0, WORD_LENGTH))} onKeyDown={e => e.key === "Enter" && submit()} maxLength={WORD_LENGTH} />
                    <button onClick={submit} style={{ marginLeft: 8 }}>Guess</button>
                </div>
            )}
            {message && <p style={{ fontWeight: "bold" }}>{message}</p>}
        </div>
    );
}