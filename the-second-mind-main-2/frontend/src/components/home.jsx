import { useEffect, useState } from 'react';
import './home.css';
import Navbar from './navbar';
import Lp from './lp';
import Content from './content';

export default function Home() {
    const [showSplash, setShowSplash] = useState(true);
    const [loading, setLoading] = useState(false);
    const [responseData, setResponseData] = useState(null);
    const [messages, setMessages] = useState([]); // ✅ Add this

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const handleQuerySubmit = async (query) => {
        setMessages((prev) => [...prev, query]); // ✅ Add to messages
        setLoading(true);
        setResponseData(null);

        try {
            const res = await fetch("http://localhost:5000/process_query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
            });
            const data = await res.json();
            setResponseData(data);
        } catch (err) {
            console.error("Query error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="main">
            {showSplash ? (
                <div className="splash splash-exit">
                    <h1>The Second Mind</h1>
                </div>
            ) : (
                <div className="main-2 main-2-enter">
                    <Navbar />
                    <div className="main-2-in">
                        <Lp onSubmit={handleQuerySubmit} messages={messages} />
                        <Content loading={loading} responseData={responseData} />
                    </div>
                </div>
            )}
        </div>
    );
}
