# Salita
Salita means "word" in Filipino. A lot of kids growing up in Filipino families abroad understand a bit of Tagalog but never really get to learn it. I wanted to make something fun and familiar that helps them pick up everyday words and keep a connection to the language their parents and lolos and lolas speak.

🔗 **Try it:** [biyaheng-salita.vercel.app](https://biyaheng-salita.vercel.app)


## How it works
Each word category is a jeepney, and the words are its passengers riding in the windows. Kids pick a jeep and choose how they want to learn:

- **Aral** – flip through picture cards and hear each word out loud
- **Laro** – hear a word and tap the right picture out of three choices to earn stars
- **Record** – parents or grandparents record their own voice for each word, so kids hear family instead of a computer voice

## Design
The look is inspired by Philippine jeepney signage: bold hand-painted lettering, bright colours, and a lot of personality. Jeepneys are one of the most recognizable parts of everyday life in the Philippines, so the style makes the app feel playful and culturally familiar instead of like a textbook.

I designed the screens and drew the word icons myself in Figma, in a chunky sticker style with thick navy outlines so they all feel like one family. 
- The home screen sign reads **"Biyaheng Salita"**, like a jeepney route sign
- The Back button says **"Para po!"**, what you say when you want to get off a jeep
- The Laro icon is a **trumpo**, a classic Filipino toy

## Features
- [x] Jeepney-inspired design, with hand-drawn icons
- [x] Word decks: Hayop, Pamilya, Pagkain, Kulay
- [x] Audio pronunciation with Filipino text-to-speech
- [x] Parent voice recording that replaces the computer voice
- [x] Picture quiz with shuffled choices
- [x] Stars and recordings saved between visits
- [ ] Flip card animation
- [ ] More decks (greetings, body parts, numbers…)
- [ ] Syncing recordings across devices

## Built With
- React + Vite
- JavaScript and CSS
- Web Speech API for pronunciation
- MediaRecorder API for voice recording
- localStorage to save progress and recordings
- Figma for design and icons
- Deployed on Vercel

## Getting Started
```bash
git clone https://github.com/hannahrsb/salita-flashcards.git
cd salita-flashcards
npm install
npm run dev
```

## What I Learned
This was my first React project, built from scratch while learning as I went.
- Breaking a UI into reusable components, like one `Jeepney` component for all four decks
- Managing state and lifting it up so stars and recordings don't disappear between screens
- Saving data with `localStorage` and `useEffect`, including converting audio to base64 so it can be stored as text
- Working with browser APIs for speech and recording
- Designing for young users: big tap targets, picture-first cards, and audio for kids who can't read yet
- Exporting clean SVGs from Figma (and learning the hard way about hidden backgrounds)