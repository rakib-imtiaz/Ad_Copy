# NomosAI - AI-Powered Legal Platform

A modern, AI-driven legal technology platform designed to streamline legal research, automate documentation, and enhance client services.

## Features

### 🔍 Case Glancer/Viewer
- Upload case documents (PDF, DOC, DOCX, TXT)
- AI-powered case analysis and summary generation
- Legal issue identification
- Success rate predictions
- Similar case references
- Judge recommendations based on jurisdiction

### ✍️ Document Drafter  
- AI-powered legal document generation
- Multiple document types (contracts, NDAs, petitions, etc.)
- Personalized writing style analysis
- Rich text editor with legal formatting
- Template library with customizable variables

### 🔬 Legal Research Assistant
- Conversational AI for legal research
- State-specific and federal law queries
- Citation validation and verification
- Opposing argument suggestions
- DeepSearch algorithm for accuracy

### 🎤 Client Intake System
- Voice-to-text transcription
- Multi-language support
- AI-generated intake summaries
- Three-format output (brief, goal-oriented, full context)
- Automatic lawyer assignment

### 📁 Central Case Storage
- Secure file management system
- Permission-based access control
- Advanced search and filtering
- Case status tracking
- Document versioning

## Technology Stack

- **Frontend**: Next.js 15 with App Router
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom legal theme
- **TypeScript**: Full type safety
- **Icons**: Lucide React
- **State Management**: React hooks and context

## Getting Started

### Prerequisites

- Node.js 18.17.0 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/nomosai-legal-platform.git
   cd nomosai-legal-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
nomosai-legal-platform/
├── app/                    # Next.js 15 App Router
│   ├── globals.css        # Global styles and Tailwind
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Dashboard page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── app-sidebar.tsx   # Main navigation sidebar
│   ├── header.tsx        # Top navigation header
│   └── main-content.tsx  # Dashboard content
├── lib/                  # Utility functions
│   └── utils.ts          # Helper functions
├── types/               # TypeScript type definitions
│   └── index.ts         # Platform-specific types
├── hooks/               # Custom React hooks
│   └── use-mobile.tsx   # Mobile detection hook
└── public/              # Static assets
```

## Design System

### Colors
- **Primary**: Legal Teal (#1ABC9C)
- **Secondary**: Navy Blue (#0D1B2A)  
- **Accent**: Gold (#F1C40F)
- **Gray**: #BDC3C7

### Typography
- **Headings**: Poppins font family
- **Body**: Inter font family
- **Professional legal styling classes**

### Components
- Responsive sidebar navigation
- Professional form styling
- Legal-specific UI patterns
- Accessibility compliant (WCAG 2.1)

## Features in Development

- [ ] AI model integration for case analysis
- [ ] Voice recording and transcription
- [ ] Real-time collaboration
- [ ] Mobile application
- [ ] Court filing system integration
- [ ] Advanced analytics dashboard

## Security & Compliance

- End-to-end encryption (AES-256)
- GDPR/CCPA compliance ready
- Role-based access control
- Secure data handling
- Professional legal standards

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please contact the NomosAI team or create an issue in this repository.

---

**NomosAI** - Transforming legal practice with AI-powered technology. 