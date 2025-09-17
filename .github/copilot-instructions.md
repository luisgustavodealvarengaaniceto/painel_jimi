<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# JIMI IOT Brasil Dashboard Project

This is a professional dashboard website for JIMI IOT BRASIL with the following specifications:

## Project Structure
- **Frontend**: React + TypeScript + Vite + Styled Components
- **Backend**: Node.js + Express + TypeScript + Prisma + PostgreSQL
- **Authentication**: JWT with two user levels (ADMIN/VIEWER)
- **Real-time**: Auto-refreshing content with smooth transitions

## Brand Identity
- **Primary Color**: #09A0E9 (Blue)
- **Secondary Color**: #272D3B (Dark Gray)
- **Typography**: Roboto (primary), Montserrat (secondary)
- **Logo**: JIMI IOT BRASIL

## Key Features
1. **Display Page**: 25% fixed sidebar + 75% dynamic slideshow
2. **Admin Panel**: Content management for slides and fixed content
3. **Authentication**: Secure login system with role-based access
4. **Responsive Design**: Optimized for TV displays

## Technical Guidelines
- Use styled-components for styling with the defined theme
- Follow TypeScript best practices
- Implement proper error handling
- Use React Query for data fetching
- Maintain consistent code structure and naming conventions

## Database Schema
- Users (id, username, password, role)
- Slides (id, title, content, duration, order, isActive)
- FixedContent (id, type, content, isActive, order)

When working on this project, always consider the professional TV display context and maintain the JIMI IOT BRASIL brand consistency.
