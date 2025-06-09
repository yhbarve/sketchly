# Sketchly

**Real-time collaborative whiteboard**  
_Work in progress – UI needs a lot of work!_  

Sketchly is a browser-based whiteboard where multiple users can draw, chat, and collaborate in real time.

## 🚀 Features (Working)

- **Real-time drawing**  
  Synchronized brush strokes across all participants via Socket.IO.
- **In-memory history & replay**  
  New joiners immediately see all past strokes.
- **Per-user Undo**  
  Each user can undo only their own last stroke without affecting others.
- **Cursor indicators**  
  See other users’ cursor positions live.
- **Chat pane**  
  Send text messages alongside your drawings.
- **Brush toolbar**  
  Pick pen color and adjust line width on the fly.
- **Export as PNG**  
  Download the current board as an image.

> **Note:** Persistence (save/load to server or database) is planned but not yet implemented.

## ⚙️ Tech Stack

- **Backend:** Node.js, Express, Socket.IO, TypeScript  
- **Frontend:** React, TypeScript, TailwindCSS, Socket.IO-client  
- **Deployment:** (Not live yet)

## 🛠 Work in Progress

- UI/UX design needs **a lot** of polish  
- Mobile/responsive support is pending  
- Save/load persistence (MongoDB or other storage) to be added  
- Undo/Redo stack improvements and redo functionality  

## 🚧 Not Live Yet
- Once the core features are stable, I will move to deployment (Heroku, Vercel, etc.) and add long-term storage.