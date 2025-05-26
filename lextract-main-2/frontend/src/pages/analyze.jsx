import React, { useState, useRef, useEffect } from 'react';
import './analyze.css';
import su from '../assets/submit.png';
import d from '../assets/download.png';
import e from '../assets/email.png';
import c from '../assets/chatbot.png';
import { useTranslation } from 'react-i18next';


export default function Analyze() {
    const [file, setFile] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [currentStage, setCurrentStage] = useState(-1);
    const [resultJson, setResultJson] = useState(null);
    const [animateTitle, setAnimateTitle] = useState(false);
    const { t } = useTranslation();


    const inputRef = useRef(null);

    const stages = ['Extracting', 'Detecting', 'Parsing', 'Structuring', 'Analyzing'];

    useEffect(() => {
        setAnimateTitle(true);
    }, []);

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.type.startsWith('image/') || droppedFile.type === 'application/pdf')) {
            handleFileSelection(droppedFile);
        } else {
            alert('Please upload an image or PDF file.');
        }
    };

    const handleDragOver = (e) => e.preventDefault();
    const handleClick = () => inputRef.current.click();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && (selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf')) {
            handleFileSelection(selectedFile);
        } else {
            alert('Please upload an image or PDF file.');
        }
    };

    const handleFileSelection = (selectedFile) => {
        if (selectedFile.type.startsWith('image/')) {
            setFileType('image');
        } else if (selectedFile.type === 'application/pdf') {
            setFileType('pdf');
        }
        setFile(URL.createObjectURL(selectedFile));
    };

    const handleClear = () => {
        setFile(null);
        setFileType(null);
        inputRef.current.value = null;
        setAnalyzing(false);
        setCurrentStage(-1);
        setResultJson(null);
    };

    const handleAnalyze = async () => {
        setAnalyzing(true);
        setCurrentStage(0);
        let stageIndex = 0;

        const interval = setInterval(() => {
            stageIndex++;
            if (stageIndex < stages.length) {
                setCurrentStage(stageIndex);
            } else {
                clearInterval(interval);
            }
        }, 1400);

        setTimeout(async () => {
            const fileInput = inputRef.current;
            const selectedFile = fileInput.files[0];
            const formData = new FormData();
            formData.append('file', selectedFile);

            try {
                const res = await fetch("http://localhost:5000/analyze", {
                    method: "POST",
                    body: formData,
                });
                const data = await res.json();
                setResultJson(data.json);
            } catch (error) {
                console.error("Error analyzing document:", error);
                setResultJson("Something went wrong. Try again.");
            }
        }, 1000);
    };
    const handleDownload = () => {
        if (!resultJson) return;
    
        let dataToExport;
    
        try {
            const cleaned =
                typeof resultJson === 'string'
                    ? resultJson.replace(/json|```/g, '').trim()
                    : JSON.stringify(resultJson);
    
            dataToExport = JSON.parse(cleaned);
        } catch (err) {
            console.error("Failed to parse JSON:", err);
            return;
        }
    
        // Create a simple CSV from key-value pairs
        const rows = [
            ['Field', 'Value'],
            ['Client Name', dataToExport['Client name'] || 'N/A'],
            ['PAN', dataToExport['PII data']?.PAN?.join(', ') || 'N/A'],
            ['AADHAAR', dataToExport['PII data']?.AADHAAR?.join(', ') || 'N/A'],
            ['GSTIN', dataToExport['PII data']?.GSTIN?.join(', ') || 'N/A'],
            ['Nature of Notice', dataToExport['Nature of notice'] || 'N/A'],
            ['Deadlines and Penalties', dataToExport['Deadlines and penalties'] || 'N/A'],
            ['Reporting Officer/Office', dataToExport['Reporting officer/office'] || 'N/A'],
            ['Relevant Legal Sections', dataToExport['Relevant legal sections'] || 'N/A'],
        ];
    
        const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
        // Create a blob and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
    
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'analyzed_data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    

    return (
        <div className="analyze-main">
            <div className="a-top">
                <div className={`hero-title ${animateTitle ? 'animate' : ''}`}>
                    <h1>Document Analysis</h1>
                    {/* <p className="tagline">Extract structured data from legal documents in multiple languages</p> */}
                </div>
            </div>

            <div className={`a-1-wrapper ${file ? 'uploaded' : ''}`}>
                <div
                    className={`a-1 ${file ? 'shrink-left' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={!file ? handleClick : undefined}
                >
                    {file ? (
                        fileType === 'image' ? (
                            <img src={file} alt="Uploaded Preview" className="preview-img" />
                        ) : (
                            <div className="pdf-preview">
                                <embed src={file} type="application/pdf" width="100%" height="100%" />
                                <p>PDF Document</p>
                            </div>
                        )
                    ) : (
                        <>
                            <div className="a-1-1">
                                <img src={su} alt="upload-icon" />
                            </div>
                            <div className="divider"></div>
                            <div className="a-1-2">
                                <p>{t('documentAnalysis.imageUpload.dragDrop')}</p>
                                <p>or Click here to upload an image or PDF</p>
                            </div>
                        </>
                    )}
                    <input
                        type="file"
                        accept="image/*,application/pdf"
                        ref={inputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                </div>

                {file && (
                    <div className="button-group">
                        <button className="action-btn analyze" onClick={handleAnalyze}>
                            <span>
                                {fileType === 'image'
                                    ? t('documentAnalysis.buttons.analyze.image')
                                    : t('documentAnalysis.buttons.analyze.pdf')}
                            </span>
                        </button>
                        <button className="action-btn clear" onClick={handleClear}>
                            <span>
                                {fileType === 'image'
                                    ? t('documentAnalysis.buttons.clear.image')
                                    : t('documentAnalysis.buttons.clear.pdf')}
                            </span>
                        </button>
                    </div>
                )}
            </div>

            {analyzing && (
                <div className="a-2">
                    <div className="stage-progress">
                        {stages.map((stage, index) => (
                            <div
                                key={index}
                                className={`stage ${index === currentStage ? 'active' : index < currentStage ? 'done' : ''}`}
                            >
                                <div className="dot"></div>
                                <span className="label">{stage}</span>
                            </div>
                        ))}
                        <div className="progress-line">
                            <div
                                className="line-fill"
                                style={{ width: `${((currentStage + 1) / stages.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}

            {resultJson && (
                <>
                    <div className="a-3">
                        <h3>Extracted Information</h3>
                        {(() => {
                            try {
                                const cleaned = typeof resultJson === 'string'
                                    ? resultJson.replace(/json|```/g, '').trim()
                                    : JSON.stringify(resultJson);

                                const data = JSON.parse(cleaned);

                                return (
                                    <table className="structured-table">
                                        <tbody>
                                            <tr>
                                                <th>Client Name</th>
                                                <td>{data["Client name"] || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <th>PAN</th>
                                                <td>{data["PII data"]?.PAN?.join(', ') || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <th>AADHAAR</th>
                                                <td>{data["PII data"]?.AADHAAR?.join(', ') || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <th>GSTIN</th>
                                                <td>{data["PII data"]?.GSTIN?.join(', ') || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <th>Nature of Notice</th>
                                                <td>{data["Nature of notice"] || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <th>Deadlines and Penalties</th>
                                                <td>{data["Deadlines and penalties"] || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <th>Reporting Officer/Office</th>
                                                <td>{data["Reporting officer/office"] || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <th>Relevant Legal Sections</th>
                                                <td>{data["Relevant legal sections"] || 'N/A'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                );
                            } catch (error) {
                                return <p style={{ color: 'red' }}>Error Analyzing the Document: {error.message}</p>;
                            }
                        })()}
                    </div>
                    <div className="a-4">
                        <img src={d} alt="Download results" title="Download results" onClick={handleDownload}/>
                        <img src={e} alt="Email results" title="Email results" />
                        <img src={c} alt="Chat with AI" title="Chat with AI" />
                    </div>
                </>
            )}
        </div>
    );
}
