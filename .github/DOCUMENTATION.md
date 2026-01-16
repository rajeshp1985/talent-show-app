# Documentation Guide

## 📚 Which Document Should I Read?

### I want to deploy FAST (2 minutes)
→ **[QUICKSTART.md](../QUICKSTART.md)**

### I want complete instructions
→ **[DEPLOYMENT.md](../DEPLOYMENT.md)**

### I want an overview of the app
→ **[README.md](../README.md)**

## Documentation Structure

```
📄 README.md (Start here!)
   ├─ Overview & features
   ├─ Quick start
   ├─ Local development
   └─ Basic troubleshooting

📄 QUICKSTART.md (Fastest path)
   ├─ One-command deploy
   ├─ MongoDB setup summary
   └─ Common commands

📄 DEPLOYMENT.md (Complete guide)
   ├─ Step-by-step deployment
   ├─ Detailed MongoDB setup
   ├─ Environment variables
   ├─ Troubleshooting
   └─ Monitoring & costs
```

## Quick Reference

| Task | Command | Documentation |
|------|---------|---------------|
| Deploy fast | `npm run deploy:quick` | [QUICKSTART.md](../QUICKSTART.md) |
| Deploy with guidance | `npm run deploy` | [DEPLOYMENT.md](../DEPLOYMENT.md) |
| Setup MongoDB | `npm run setup:db` | [DEPLOYMENT.md](../DEPLOYMENT.md#3-set-up-mongodb-atlas-5-minutes) |
| Verify config | `npm run verify` | - |
| Local dev | `npm run dev` | [README.md](../README.md#local-development) |

## Documentation Philosophy

- **README.md**: Entry point, overview, quick links
- **QUICKSTART.md**: Minimal steps to get deployed
- **DEPLOYMENT.md**: Complete reference with all details

No redundancy, clear hierarchy, easy to navigate.
