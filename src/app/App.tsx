import { Wordle } from "../components/wordle";
import { allwordsMap } from "../dictionaries/allwords";
import { wordsMap } from "../dictionaries/words";
import "./App.css";
import { globalStyles } from "./styleOverrides";

function App() {
  return (
    <>
      {globalStyles}
      <Wordle wordsMap={wordsMap} allwordsMap={allwordsMap}></Wordle>
    </>
  );
}

export default App;
