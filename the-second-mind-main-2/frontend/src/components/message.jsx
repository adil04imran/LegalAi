import './message.css';

export default function Message({ messages = [] }) {
    return (
        <div className="mes-back">
            {messages.map((msg, index) => (
                <div key={index} className="message-item-wrapper">
                    <div className="mes-main">
                        {msg}
                        <div className="corner"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
