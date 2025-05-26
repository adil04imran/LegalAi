import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const tabOptions = [
  "Best Response",
  "Generation",
  "Reflection",
  "Ranking",
  "Evolution",
  "Proximity",
  "Meta Review",
];

export default function Content2({ data }) {
  const [activeTab, setActiveTab] = useState("Best Response");

  const tabContent = {
    "Best Response": data.best_response,
    "Generation": data.generation,
    "Reflection": data.reflection,
    "Ranking": data.ranking,
    "Evolution": data.evolution,
    "Proximity": data.proximity,
    "Meta Review": data.meta_review
  };

  return (
    <div className="content-2">
      <div className="tab-container">
        {tabOptions.map(tab => (
          <div
            key={tab}
            className={`tab-item ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>
      <div className="tab-content">
        <ReactMarkdown>{tabContent[activeTab]}</ReactMarkdown>
      </div>
    </div>
  );
}
