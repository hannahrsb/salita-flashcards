import { useState, useRef, useEffect } from "react";
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
      { word: "Nanay", english: "Mom", pic: "👩", icon: "/icons/nanay.svg" },
      { word: "Tatay", english: "Dad", pic: "👨", icon: "/icons/tatay.svg" },
      { word: "Lola", english: "Grandma", pic: "👵", icon: "/icons/lola.svg" },
      { word: "Lolo", english: "Grandpa", pic: "👴", icon: "/icons/lolo.svg" },
    ],
  },
  {
    id: "pagkain",
    title: "Pagkain",
    english: "Food",
    emoji: "🍚",
    color: "#2F9E63",
    cards: [
      { word: "Kanin", english: "Rice", pic: "🍚", icon: "/icons/kanin.svg" },
      { word: "Saging", english: "Banana", pic: "🍌", icon: "/icons/saging.svg" },
      { word: "Mangga", english: "Mango", pic: "🥭", icon: "/icons/mangga.svg" },
      { word: "Sorbetes", english: "Ice Cream", pic: "🍦", icon: "/icons/sorbetes.svg" },
    ],
  },
  {
    id: "kulay",
    title: "Kulay",
    english: "Colors",
    emoji: "🎨",
    color: "#E89A0C",
    cards: [
      { word: "Pula", english: "Red", pic: "🔴", icon: "/icons/pula.svg" },
      { word: "Asul", english: "Blue", pic: "🔵", icon: "/icons/asul.svg" },
      { word: "Dilaw", english: "Yellow", pic: "🟡", icon: "/icons/dilaw.svg" },
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

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function makeRound(cards) {
  const answer = randomCard(cards);
  const wrong = shuffle(cards.filter((c) => c.word !== answer.word)).slice(0, 2);
  return { answer, choices: shuffle([answer, ...wrong]) };
}

function Pic({ item }) {
  const [broken, setBroken] = useState(false);

  if (item.icon && !broken) {
    return (
      <img
        src={item.icon}
        alt={item.word}
        className="pic-img"
        onError={() => setBroken(true)}
      />
    );
  }
  return item.pic;
}

function Icon({ name }) {
  return <img src={`/icons/${name}.svg`} alt="" className="ui-icon" />;
}

function Card({ card, recordings }) {
  return (
    <div className="card">
      <div className="pic"><Pic key={card.word} item={card} /></div>
      <h1 className="word">{card.word}</h1>
      <p className="english">{card.english}</p>
      <button className="icon-btn" onClick={() => say(card.word, recordings)}>
        <Icon name="pakinggan" /> Pakinggan
      </button>
      {card.example && <p className="example">{card.example}</p>}
      {card.example && (
        <button className="icon-btn" onClick={() => speak(card.example)}>
          <Icon name="pakinggan" /> Pakinggan ang sentence
        </button>
      )}
    </div>
  );
}

function Quiz({ deck, recordings, stars, setStars, learned, setLearned }) {
  const [round, setRound] = useState(() => makeRound(deck.cards));
  const [answered, setAnswered] = useState(false);
  const [message, setMessage] = useState("");
  const answer = round.answer;

  function check(c) {
    if (answered) {
      return;
    }

    if (c.word === answer.word) {
      setMessage("Tama! 🎉");
      setStars(stars + 1);
      setAnswered(true);
      if (!learned.includes(answer.word)) {
        setLearned([...learned, answer.word]);
      }
    } else {
      setMessage("Mali, subukan ulit!");
    }
  }

  function nextQuestion() {
    setRound(makeRound(deck.cards));
    setMessage("");
    setAnswered(false);
  }

  return (
    <div>
      <p className="stars"><Icon name="bituin" /> {stars}</p>
      <h2>Alin ang {answer.word}?</h2>
      <button className="icon-btn" onClick={() => say(answer.word, recordings)}>
        <Icon name="pakinggan" /> Pakinggan
      </button>
      <div>
        {round.choices.map((c) => (
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setRecordings((prev) => ({ ...prev, [word]: reader.result }));
      };
      reader.readAsDataURL(blob);
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

  function deleteRecording(word) {
    setRecordings((prev) => {
      const copy = { ...prev };
      delete copy[word];
      return copy;
    });
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
              <>
                <button onClick={() => new Audio(recordings[c.word]).play()}>▶</button>
                <button onClick={() => deleteRecording(c.word)}>✕</button>
              </>
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

function Road({ learned }) {
  const total = decks.flatMap((d) => d.cards).length;
  const count = learned.length;
  const pct = count / total;
  const left = total - count;

  return (
    <div className="road-wrap">
      <div className="road">
        <div className="road-line"></div>
        <div className="mini-jeep" style={{ left: `calc((100% - 70px) * ${pct})` }}>
          <div className="mini-jeep-body"></div>
          <div className="mini-jeep-wheels">
            <span></span>
            <span></span>
          </div>
        </div>
        <div className="lolas-house">🏡</div>
      </div>
      <p className="road-note">
        {left === 0
          ? "Nakarating ka na kay Lola! 🎉"
          : `${left} salita pa bago makarating kay Lola!`}
      </p>
    </div>
  );
}

function Home({ onPick, stars, learned }) {
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
      <p className="stars"><Icon name="bituin" /> {stars}</p>
      <p className="tagline">Pumili ng deck!</p>
      <div className="decks">
        {decks.map((deck) => (
          <Jeepney key={deck.id} deck={deck} onPick={onPick} />
        ))}
      </div>
    </div>
  );
}

function Flashcards({ deck, onBack, recordings, setRecordings, stars, setStars, learned, setLearned }) {
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
      <button onClick={onBack}>‹ Para po</button>
      <h2>{deck.title}</h2>

      <div className="nav">
        <button className={mode === "aral" ? "icon-btn tab active" : "icon-btn tab"} onClick={() => setMode("aral")}>
          <Icon name="aral" /> Aral
        </button>
        <button className={mode === "laro" ? "icon-btn tab active" : "icon-btn tab"} onClick={() => setMode("laro")}>
          <Icon name="laro" /> Laro
        </button>
        <button className={mode === "record" ? "icon-btn tab active" : "icon-btn tab"} onClick={() => setMode("record")}>
          <Icon name="record" /> Record
        </button>
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
      {mode === "laro" && (
        <Quiz
          deck={deck}
          recordings={recordings}
          stars={stars}
          setStars={setStars}
          learned={learned}
          setLearned={setLearned}
        />
      )}
      {mode === "record" && (
        <Recorder deck={deck} recordings={recordings} setRecordings={setRecordings} />
      )}
    </div>
  );
}

const flagColors = ["#E2483D", "#F2C230", "#1F5BC7", "#2F9E63", "#FFFFFF"];

function Banderitas() {
  return (
    <div className="banderitas" aria-hidden="true">
      {Array.from({ length: 40 }).map((_, i) => (
        <span key={i} style={{ background: flagColors[i % flagColors.length] }}></span>
      ))}
    </div>
  );
}

function App() {
  const [deckId, setDeckId] = useState(null);
  const [recordings, setRecordings] = useState(() => {
    const saved = localStorage.getItem("recordings");
    return saved ? JSON.parse(saved) : {};
  });
  const [stars, setStars] = useState(() => {
    const saved = localStorage.getItem("stars");
    return saved ? JSON.parse(saved) : 0;
  });
  const [learned, setLearned] = useState(() => {
    const saved = localStorage.getItem("learned");
    return saved ? JSON.parse(saved) : [];
  });
  const deck = decks.find((d) => d.id === deckId);

  useEffect(() => {
    localStorage.setItem("stars", JSON.stringify(stars));
  }, [stars]);

  useEffect(() => {
    localStorage.setItem("learned", JSON.stringify(learned));
  }, [learned]);

  useEffect(() => {
    try {
      localStorage.setItem("recordings", JSON.stringify(recordings));
    } catch {
      alert("Puno na ang storage! Burahin muna ang ibang recordings.");
    }
  }, [recordings]);

    return (
    <>
      <Banderitas />
      <div className="app">
        {deck ? (
          <Flashcards
            deck={deck}
            onBack={() => setDeckId(null)}
            recordings={recordings}
            setRecordings={setRecordings}
            stars={stars}
            setStars={setStars}
            learned={learned}
            setLearned={setLearned}
          />
        ) : (
          <Home onPick={setDeckId} stars={stars} learned={learned} />
        )}
      </div>
    </>
  );
}

export default App;