import { useState, useRef } from "react";
import "./App.css";

const decks = [
  {
    id: "hayop",
    title: "Hayop",
    english: "Animals",
    emoji: "🐶",
    color: "#E2483D",
    cards: [
      { word: "Aso", english: "Dog", pic: "🐶", icon: "/icons/aso.svg", example: "Ang aso ay tumatahol." },
      { word: "Pusa", english: "Cat", pic: "🐱", icon: "/icons/pusa.svg", example: "Ang pusa ay ngumingiyaw." },
      { word: "Ibon", english: "Bird", pic: "🐦", icon: "/icons/ibon.svg", example: "Ang ibon ay huni nang huni." },
    ],
  },
  {
    id: "pamilya",
    title: "Pamilya",
    english: "Family",
    emoji: "🏠",
    color: "#1F5BC7",
    cards: [
      { word: "Nanay", english: "Mom", pic: "👩" },
      { word: "Tatay", english: "Dad", pic: "👨" },
      { word: "Lola", english: "Grandma", pic: "👵" },
    ],
  },
  {
    id: "pagkain",
    title: "Pagkain",
    english: "Food",
    emoji: "🍚",
    color: "#2F9E63",
    cards: [
      { word: "Kanin", english: "Rice", pic: "🍚" },
      { word: "Saging", english: "Banana", pic: "🍌" },
      { word: "Mangga", english: "Mango", pic: "🥭" },
    ],
  },
  {
    id: "kulay",
    title: "Kulay",
    english: "Colors",
    emoji: "🎨",
    color: "#E89A0C",
    cards: [
      { word: "Pula", english: "Red", pic: "🔴" },
      { word: "Asul", english: "Blue", pic: "🔵" },
      { word: "Dilaw", english: "Yellow", pic: "🟡" },
    ],
  },
];

function speak(text) {
  const voice = new SpeechSynthesisUtterance(text);
  voice.lang = "fil-PH";
  voice.rate = 0.8;
  window.speechSynthesis.speak(voice);
}

function say(text, recordings) {
  if (recordings[text]) {
    new Audio(recordings[text]).play();
  } else {
    speak(text);
  }
}

function randomCard(cards) {
  const i = Math.floor(Math.random() * cards.length);
  return cards[i];
}

function Pic({ item }) {
  if (item.icon) {
    return <img src={item.icon} alt={item.word} className="pic-img" />;
  }
  return item.pic;
}

function Card({ card, recordings }) {
  return (
    <div className="card">
      <div className="pic"><Pic item={card} /></div>
      <h1 className="word">{card.word}</h1>
      <p className="english">{card.english}</p>
      <button onClick={() => say(card.word, recordings)}>🔊 Pakinggan</button>
      {card.example && <p className="example">{card.example}</p>}
      {card.example && (
        <button onClick={() => speak(card.example)}>🔊 Pakinggan ang sentence</button>
      )}
    </div>
  );
}

function Quiz({ deck, recordings }) {
  const [answer, setAnswer] = useState(randomCard(deck.cards));
  const [stars, setStars] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [message, setMessage] = useState("");

  function check(c) {
    if (answered) {
      return;
    }

    if (c.word === answer.word) {
      setMessage("Tama! ⭐");
      setStars(stars + 1);
      setAnswered(true);
    } else {
      setMessage("Mali, subukan ulit!");
    }
  }

  function nextQuestion() {
    setAnswer(randomCard(deck.cards));
    setMessage("");
    setAnswered(false);
  }

  return (
    <div>
      <p>⭐ {stars}</p>
      <h2>Alin ang {answer.word}?</h2>
      <button onClick={() => say(answer.word, recordings)}>🔊 Pakinggan</button>
      <div>
        {deck.cards.map((c) => (
          <button key={c.word} onClick={() => check(c)}><Pic item={c} /></button>
        ))}
      </div>
      <p>{message}</p>
      <button onClick={nextQuestion}>Susunod na tanong</button>
    </div>
  );
}

function Recorder({ deck, recordings, setRecordings }) {
  const [micReady, setMicReady] = useState(false);
  const [error, setError] = useState("");
  const [recordingWord, setRecordingWord] = useState(null);
  const recorderRef = useRef(null);

  async function askMic() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setMicReady(true);
    } catch {
      setError("Naka-block ang mic. Payagan ito sa browser settings, tapos subukan ulit.");
    }
  }

  async function startRecording(word) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: recorder.mimeType });
      const url = URL.createObjectURL(blob);
      setRecordings({ ...recordings, [word]: url });
      stream.getTracks().forEach((t) => t.stop());
      setRecordingWord(null);
    };

    recorder.start();
    recorderRef.current = recorder;
    setRecordingWord(word);
  }

  function stopRecording() {
    recorderRef.current.stop();
  }

  return (
    <div>
      <h2>Para sa magulang 🎙️</h2>
      <p>I-record ang boses mo para sa bawat word.</p>
      {!micReady && <button onClick={askMic}>🎤 Payagan ang mic</button>}
      {micReady && <p>✅ Handa na ang mic!</p>}
      {error && <p>{error}</p>}
      {deck.cards.map((c) => (
        <div key={c.word} className="record-row">
          <span>
            {c.pic} {c.word} {recordings[c.word] && "✅"}
          </span>
          <div>
            {recordingWord === c.word ? (
              <button onClick={stopRecording}>■ Stop</button>
            ) : (
              <button onClick={() => startRecording(c.word)}>● Record</button>
            )}
            {recordings[c.word] && (
              <button onClick={() => new Audio(recordings[c.word]).play()}>▶</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const logoColors = ["#E2483D", "#F2A516", "#2F9E63", "#1F5BC7", "#E2483D", "#F2A516"];

function Jeepney({ deck, onPick }) {
  return (
    <button className="jeep" style={{ "--deck": deck.color }} onClick={() => onPick(deck.id)}>
      <div className="jeep-sign">{deck.title.toUpperCase()}</div>
      <div className="jeep-body">
        <div className="jeep-windows">
          {deck.cards.slice(0, 3).map((c) => (
            <div key={c.word} className="jeep-window">
              <Pic item={c} />
            </div>
          ))}
          <div className="jeep-window jeep-front"></div>
        </div>
        <div className="jeep-stripe"></div>
      </div>
      <div className="jeep-wheels">
        <span></span>
        <span></span>
      </div>
      <div className="jeep-english">{deck.english}</div>
    </button>
  );
}

function Home({ onPick }) {
  return (
    <div>
      <div className="sign">
        <div className="sign-top">BIYAHENG</div>
        <h1 className="logo">
          {"SALITA".split("").map((letter, i) => (
            <span key={i} style={{ color: logoColors[i] }}>
              {letter}
            </span>
          ))}
        </h1>
      </div>
      <p className="tagline">Pumili ng deck!</p>
      <div className="decks">
        {decks.map((deck) => (
          <Jeepney key={deck.id} deck={deck} onPick={onPick} />
        ))}
      </div>
    </div>
  );
}

function Flashcards({ deck, onBack, recordings, setRecordings }) {
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState("aral");
  const card = deck.cards[index];

  function next() {
    if (index === deck.cards.length - 1) {
      setIndex(0);
    } else {
      setIndex(index + 1);
    }
  }

  function previous() {
    if (index === 0) {
      setIndex(deck.cards.length - 1);
    } else {
      setIndex(index - 1);
    }
  }

  return (
    <div>
      <button onClick={onBack}>‹ Back</button>
      <h2>{deck.title}</h2>

      <div className="nav">
        <button onClick={() => setMode("aral")}>📖 Aral</button>
        <button onClick={() => setMode("laro")}>🎮 Laro</button>
        <button onClick={() => setMode("record")}>🎙️ Record</button>
      </div>

      {mode === "aral" && (
        <>
          <Card card={card} recordings={recordings} />
          <div className="nav">
            <button onClick={previous}>‹ Previous</button>
            <button onClick={next}>Next ›</button>
          </div>
        </>
      )}
      {mode === "laro" && <Quiz deck={deck} recordings={recordings} />}
      {mode === "record" && (
        <Recorder deck={deck} recordings={recordings} setRecordings={setRecordings} />
      )}
    </div>
  );
}

function App() {
  const [deckId, setDeckId] = useState(null);
  const [recordings, setRecordings] = useState({});
  const deck = decks.find((d) => d.id === deckId);

  return (
    <div className="app">
      {deck ? (
        <Flashcards
          deck={deck}
          onBack={() => setDeckId(null)}
          recordings={recordings}
          setRecordings={setRecordings}
        />
      ) : (
        <Home onPick={setDeckId} />
      )}
    </div>
  );
}

export default App;