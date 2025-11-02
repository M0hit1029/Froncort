# Known Limitations and Future Improvements

This document outlines the current limitations of Froncort and planned improvements.

## Current Limitations

### 1. Data Persistence

**Limitation**: All data is stored in browser localStorage only.

**Impact**:
- Data is not synced across devices or browsers
- Clearing browser data deletes all content
- Storage limit of ~5-10MB per domain
- No backup or export functionality
- Private/Incognito mode doesn't persist data

**Workaround**: Use the same browser on the same device consistently.

**Future**: Implement backend database with cloud sync.

---

### 2. Real-time Collaboration

**Limitation**: Multi-user collaboration is simulated, not real.

**Impact**:
- "1 person editing" indicator is static
- Cursor positions are not tracked
- No conflict resolution for concurrent edits
- No real-time updates when others edit

**Workaround**: None - single-user experience only.

**Future**: Implement WebSocket server with Operational Transform or CRDT for real-time collaboration.

---

### 3. Authentication & Security

**Limitation**: No real authentication system.

**Impact**:
- Auto-login on first visit (demo mode)
- Roles are UI-only (no server enforcement)
- No password protection
- No session management
- Anyone with browser access can see/edit everything

**Workaround**: Use in trusted, single-user environment only.

**Future**: Implement proper auth (NextAuth.js, Clerk, or custom JWT).

---

### 4. Search Functionality

**Limitation**: No global search across documents or cards.

**Impact**:
- Must manually browse through pages/cards
- Can't search by content, title, or tags
- No filtering options in large projects

**Workaround**: Use browser's find (Ctrl+F) on individual pages.

**Future**: Add full-text search with Algolia, ElasticSearch, or similar.

---

### 5. File Uploads

**Limitation**: Images must be embedded via URL only.

**Impact**:
- Can't upload images from computer
- No support for PDF, video, or other files
- Must host images externally
- Broken links if external images removed

**Workaround**: Use image hosting services (Imgur, Cloudinary, etc.).

**Future**: Implement file upload with cloud storage (S3, Cloudinary).

---

### 6. Export Functionality

**Limitation**: No way to export documents or boards.

**Impact**:
- Can't export to PDF, Markdown, or Word
- Can't backup content easily
- Difficult to share with external users
- No print-friendly format

**Workaround**: Copy/paste content manually, or use browser print to PDF.

**Future**: Add export to PDF, Markdown, JSON, and CSV.

---

### 7. Version History Diff

**Limitation**: No visual diff between versions.

**Impact**:
- Can see versions but not what changed
- Must manually compare content
- Difficult to understand version differences

**Workaround**: Open two browser tabs to compare.

**Future**: Implement visual diff viewer (similar to GitHub).

---

### 8. Notification System

**Limitation**: No notifications for mentions or assignments.

**Impact**:
- Won't be alerted when @mentioned
- No notification when assigned to task
- Must manually check activity feed

**Workaround**: Check activity feed regularly.

**Future**: Add toast notifications, email alerts, and push notifications.

---

### 9. Board Limitations

**Limitation**: Only one board per project with fixed columns.

**Impact**:
- Can't create multiple boards (Sprint 1, Sprint 2, etc.)
- Column structure is fixed (To Do, In Progress, Done)
- Can't rename or reorder columns
- Can't archive completed boards

**Workaround**: Create separate projects for different boards.

**Future**: Support multiple boards per project with customizable columns.

---

### 10. Performance with Large Datasets

**Limitation**: No pagination or virtualization.

**Impact**:
- Slow performance with 100+ pages or cards
- All data loaded at once
- Browser may lag with large documents
- LocalStorage can fill up quickly

**Workaround**: Create multiple projects to distribute data.

**Future**: Implement pagination, lazy loading, and virtual scrolling.

---

### 11. Mobile Support

**Limitation**: Not optimized for mobile devices.

**Impact**:
- Sidebar takes full width on mobile
- Drag-and-drop may not work on touch devices
- Editor toolbar may be cramped
- Small screens difficult to use

**Workaround**: Use on desktop/laptop only.

**Future**: Create responsive mobile layout and touch-optimized controls.

---

### 12. Browser Compatibility

**Limitation**: Requires modern browser features.

**Impact**:
- May not work on older browsers (IE, old Safari)
- Requires JavaScript enabled
- LocalStorage must be available
- Some features need ES6+ support

**Workaround**: Use latest version of Chrome, Firefox, Safari, or Edge.

**Future**: Add polyfills for broader compatibility (if needed).

---

### 13. Offline Support

**Limitation**: No true offline functionality.

**Impact**:
- App requires initial page load online
- No Service Worker for offline caching
- Can't use without internet connection initially
- No offline sync queue

**Workaround**: Once loaded, app works offline until refresh.

**Future**: Implement PWA with Service Workers for true offline support.

---

### 14. Accessibility

**Limitation**: Limited accessibility features.

**Impact**:
- No screen reader optimizations
- Keyboard navigation could be better
- No ARIA labels on many elements
- Color contrast may be insufficient for some users

**Workaround**: Use browser accessibility tools where possible.

**Future**: Full WCAG 2.1 AA compliance with proper ARIA labels.

---

### 15. Link Between Cards and Pages

**Limitation**: Cards can reference pages but link is not interactive.

**Impact**:
- `linkedPageId` field exists but not clickable
- Can't easily navigate from card to related document
- No backlinks from pages to cards

**Workaround**: Remember which cards link to which pages manually.

**Future**: Make links clickable and add bidirectional references.

---

## Minor Issues

### UI/UX
- No dark mode toggle (uses system preference)
- No keyboard shortcuts (except built-in browser ones)
- No undo/redo for card movements
- No card templates or quick actions
- No bulk operations (select multiple cards)

### Editor
- No @mention autocomplete
- No emoji picker
- No color/highlight options
- No font size controls
- Limited table editing capabilities

### Kanban
- No swimlanes
- No card filtering or sorting
- No card attachments
- No card comments
- No due date reminders

### Activity Feed
- Limited to last 1000 activities
- No activity filtering UI
- No activity search
- No export of activity log

## Workarounds Summary

| Limitation | Temporary Workaround |
|------------|---------------------|
| No cloud sync | Use same browser/device |
| No search | Use browser Ctrl+F |
| No file uploads | Use external image hosting |
| No export | Copy/paste or print to PDF |
| No notifications | Check activity feed manually |
| One board per project | Create multiple projects |
| Mobile unfriendly | Use desktop only |
| No offline support | Load page once, then works |
| Limited storage | Keep data lean, delete old items |

## Roadmap Priority

### High Priority (MVP+)
1. Backend database integration
2. Real authentication system
3. Global search functionality
4. File upload support
5. Export to PDF/Markdown
6. Multiple boards per project

### Medium Priority
7. Visual version diff
8. Real-time collaboration (WebSocket)
9. Toast notifications
10. Mobile responsive design
11. Offline PWA support
12. Card-to-page linking

### Low Priority
13. Dark mode toggle
14. Advanced editor features
15. Accessibility improvements
16. Email notifications
17. Advanced analytics
18. Third-party integrations

## Technical Debt

- **Testing**: No automated tests (unit, integration, or E2E)
- **Documentation**: In-code comments could be more comprehensive
- **Error Handling**: Limited error boundaries and user-facing error messages
- **Type Safety**: Some `any` types could be more specific
- **Performance**: No React.memo or useMemo in many places
- **Bundle Size**: Could be optimized with better tree-shaking

## Contributing

If you'd like to address any of these limitations:

1. Check if there's an existing issue
2. Create a feature branch
3. Implement with tests
4. Update documentation
5. Submit a pull request

## Conclusion

While Froncort has limitations, it provides a solid foundation for a collaborative workspace. The architecture is designed to be extended, and most limitations can be addressed with backend integration and additional features.

This is a take-home assignment demonstrating frontend architecture and UX design. In production, most of these limitations would be addressed before launch.
