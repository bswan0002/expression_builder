# Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

# Code Style Guidelines

- **TypeScript**: Strict type checking, no unused locals/parameters
- **Components**: Functional with React.FC<Props> typing
- **Naming**:
  - PascalCase for components, types, interfaces
  - camelCase for variables, functions, methods
- **Imports**: ES modules with direct paths
- **Error Handling**: Custom errors extend Error class with specific messages

# Project Structure

- `/src/components`: React components
- `/src/types`: TypeScript interfaces/types
- `/src/utils`: Utility functions
- `/src/language`: CodeMirror language definitions

# Development Practices

- Use type annotations consistently
- Follow React hooks patterns (useRef, useState, useEffect)
- Maintain component modularity and single responsibility
- Avoid any/unknown types when possible
- when working on codemirror, you can reference codemirror-docs.md in project root which I scraped from docs site
