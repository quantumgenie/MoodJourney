# 🌈 MoodJourney - Personal Mood Tracking & Analytics App

## 📱 **What is MoodJourney?**

MoodJourney is a sophisticated mood tracking application that helps users understand their emotional patterns through:

- **🎭 Mood Logging** - Track emotions with intensity levels and associated activities
- **📖 Journaling** - Write detailed entries with semantic emotion analysis
- **📊 Advanced Analytics** - Discover activity-mood correlations and trends
- **🧠 AI-Powered Insights** - Semantic analysis of journal entries for emotion detection
- **📈 Dashboard** - Beautiful visualizations of mood patterns and summaries

---

## ✨ **Key Features**

### 🎯 **Core Functionality**
- **Multi-Emotion Support** - Joy, Sadness, Anger, Fear, Surprise, Calm, Neutral
- **Activity Tracking** - 20+ activity categories with mood correlations
- **Intensity Scaling** - Precise emotional intensity measurement
- **Smart Filtering** - Multiple mood selection and advanced search
- **Data Persistence** - Reliable local storage with AsyncStorage

### 🧠 **Advanced Analytics**
- **Activity Correlation Analysis** - Discover which activities boost or challenge your mood
- **Mood Trend Detection** - Identify improving, declining, or stable patterns
- **Semantic Text Analysis** - AI-powered emotion detection from journal entries
- **Personalized Insights** - Activity recommendations based on your data
- **Today's Summary** - Intelligent daily mood and activity summaries

### 🎨 **User Experience**
- **Smooth Animations** - React Native Reanimated for delightful interactions
- **Intuitive Navigation** - Bottom tab navigation with stack navigators
- **Responsive Design** - Optimized for various screen sizes
- **Loading States** - Comprehensive loading and error state handling
- **Empty States** - Helpful guidance for new users

---

## 🏗️ **Architecture & Technology**

### **📱 Frontend Stack**
- **React Native 0.79.5** - Cross-platform mobile development
- **TypeScript 5.8.3** - Type-safe development
- **React Navigation 7.x** - Navigation management
- **React Native Reanimated 3.17** - Smooth animations
- **React Native Paper 5.14** - Material Design components

### **🛠 Core Services**
- **SemanticAnalysisService** - AI-powered text emotion analysis
- **ActivityCorrelationService** - Advanced mood-activity analytics
- **TodaySummaryService** - Intelligent daily summaries
- **JournalStorageService** - Journal entry persistence
- **MoodStorageService** - Mood data management

### **📊 Data Management**
- **AsyncStorage** - Local data persistence
- **TypeScript Interfaces** - Strict type definitions
- **Service Architecture** - Modular business logic
- **Error Handling** - Graceful failure recovery

---

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Expo CLI
- React Native development environment

### **Installation**

```bash

# Install dependencies
npm install

# Start the development server
npm start

# Run on specific platforms
npm run android    # Android
npm run ios        # iOS
npm run web        # Web
```

### **Testing**

```bash
# Run all tests (unit + integration)
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run all tests with comprehensive output
npm run test:all
```

---

## 🧪 **Testing & Quality Assurance**

### **🎯 Comprehensive Test Suite**
- **194 Total Test Cases** across unit and integration testing
  - **107 Unit Tests** - Individual service validation
  - **87 Integration Tests** - Cross-service workflow validation
- **100% Test Pass Rate** - All tests consistently passing
- **9 Integration Test Suites** - Complete user journey coverage
- **Performance & Scalability Testing** - Large dataset handling
- **Edge Case & Error Handling** - Comprehensive boundary testing

### **📊 Unit Test Coverage by Service**

| Service | Test Cases | Coverage Focus |
|---------|------------|----------------|
| **SemanticAnalysisService** | 15 tests | Emotion detection, text processing |
| **ActivityCorrelationService** | 22 tests | Analytics algorithms, insights |
| **TodaySummaryService** | 15 tests | Dashboard calculations, trends |
| **JournalStorageService** | 25 tests | CRUD operations, search |
| **MoodStorageService** | 18 tests | Data persistence, validation |
| **EmotionLexicon** | 12 tests | Data structure integrity |

### **🔄 Integration Test Coverage by Flow**

| Integration Suite | Test Cases | Coverage Focus |
|------------------|------------|----------------|
| **Service Integration** | 8 tests | Cross-service communication |
| **Dashboard Integration** | 8 tests | Data aggregation, analytics pipeline |
| **Journal Entry Flow** | 10 tests | Complete user journey |
| **Analytics Pipeline** | 12 tests | End-to-end analytics processing |
| **Navigation Flow** | 9 tests | Cross-screen data consistency |
| **Data Synchronization** | 10 tests | Multi-service data integrity |
| **Error Handling** | 8 tests | Failure recovery and resilience |
| **Performance Testing** | 9 tests | Scalability and load testing |
| **Edge Cases** | 16 tests | Boundary conditions, corruption |

### **🛡️ Quality Features**
- **TypeScript** - Compile-time type safety across all code
- **ESLint** - Code quality enforcement and consistency
- **Jest** - Comprehensive testing framework for unit and integration tests
- **Error Boundaries** - Graceful failure handling at all levels
- **Performance Optimization** - Memory and speed optimized with testing validation
- **Integration Testing** - End-to-end workflow validation
- **Concurrent Testing** - Race condition and threading validation
- **Scalability Testing** - Performance validation with large datasets

---

## 📁 **Project Structure**

```
MoodJourney/
├── 📱 src/
│   ├── 🎨 components/          # Reusable UI components
│   │   ├── analytics/          # Chart and analytics components
│   │   ├── common/             # Shared UI elements
│   │   ├── journal/            # Journal-specific components
│   │   └── mood/               # Mood tracking components
│   ├── 🧠 services/            # Business logic services
│   │   ├── analytics/          # Advanced analytics
│   │   ├── dashboard/          # Dashboard calculations
│   │   ├── semanticAnalysis/   # AI text analysis
│   │   └── storage/            # Data persistence
│   ├── 📱 screens/             # App screens
│   │   ├── Dashboard/          # Main dashboard
│   │   ├── MoodInput/          # Mood logging
│   │   ├── Journal/            # Journal entries list
│   │   ├── JournalEntry/       # Individual entry
│   │   └── Analytics/          # Analytics dashboard
│   ├── 🎯 types/               # TypeScript definitions
│   ├── 🎨 theme/               # Design system
│   └── 🧪 test/                # Testing utilities
├── 🧪 __tests__/               # Unit test files (co-located)
├── 🔄 __integration_tests__/   # Integration test suites
│   ├── setup/                  # Test configuration and utilities
│   └── flows/                  # Integration test scenarios
├── 📊 coverage/                # Coverage reports
├── 📚 docs/                    # Documentation
└── 🔧 Configuration files
```

---

## 🎨 **Design System**

### **🌈 Color Palette**
- **Joy** - Warm yellows and oranges
- **Sadness** - Cool blues
- **Anger** - Bold reds
- **Fear** - Deep purples
- **Surprise** - Bright magentas
- **Calm** - Soft greens
- **Neutral** - Balanced grays

### **🎭 Animation System**
- **Staggered Animations** - Sequential element reveals
- **Card Animations** - Smooth entry transitions
- **Navigation Transitions** - Seamless screen changes
- **Loading States** - Engaging loading indicators

---

## 📊 **Features Deep Dive**

### **🎭 Mood Tracking**
- **7 Emotion Categories** with scientific backing
- **Intensity Slider** for precise measurement
- **Activity Association** with 20+ predefined tags
- **Time Tracking** with automatic timestamps
- **Notes Support** for additional context

### **📖 Journaling**
- **Rich Text Support** with semantic analysis
- **Emotion Detection** from written content
- **Activity Suggestions** based on content
- **Mood Alignment** scoring system
- **Search & Filter** capabilities

### **📈 Analytics Dashboard**
- **Activity Effectiveness** insights
- **Mood Distribution** charts
- **Trend Analysis** over time periods
- **Correlation Discoveries** between activities and moods
- **Personalized Recommendations**

### **🏠 Smart Dashboard**
- **Today's Summary** with intelligent insights
- **Quick Actions** for rapid mood logging
- **Trend Indicators** showing mood patterns
- **Activity Highlights** from recent entries

---

## 🔧 **Configuration & Customization**

### **📱 App Configuration**
```json
{
  "expo": {
    "name": "MoodJourney",
    "slug": "moodjourney",
    "version": "1.0.0",
    "platforms": ["ios", "android"],
    "orientation": "portrait"
  }
}
```

### **🎨 Theme Customization**
```typescript
// src/theme/theme.ts
export const theme = {
  colors: {
    mood: {
      joy: '#FFD700',
      sadness: '#4A90E2',
      anger: '#E74C3C',
      // ... more colors
    }
  }
}
```

---

## 🚀 **Performance & Optimization**

### **⚡ Performance Features**
- **Lazy Loading** - Components loaded on demand
- **Memory Management** - Efficient data handling
- **Animation Optimization** - Native driver usage
- **Data Caching** - Smart storage strategies
- **Bundle Optimization** - Minimal app size

## 📚 **Documentation**

### **📖 Additional Resources**
- **[Testing Summary](TESTING_SUMMARY.md)** - Test implementation details

### **🛠 Built With**
- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **Jest** - Testing framework
- **React Navigation** - Navigation system
- **React Native Reanimated** - Animation library

### **📊 Project Stats**
- **Components** - 25+ reusable components
- **Services** - 6 core business services
- **Unit Test Cases** - 107 comprehensive tests
- **Integration Test Cases** - 87 comprehensive tests
- **Total Test Coverage** - 194 tests with 100% pass rate
- **Integration Test Suites** - 9 complete workflow validations

