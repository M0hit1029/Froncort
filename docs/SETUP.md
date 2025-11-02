# Froncort Setup Guide

This guide will help you set up and run the Froncort collaborative editor and Kanban system.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** 9.x or higher (comes with Node.js)
- **Git** (for cloning the repository)

You can verify your installations:

```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/M0hit1029/Froncort.git
cd Froncort
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 16.0.1
- TipTap editor libraries
- dnd-kit for drag and drop
- Zustand for state management
- Lucide React for icons
- TailwindCSS for styling
- And other dependencies

Installation should take 1-3 minutes depending on your internet speed.

### 3. Run the Development Server

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

You should see output similar to:

```
▲ Next.js 16.0.1 (Turbopack)
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in 678ms
```

### 4. Open in Browser

Open your web browser and navigate to:

```
http://localhost:3000
```

The app will automatically:
1. Create a demo user (Alice Johnson)
2. Create a demo project (Froncort Platform)
3. Redirect you to the Documents page

## Available Scripts

### Development

```bash
npm run dev
```

Runs the app in development mode with hot-reload enabled.

### Build

```bash
npm run build
```

Creates an optimized production build. The build output will be in `.next/` directory.

### Production

```bash
npm run build
npm start
```

Builds and starts the production server.

### Linting

```bash
npm run lint
```

Runs ESLint to check code quality and catch potential issues.

## First Steps After Installation

### 1. Explore the Documents Page

- Click "New Page" to create a new document
- Use the rich text editor toolbar for formatting
- Try markdown shortcuts like `# ` for headings
- Your work is auto-saved to localStorage

### 2. Try the Kanban Board

- Click "Kanban" in the sidebar
- Drag cards between columns (To Do, In Progress, Done)
- Click on a card to edit it inline
- Add descriptions, labels, and due dates

### 3. Check the Activity Feed

- Click "Activity" in the sidebar
- See all recent changes in your project
- Activities are automatically tracked

## Browser Compatibility

Froncort works best on modern browsers:

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Data Storage

All data is stored in your browser's **localStorage**:

- Documents and their versions
- Kanban boards and cards
- Projects and team members
- Activity history (last 1000 items)
- User session

**Important Notes:**
- Data is browser-specific (not synced across devices)
- Clearing browser data will delete all content
- Private/Incognito mode won't persist data
- Each browser has ~5-10MB localStorage limit

## Troubleshooting

### Port 3000 Already in Use

If port 3000 is already taken:

```bash
PORT=3001 npm run dev
```

Or edit `package.json`:

```json
"dev": "next dev -p 3001"
```

### Build Errors

If you encounter build errors:

1. Delete node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

2. Clear Next.js cache:
```bash
rm -rf .next
npm run build
```

### localStorage Quota Exceeded

If you see quota errors:

1. Open browser DevTools (F12)
2. Go to Application > Storage
3. Clear localStorage for localhost:3000
4. Refresh the page

### Hot Reload Not Working

Try:

```bash
# Stop the dev server (Ctrl+C)
rm -rf .next
npm run dev
```

## Development Tips

### Using DevTools

1. **React DevTools**: Install the browser extension for better debugging
2. **Network Tab**: Monitor API calls and loading times
3. **Console**: Check for errors or warnings
4. **Application Tab**: Inspect localStorage state

### Editing the Code

The project uses:
- **TypeScript** for type safety
- **ESLint** for code quality
- **TailwindCSS** for styling

Key directories:
- `/app` - Pages and routes
- `/components` - Reusable components
- `/store` - Zustand state stores
- `/lib` - Utilities and types

### Testing Changes

1. Save your file (auto-reload will trigger)
2. Check the browser for updates
3. Look for console errors
4. Test the feature manually

## Environment Variables

Currently, the app doesn't require environment variables. For production deployment, you may want to add:

```bash
# .env.local
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Deploy (no configuration needed)

### Netlify

1. Build command: `npm run build`
2. Publish directory: `.next`
3. Deploy

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t froncort .
docker run -p 3000:3000 froncort
```

## Performance Optimization

For better performance in production:

1. **Enable caching**: Configure CDN for static assets
2. **Compress images**: Use WebP format
3. **Code splitting**: Next.js handles this automatically
4. **Monitoring**: Add analytics and error tracking

## Getting Help

If you encounter issues:

1. Check the [README.md](./README.md) for features and limitations
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
3. Check browser console for error messages
4. Ensure all dependencies are installed correctly

## Next Steps

After successful setup:

1. **Customize**: Modify branding, colors, and layout
2. **Extend**: Add new features or integrations
3. **Deploy**: Push to production
4. **Document**: Add team-specific documentation

## Security Notes

For development only:
- No authentication required (auto-login)
- Data stored in browser localStorage
- No server-side validation

For production:
- Implement real authentication
- Add server-side validation
- Use a real database
- Enable HTTPS
- Add rate limiting

## License

MIT License - see the repository for details.

## Support

For questions or issues with this take-home assignment project:
- Open an issue on GitHub
- Review the documentation files in `/docs`
- Check the code comments for inline documentation

---

Happy coding! 🚀
