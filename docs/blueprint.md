# **App Name**: OMR Quiz Master

## Core Features:

- Dynamic Bubble Sheet Generation: Generate a bubble sheet with a configurable number of questions (10-200) arranged in a responsive grid layout using Tailwind CSS.
- Roll Number Grid: Interactive roll number grid allowing single selection per digit position.
- Key Management: Save, load, and delete answer keys in Firestore with user-friendly naming and confirmation prompts.
- Quiz Mode: Simulate test-taking conditions, score attempts against a master key, and provide immediate visual feedback.
- Authentication: Implement user authentication via Firebase Auth with email/password login and anonymous sign-in.
- Data Persistence: Utilize Firebase Firestore for storing answer keys, including key names, question counts, and selected answers. Supports export/import of keys in JSON format.
- Security & Authorization: Secure application by enforcing authentication checks and authorization controls for key management, mode toggling, and setting question count.

## Style Guidelines:

- Primary color: Dark slate gray (#334155) to give a professional and serious impression, evoking a sense of concentration.
- Background color: Light gray (#F1F5F9), a desaturated hue near the primary, in keeping with the light scheme.
- Accent color: Blue-gray (#64748B), used for interactive elements.
- Font: 'Inter', a grotesque-style sans-serif, will be used for headlines and body text for its modern, neutral look. Note: currently only Google Fonts are supported.
- Use Tailwind CSS for a fully responsive, centered, and professional layout with shadows and rounded corners.
- Use simple, clear icons for key actions like saving, loading, and deleting answer keys.
- Subtle animations, such as a fade-in effect when loading keys or a scaling animation when selecting bubbles.