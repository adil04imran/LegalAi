import express from "express";
import multer from "multer";
import { createWorker } from 'tesseract.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Image analysis endpoint
router.post('/analyze', upload.single('file'), async (req, res) => {
    let worker;
    
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                error: 'No file uploaded' 
            });
        }

        // Check file type
        const allowedTypes = [
            'image/jpeg', 
            'image/png', 
            'image/jpg', 
            'application/pdf',
            'text/plain',
            'text/markdown',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid file type. Only JPEG, PNG, and PDF are supported.'
            });
        }

        console.log('Processing file:', req.file.originalname);
        
        // Initialize Tesseract.js worker
        worker = await createWorker({
            logger: m => console.log(m) // Optional: Log progress
        });

        // Set up the worker for English language
        await worker.loadLanguage('eng');
        await worker.initialize('eng');

        // Perform OCR on the image
        console.log('Performing OCR...');
        const { data: { text } } = await worker.recognize(req.file.buffer);
        console.log('OCR completed. Extracted text length:', text.length);
        
        // Process the extracted text
        console.log('Processing extracted text...');
        const result = {
            "Client name": extractClientName(text),
            "PII data": extractPIIData(text),
            "Nature of notice": extractNoticeType(text),
            "Deadlines and penalties": extractDeadlines(text),
            "Reporting officer/office": extractReportingOffice(text),
            "Relevant legal sections": extractLegalSections(text)
        };

        console.log('Analysis completed successfully');
        
        return res.json({
            success: true,
            text: text,
            analysis: result
        });
        
    } catch (error) {
        console.error('Error in /analyze endpoint:', error);
        return res.status(500).json({ 
            success: false,
            error: error.message || 'Error processing document',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    } finally {
        // Make sure to terminate the worker in all cases
        if (worker) {
            try {
                await worker.terminate();
            } catch (e) {
                console.error('Error terminating worker:', e);
            }
        }
    }
});

// Helper functions for text extraction (simplified examples)
function extractClientName(text) {
    // This is a simple regex - you'll need to customize this based on your document format
    const nameMatch = text.match(/Client[:\s]+([^\n]+)/i);
    return nameMatch ? nameMatch[1].trim() : 'Not found';
}

function extractPIIData(text) {
    // Simple regex patterns for PII data
    const panMatch = text.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);
    const aadhaarMatch = text.match(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/);
    const gstinMatch = text.match(/\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/);
    
    return {
        PAN: panMatch ? [panMatch[0]] : [],
        AADHAAR: aadhaarMatch ? [aadhaarMatch[0]] : [],
        GSTIN: gstinMatch ? [gstinMatch[0]] : []
    };
}

function extractNoticeType(text) {
    // Simple keyword matching - customize as needed
    if (/notice of hearing/i.test(text)) return 'Hearing Notice';
    if (/demand notice/i.test(text)) return 'Demand Notice';
    if (/show cause/i.test(text)) return 'Show Cause Notice';
    return 'General Notice';
}

function extractDeadlines(text) {
    // Simple date extraction - customize as needed
    const dateMatch = text.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/g);
    return dateMatch ? `Deadlines: ${dateMatch.join(', ')}` : 'No deadlines found';
}

function extractReportingOffice(text) {
    // Simple pattern matching - customize as needed
    const officeMatch = text.match(/(?:reporting (?:officer|office)|submission to)[:\s]+([^\n]+)/i);
    return officeMatch ? officeMatch[1].trim() : 'Not specified';
}

function extractLegalSections(text) {
    // Simple section extraction - customize as needed
    const sectionMatch = text.match(/section[\s\d,\s]+(?:of the|under|,|and)/gi);
    return sectionMatch ? sectionMatch.join('; ') : 'No legal sections identified';
}

export default router;
