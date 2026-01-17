"use client";

import { useState } from 'react';

export default function Dashboard() {
    const [pan, setPan] = useState('');
    const [password, setPassword] = useState('');
    const [spreadsheetId, setSpreadsheetId] = useState('');
    const [sheetName, setSheetName] = useState('Mutual Funds'); // Defaulting to user's preference
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const [questions, setQuestions] = useState<{ q: string, a: string }[]>([
        { q: '', a: '' }, { q: '', a: '' }, { q: '', a: '' }, { q: '', a: '' }, { q: '', a: '' }
    ]);

    const handleTest = async () => {
        setLoading(true);
        setError('');
        setResult(null);
        try {
            // Convert array to Record<string, string>
            const securityMap: Record<string, string> = {};
            questions.forEach(item => {
                if (item.q && item.a) securityMap[item.q] = item.a;
            });

            const response = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pan,
                    password,
                    securityQuestions: securityMap,
                    spreadsheetId,
                    sheetName
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed');
            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <header>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        MF Central Automator
                    </h1>
                    <p className="text-gray-400">Secure automated portfolio tracking</p>
                </header>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
                    <h2 className="text-xl font-semibold">Credentials</h2>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">PAN / PEKRN</label>
                        <input
                            type="text"
                            value={pan}
                            onChange={(e) => setPan(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Google Spreadsheet ID (Optional)</label>
                        <input
                            type="text"
                            placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBzA..."
                            value={spreadsheetId}
                            onChange={(e) => setSpreadsheetId(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            ensure the sheet is shared with the service account.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Sheet Name (Tab Name)</label>
                        <input
                            type="text"
                            placeholder="e.g. Mutual Funds"
                            value={sheetName}
                            onChange={(e) => setSheetName(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Leave empty to auto-detect "Mutual Funds" or the first tab.
                        </p>
                    </div>

                    <div className="space-y-3 border-t border-gray-700 pt-4">
                        <h3 className="text-sm font-semibold text-gray-300">Security Questions (Map)</h3>
                        <p className="text-xs text-gray-500">Enter expected question text and your answer.</p>

                        {questions.map((item, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Question (e.g. 'Place of Birth')"
                                    value={item.q}
                                    onChange={(e) => {
                                        const newQ = [...questions];
                                        newQ[idx].q = e.target.value;
                                        setQuestions(newQ);
                                    }}
                                    className="flex-1 bg-gray-900 border border-gray-700 rounded p-2 text-xs"
                                />
                                <input
                                    type="text"
                                    placeholder="Answer"
                                    value={item.a}
                                    onChange={(e) => {
                                        const newQ = [...questions];
                                        newQ[idx].a = e.target.value;
                                        setQuestions(newQ);
                                    }}
                                    className="flex-1 bg-gray-900 border border-gray-700 rounded p-2 text-xs"
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleTest}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded font-medium transition disabled:bg-gray-600"
                    >
                        {loading ? 'Connecting...' : 'Test Connection'}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded">
                        Error: {error}
                    </div>
                )}

                {result && (
                    <div className="bg-green-900/20 border border-green-500 text-green-200 p-4 rounded space-y-2">
                        <h3 className="font-bold">Success!</h3>
                        <pre className="overflow-auto text-xs bg-black p-2 rounded">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}
