import React, { useState, useEffect } from 'react';

interface SentenceData {
  sentence: string;          // The sentence with the blank
  translation: string;       // The English translation of the sentence with the blank
  missingWord: string;       // The correct missing word in German
  missingWordTranslation: string; // The translation of the correct missing word in English
  options: string[];         // The options for the user to select
}

const SentenceGame: React.FC = () => {
  const [sentenceData, setSentenceData] = useState<SentenceData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);

  // Fetch the questions from the questions.txt file
  useEffect(() => {
    const fetchQuestions = async () => {
      const response = await fetch('/questions.txt');
      const text = await response.text();

      const parsedQuestions = text
        .split('\n\n')
        .map(block => {
          const lines = block.split('\n').filter(line => line.trim());
          const [sentence, translation, missingWord, missingWordTranslation, optionsString] = lines;
          return {
            sentence,
            translation,
            missingWord,
            missingWordTranslation,  // Include the English translation of the missing word
            options: optionsString.split(',').map(option => option.trim()),
          };
        });

      setSentenceData(parsedQuestions);
    };

    fetchQuestions();
  }, []);

  if (sentenceData.length === 0) {
    return <div>Loading...</div>;
  }

  const currentSentence = sentenceData[currentIndex];

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    if (option === currentSentence.missingWord) {
      setIsCorrect(true);
      setScore(score + 1);
    } else {
      setIsCorrect(false);
    }
  };

  const handleNextClick = () => {
    setSelectedOption(null);
    setIsCorrect(null);
    setShowTranslation(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % sentenceData.length);
  };

  const handleShowTranslation = () => {
    setShowTranslation(true);
  };

  // Get the translation depending on whether the user answered or not
  const getTranslation = () => {
    if (selectedOption) {
      // Return the translation with the correct answer filled in
      return currentSentence.translation.replace('___', currentSentence.missingWordTranslation);
    } else {
      // Return the translation with the blank still in place
      return currentSentence.translation;
    }
  };

  return (
    <div className="sentence-game">
      <h1>Fill in the Blank Vocabulary Quiz</h1>
      <p><strong>Score:</strong> {score}/{sentenceData.length}</p>

      <div className="question-section">
        <h2>{currentSentence.sentence.replace('___', '___')}</h2>

        <div className="options">
          {currentSentence.options.map((option) => (
            <button
              key={option}
              onClick={() => handleOptionClick(option)}
              className={`option-button ${selectedOption !== null
                ? option === currentSentence.missingWord
                  ? 'correct'
                  : option === selectedOption
                    ? 'incorrect'
                    : ''
                : ''}`}
              disabled={selectedOption !== null}
            >
              {option}
            </button>
          ))}
        </div>

        {selectedOption && (
          <div className="feedback">
            {isCorrect ? <p className="feedback-message correct">Correct!</p> : <p className="feedback-message incorrect">Wrong!</p>}
            <button onClick={handleNextClick} className="next-button">
              Next Question
            </button>
          </div>
        )}

        <div>
          <button onClick={handleShowTranslation} className="show-translation-button">
            Show Translation
          </button>
          {showTranslation && <p className="translation">{getTranslation()}</p>}
        </div>
      </div>
    </div>
  );
};

export default SentenceGame;
