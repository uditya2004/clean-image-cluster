
# Image Clustering App

A powerful web application for intelligent image organization and processing. This tool helps users organize and clean their image collections using advanced features like facial recognition clustering, duplicate detection, and quality assessment.

![App Preview](public/ProjectScreenShot1.png)

## Features

- **Face-based Clustering**: Group images by faces using AI-powered facial recognition
  - Upload a reference photo to find similar faces
  - Perfect for organizing photos by person
- **Duplicate Detection**: Automatically identify and remove duplicate images
- **Blur Detection**: Filter out blurry or low-quality images
- **Bad Angle Detection**: Remove photos with poor composition or angles

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/image-clustering-app.git
cd image-clustering-app
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and visit `http://localhost:8080`

## 🛠️ Built With

- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable components built with Radix UI and Tailwind CSS

## 📁 Project Structure

```
src/
├── components/         # React components
│   ├── FeatureSelector.tsx
│   ├── ImageUpload.tsx
│   ├── ProcessingStatus.tsx
│   └── ResultGallery.tsx
├── pages/             # Page components
├── hooks/             # Custom React hooks
└── lib/              # Utility functions and helpers
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Lucide Icons](https://lucide.dev/) for the beautiful icons
- [Radix UI](https://www.radix-ui.com/) for accessible UI primitives
- The open-source community for their invaluable contributions

## 📞 Support

If you have any questions or need help, please:
- Open an issue
- Reach out to the maintainers
- Check out our [documentation](https://docs.yourdomain.com)

## 🔮 Future Features

- [ ] Batch processing for large image collections
- [ ] Custom clustering algorithms
- [ ] Export options for processed images
- [ ] Cloud storage integration
- [ ] More advanced image processing filters

