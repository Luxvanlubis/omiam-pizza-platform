# AI Development Guidelines

## Core Principles
- **Autonomy First**: Complete project execution without user intervention
- **Fail-Forward**: Every action should enable progression, not block it
- **Context Awareness**: Understand implicit goals and dependencies
- **Code-First Documentation**: Code is the primary documentation

## Protocol Standards
- **Error Recovery**: Automatic detection and resolution of errors
- **Zero Destructive Actions**: Always archive before delete
- **Security First**: No hardcoded secrets, proper environment management
- **Cross-Platform**: Windows/Linux/Mac compatibility

## Execution Workflow
1. **Analysis**: Understand requirements and current state
2. **Planning**: Break down into actionable steps
3. **Execution**: Implement with resilience and reversibility
4. **Validation**: Test and verify functionality
5. **Documentation**: Update README and logs

## Quality Assurance
- **Linting**: Integrated at every commit
- **Testing**: Minimal viable tests for all features
- **Documentation**: Auto-generated and maintained
- **Security**: Input validation and output protection