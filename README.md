# 🎮 Lost Ark Raid Manager

A comprehensive desktop application for managing Lost Ark raids, characters, and gaming activities. Built with Electron and Node.js for a modern, responsive user experience.

## ✨ Features

### 🏰 Core Functionality
- **Raid Management**: Create, schedule, and track raids with detailed information
- **Character Tracking**: Monitor character progress, gear, and statistics
- **Scheduling System**: Calendar view with recurring raids and conflict detection
- **Participant Management**: Track raid participants and manage team composition

### 🤖 Advanced Features
- **OCR Integration**: Automatic text recognition from in-game screenshots
- **AI Assistant**: Intelligent help system for Lost Ark mechanics and strategies
- **Real-time Chat**: Integrated communication system for raid coordination
- **Notifications**: Desktop and in-app notifications for raid reminders

### 🎨 User Experience
- **Modern UI**: Beautiful, responsive interface with light/dark themes
- **Multi-language Support**: Internationalization for global users
- **Customizable Layout**: Adaptive design that works on all screen sizes
- **Quick Actions**: Global shortcuts and rapid access to common functions

### 📊 Analytics & Reporting
- **Progress Tracking**: Monitor raid completion and character advancement
- **Statistics**: Detailed analytics on performance and participation
- **Export Options**: Multiple formats for data backup and sharing
- **Performance Monitoring**: Track application and system performance

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+ or yarn
- Git

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd lost-ark-raid-manager

# Install dependencies
npm install

# Start development mode
npm run dev

# Build for production
npm run build
```

### Development
```bash
# Start in development mode
npm run dev

# Build application
npm run build

# Package for distribution
npm run dist
```

## 🏗️ Project Structure

```
lost-ark-raid-manager/
├── src/
│   ├── main/           # Electron main process
│   ├── renderer/       # Frontend application
│   │   ├── js/        # JavaScript modules
│   │   └── index.html # Main HTML file
│   ├── shared/        # Shared utilities
│   ├── services/      # Backend services
│   └── utils/         # Common utilities
├── assets/            # Images, icons, styles
├── database/          # Database files and schemas
├── config/            # Configuration files
└── docs/             # Documentation
```

## 🔧 Configuration

### Environment Variables
```bash
NODE_ENV=development  # development/production
DEBUG=*              # Enable debug logging
```

### App Configuration
The application uses a centralized configuration system in `src/config/app.config.js`:
- Database settings
- OCR configuration
- AI assistant settings
- Notification preferences
- UI customization options

## 🎯 Core Modules

### Raids Module (`raids.js`)
- Create and manage raids
- Track participants and progress
- Handle raid scheduling
- Manage raid completion status

### Characters Module (`characters.js`)
- Character creation and management
- Gear tracking and optimization
- Progress monitoring
- Statistics and analytics

### Schedule Module (`schedule.js`)
- Calendar view (month/week/day)
- Recurring raid setup
- Conflict detection
- Reminder notifications

### Chat Module (`chat.js`)
- Real-time messaging
- Channel management
- User status tracking
- Message history

### Tools Module (`tools.js`)
- Screenshot capture
- OCR text recognition
- AI assistance
- Data export/import

### Settings Module (`settings.js`)
- Application preferences
- Theme customization
- Notification settings
- Integration configuration

## 🗄️ Database

### Current Implementation
- **Local Storage**: Temporary data persistence using browser localStorage
- **SQLite**: Full database implementation planned (better-sqlite3)

### Data Models
- **Raids**: Raid information, participants, status
- **Characters**: Character data, gear, progress
- **Scheduled Raids**: Calendar events and recurring raids
- **Chat Messages**: Communication history
- **User Settings**: Application preferences

## 🔌 Integrations

### Planned Integrations
- **Discord**: Webhook notifications and bot integration
- **Telegram**: Mobile notifications and updates
- **Personal Website**: Data synchronization and web dashboard
- **Game Client**: Direct game data reading (future)

## 🎨 UI/UX Features

### Design System
- **CSS Variables**: Consistent theming and customization
- **Flexbox/Grid**: Modern layout system
- **Responsive Design**: Works on all screen sizes
- **Accessibility**: WCAG compliant interface

### Themes
- **Light Theme**: Clean, bright interface
- **Dark Theme**: Easy on the eyes
- **Auto Detection**: Follows system preferences
- **Custom Themes**: User-defined color schemes

## 🚀 Performance

### Optimization Features
- **Lazy Loading**: Load modules on demand
- **Image Compression**: Optimize screenshots and images
- **Caching**: Smart data caching for better performance
- **Debouncing**: Efficient user input handling

## 🔒 Security

### Data Protection
- **Local Storage**: All data stays on your device
- **Encryption**: Optional data encryption (future)
- **No Cloud Sync**: Privacy-focused design
- **Secure IPC**: Safe communication between processes

## 📱 Supported Platforms

- **Windows**: Full support with native builds
- **macOS**: Full support with native builds  
- **Linux**: Full support with native builds

## 🛠️ Development

### Code Style
- **ES6+**: Modern JavaScript features
- **Modular Design**: Clean separation of concerns
- **Error Handling**: Comprehensive error management
- **Documentation**: JSDoc comments for all functions

### Testing
- **Manual Testing**: Comprehensive manual testing procedures
- **Automated Testing**: Unit and integration tests (planned)
- **Performance Testing**: Load and stress testing

### Debugging
- **DevTools**: Full Chrome DevTools support
- **Logging**: Comprehensive logging system
- **Error Reporting**: User-friendly error messages

## 📦 Building & Distribution

### Development Build
```bash
npm run dev          # Start development server
npm run build        # Build for development
```

### Production Build
```bash
npm run dist         # Build for all platforms
npm run dist:win     # Windows only
npm run dist:mac     # macOS only
npm run dist:linux   # Linux only
```

### Distribution
- **Auto-updater**: Built-in update system
- **Code Signing**: Secure application distribution
- **Multiple Formats**: EXE, DMG, AppImage, DEB, RPM

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards
- Follow existing code style
- Add JSDoc comments
- Include error handling
- Test your changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Issues**: Report bugs and request features on GitHub
- **Discussions**: Join community discussions
- **Documentation**: Check our comprehensive docs
- **Wiki**: Community-maintained knowledge base

### Common Issues
- **Installation Problems**: Check Node.js version and dependencies
- **Build Errors**: Ensure all dependencies are installed
- **Runtime Issues**: Check console logs and error messages

## 🗺️ Roadmap

### Version 1.0 (Current)
- ✅ Core raid management
- ✅ Character tracking
- ✅ Basic scheduling
- ✅ OCR integration
- ✅ Modern UI

### Version 1.1 (Next)
- 🔄 Advanced scheduling
- 🔄 Team management
- 🔄 Performance analytics
- 🔄 Export/import features

### Version 2.0 (Future)
- 🔮 Discord integration
- 🔮 Cloud synchronization
- 🔮 Mobile companion app
- 🔮 Advanced AI features

## 📊 Statistics

![GitHub stars](https://img.shields.io/github/stars/lost-ark-raid-manager/lost-ark-raid-manager?style=social)
![GitHub forks](https://img.shields.io/github/forks/lost-ark-raid-manager/lost-ark-raid-manager?style=social)
![GitHub issues](https://img.shields.io/github/issues/lost-ark-raid-manager/lost-ark-raid-manager)
![GitHub pull requests](https://img.shields.io/github/issues-pr/lost-ark-raid-manager/lost-ark-raid-manager)
![GitHub license](https://img.shields.io/github/license/lost-ark-raid-manager/lost-ark-raid-manager)

## 🙏 Acknowledgments

- **Lost Ark Community**: For inspiration and feedback
- **Electron Team**: For the amazing desktop framework
- **Open Source Contributors**: For the libraries and tools used
- **Beta Testers**: For helping improve the application

---

**Made with ❤️ for the Lost Ark community**

*This application is not affiliated with Smilegate RPG or Amazon Games.*
