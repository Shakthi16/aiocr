# AI OCR Document Processor

A powerful web-based OCR (Optical Character Recognition) application that transforms documents into structured, searchable data using AI-powered text extraction and intelligent field recognition.

![AI OCR Document Processor](https://img.shields.io/badge/React-18.3.1-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue) ![Vite](https://img.shields.io/badge/Vite-5.4.19-yellow) ![Tesseract.js](https://img.shields.io/badge/Tesseract.js-6.0.1-green)

## ✨ Features

- **Multi-format Support**: Process PDF documents and image files (PNG, JPG, JPEG)
- **AI-Powered OCR**: Advanced text extraction using Tesseract.js with English language support
- **Image Enhancement**: Automatic image preprocessing for better OCR accuracy
- **Intelligent Field Extraction**: Smart recognition of document fields (names, addresses, dates, IDs, etc.)
- **PDF Report Generation**: Export processed results as downloadable PDF reports
- **Document History**: Local storage of processed documents with search and management
- **Real-time Processing**: Live progress tracking during document analysis
- **Responsive Design**: Modern, mobile-friendly interface built with shadcn/ui
- **Fallback OCR**: Automatic retry with alternative processing for challenging documents

## 🚀 Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **OCR Engine**: Tesseract.js
- **PDF Processing**: pdfjs-dist
- **PDF Generation**: jsPDF with html2canvas
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Form Handling**: React Hook Form with Zod validation

## 📋 Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

## 📖 Usage

### Basic Document Processing

1. **Upload a Document**
   - Click or drag a PDF or image file onto the upload zone
   - Supported formats: PDF, PNG, JPG, JPEG

2. **Processing Stages**
   - **Enhancing**: Image preprocessing for optimal OCR accuracy
   - **Extracting**: AI-powered text recognition and field extraction
   - **Complete**: Results display with confidence scores

3. **View Results**
   - Extracted text with formatting preservation
   - Structured fields (name, address, dates, IDs, etc.)
   - Processing confidence percentage
   - Enhanced image preview

4. **Generate Reports**
   - Download comprehensive PDF reports
   - Includes original document, extracted text, and structured data

### Document History

- Access previously processed documents
- Search and filter document history
- Delete unwanted entries
- Quick re-analysis of stored documents

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   ├── Navigation.tsx   # Main navigation
│   ├── UploadZone.tsx   # File upload interface
│   ├── ProcessingView.tsx # Processing progress display
│   ├── ResultsView.tsx  # Results presentation
│   └── HistoryPanel.tsx # Document history management
├── pages/               # Route components
│   ├── Index.tsx        # Main application page
│   └── NotFound.tsx     # 404 error page
├── utils/               # Utility functions
│   ├── ocrProcessor.ts  # OCR and field extraction logic
│   ├── imageEnhancer.ts # Image preprocessing
│   ├── pdfExtractor.ts  # PDF page extraction
│   ├── pdfGenerator.ts  # PDF report generation
│   └── documentStorage.ts # Local document storage
├── types/               # TypeScript type definitions
│   └── document.ts      # Document and field types
├── hooks/               # Custom React hooks
├── lib/                 # Library configurations
└── assets/              # Static assets
```

## 🔧 Configuration

### OCR Settings

The application uses Tesseract.js with English language support. OCR parameters can be modified in `src/utils/ocrProcessor.ts`:

- Language: Currently set to English (`'eng'`)
- Confidence thresholds: Adjustable for different accuracy requirements
- Image preprocessing: Contrast and brightness adjustments

### Storage

Document history is stored locally using IndexedDB for persistence across browser sessions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for all new code
- Follow the existing component structure and naming conventions
- Add proper error handling and loading states
- Test with various document types and formats
- Ensure responsive design across devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tesseract.js](https://github.com/naptha/tesseract.js) for OCR functionality
- [pdfjs-dist](https://github.com/mozilla/pdf.js/) for PDF processing
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include sample documents if reporting OCR accuracy issues

---

**Transform your documents with AI-powered intelligence!** 🚀
