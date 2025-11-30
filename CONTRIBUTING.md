# Contributing to ContextMemo

## Introduction

Thank you for considering contributing to ContextMemo. This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- Clear and descriptive title
- Detailed steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Browser version and operating system
- Extension version

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- Clear and descriptive title
- Detailed description of the proposed functionality
- Explanation of why this enhancement would be useful
- Possible implementation approach if applicable

### Pull Requests

1. Fork the repository
2. Create a new branch from `main`
3. Make your changes
4. Ensure all tests pass
5. Update documentation as needed
6. Submit a pull request

#### Pull Request Guidelines

- Follow the existing code style
- Write clear commit messages
- Include tests for new functionality
- Update documentation for API changes
- Keep pull requests focused on a single concern

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- Google Chrome

### Installation

```bash
git clone https://github.com/Goldenmist00/WebMark.git
cd WebMark
npm install
```

### Building

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

## Code Style

### TypeScript

- Use TypeScript strict mode
- Avoid `any` types
- Define proper interfaces for all data structures
- Use async/await for asynchronous operations

### React

- Use functional components with hooks
- Follow React best practices
- Implement proper error boundaries
- Use meaningful component and variable names

### File Organization

- Keep files focused on a single responsibility
- Use clear and descriptive file names
- Organize imports logically
- Add comments for complex logic

## Testing

### Manual Testing

Before submitting a pull request:

1. Build the extension
2. Load it in Chrome
3. Test all affected functionality
4. Verify no console errors
5. Test on multiple websites
6. Verify persistence across page reloads

### Test Checklist

- Context menu appears on text selection
- Note input UI displays correctly
- Notes save successfully
- Highlights appear with badges
- Tooltips show on hover
- Dashboard displays all notes
- Search filters correctly
- Delete removes highlights
- Sync works across tabs

## Documentation

### Code Documentation

- Add JSDoc comments for public functions
- Document complex algorithms
- Explain non-obvious code decisions
- Keep comments up to date

### User Documentation

- Update README.md for user-facing changes
- Add examples for new features
- Update troubleshooting section as needed
- Keep installation instructions current

## Commit Messages

### Format

```
type(scope): subject

body

footer
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(highlights): add support for custom highlight colors

Implement user-configurable highlight colors with color picker
in the dashboard settings panel.

Closes #123
```

```
fix(storage): resolve race condition in concurrent saves

Add version-based optimistic locking to prevent data loss
when multiple tabs save simultaneously.

Fixes #456
```

## Release Process

### Version Numbers

Follow Semantic Versioning (SemVer):
- MAJOR version for incompatible API changes
- MINOR version for backwards-compatible functionality
- PATCH version for backwards-compatible bug fixes

### Release Checklist

1. Update version in package.json
2. Update version in manifest.json
3. Update CHANGELOG.md
4. Create git tag
5. Build production version
6. Test thoroughly
7. Create GitHub release
8. Update Chrome Web Store listing

## Questions

For questions about contributing, please open an issue with the "question" label.

## License

By contributing to ContextMemo, you agree that your contributions will be licensed under the MIT License.
