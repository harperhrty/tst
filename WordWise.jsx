import { useState, useEffect } from 'react';
import { Book, Mic, BookOpen, Award, Settings, Home, Moon, Sun, ListChecks, FileText, Trophy, Brain, MessageSquare, Zap, Palette, Users, BarChart3, Sparkles, Loader2, HelpCircle, MessageCircleMore, ShieldCheck, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

// Helper component for a nicer toggle switch
const ToggleSwitch = ({ id, checked, onChange, label, darkMode }) => (
  <label htmlFor={id} className="flex items-center cursor-pointer">
    <div className="relative">
      <input id={id} type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <div className={`block w-12 h-7 rounded-full transition-colors ${checked ? 'bg-teal-500' : (darkMode ? 'bg-gray-600' : 'bg-gray-300')}`}></div>
      <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${checked ? 'transform translate-x-5' : ''}`}></div>
    </div>
    {label && <span className={`ml-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>}
  </label>
);

// Loading Spinner Component
const LoadingSpinner = ({ size = 20, color = "text-teal-500" }) => (
  <Loader2 size={size} className={`animate-spin ${color}`} />
);

// Accordion Item Component for better space management
const AccordionItem = ({ title, children, icon: Icon, darkMode, initiallyOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  return (
    <div className={`rounded-lg shadow-sm overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3 text-left font-semibold transition-colors ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'}`}
      >
        <div className="flex items-center">
          {Icon && <Icon className={`w-5 h-5 mr-2 text-teal-500`} />}
          {title}
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div className={`p-3 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          {children}
        </div>
      )}
    </div>
  );
};


export default function EnglishLearningApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [darkMode, setDarkMode] = useState(false);
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0); // Use index for lessons array
  const [userAnswers, setUserAnswers] = useState({});
  const [showQuizScore, setShowQuizScore] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // State for Gemini API features
  const [generatedVocabExamples, setGeneratedVocabExamples] = useState({});
  const [loadingVocabExample, setLoadingVocabExample] = useState(null);
  const [generatedSummaries, setGeneratedSummaries] = useState({});
  const [loadingSummary, setLoadingSummary] = useState(null);
  const [generatedGrammarExamples, setGeneratedGrammarExamples] = useState({});
  const [loadingGrammarExamples, setLoadingGrammarExamples] = useState(null);
  const [generatedLessonExplanation, setGeneratedLessonExplanation] = useState({});
  const [loadingLessonExplanation, setLoadingLessonExplanation] = useState(null);
  const [generatedConversationStarter, setGeneratedConversationStarter] = useState('');
  const [loadingConversationStarter, setLoadingConversationStarter] = useState(false);
  const [apiError, setApiError] = useState(null);

  const colors = {
    primary: 'teal',
    secondary: 'pink',
    accent: 'amber',
    bgLight: 'gray-50',
    bgDark: 'gray-900',
    textLight: 'gray-800',
    textDark: 'gray-100',
    cardLight: 'white',
    cardDark: 'gray-800',
    borderLight: 'gray-200',
    borderDark: 'gray-700',
  };

  const vocabularyList = [
    { id: 'V1', word: 'Ambitious', definition: 'Having a strong desire and determination to succeed.', example: 'She is ambitious about her career goals.', category: 'Adjective' },
    { id: 'V2', word: 'Benevolent', definition: 'Well-meaning and kindly.', example: 'His benevolent actions helped many people in need.', category: 'Adjective' },
    { id: 'V3', word: 'Diligent', definition: 'Having or showing care and conscientiousness in work.', example: 'The diligent student always completed assignments early.', category: 'Adjective' },
    // Add more for variety if needed, but keep initial display concise
  ];

  const lessons = [
    { id: 'L1', title: 'Greetings & Intro', level: 'Beginner', duration: '10 min', content: "Learn 'Hello', 'Goodbye', 'My name is...', 'How are you?'.", coreConcept: "Basic greetings and self-introductions."},
    { id: 'L2', title: 'Simple Chat', level: 'Beginner', duration: '15 min', content: "Ask/give personal info, talk likes/dislikes, order food.", coreConcept: "Engaging in simple everyday conversations." },
    { id: 'L3', title: 'Present Simple', level: 'Beginner', duration: '15 min', content: "For habits, routines, facts. E.g., 'I eat breakfast at 8 AM.'", coreConcept: "Using the Present Simple tense." },
    { id: 'L4', title: 'Asking Questions', level: 'Intermediate', duration: '20 min', content: "Form yes/no & wh-questions. Use 'do', 'is', 'are'.", coreConcept: "Forming various types of questions." },
    { id: 'L5', title: 'Story Time (Past)', level: 'Intermediate', duration: '20 min', content: "Use past simple for stories. Regular/irregular verbs.", coreConcept: "Using the Past Simple tense for narration." },
  ];
  
  const [lessonProgress, setLessonProgress] = useState(lessons.reduce((acc, lesson) => ({ ...acc, [lesson.id]: Math.random() > 0.5 ? (Math.random() > 0.7 ? 100 : Math.floor(Math.random()*70)+10) : 0 }), {}));


  const quizQuestions = [
    { id: 'Q1', question: 'Word for understanding written text?', options: ['Write', 'Speak', 'Read', 'Listen'], answer: 'Read' },
    { id: 'Q2', question: 'Not a part of speech?', options: ['Noun', 'Adjective', 'Conversation', 'Verb'], answer: 'Conversation' },
    { id: 'Q3', question: 'Past tense of "go"?', options: ['Goed', 'Gone', 'Went', 'Going'], answer: 'Went' },
  ];

  const grammarTopics = [
    { id: 'G1', title: 'Nouns', icon: Brain, description: 'Person, place, thing, idea.', details: 'E.g., cat, city. Types: common, proper.' },
    { id: 'G2', title: 'Verbs', icon: Zap, description: 'Action or state.', details: 'E.g., run, is. Tenses: past, present, future.' },
    { id: 'G3', title: 'Adjectives', icon: Palette, description: 'Describe nouns.', details: 'E.g., beautiful, tall. Comparative forms.' },
  ];

  const readingPassages = [
    { id: 'R1', title: 'My Day', level: 'Beginner', content: "Alex wakes at 7 AM, has breakfast, then school. Loves learning!", questions: [{q: "What time does Alex wake up?", a: "7 AM"}] },
    { id: 'R2', title: 'Zoo Trip', level: 'Intermediate', content: "Sarah visited the zoo, saw lions, elephants, playful monkeys. Great day!", questions: [{q: "What animals were playful?", a: "Monkeys"}] },
  ];

  const achievementsList = [
    { id: 'A1', name: 'First Steps', icon: Award, description: 'Completed 1st lesson!', unlocked: true },
    { id: 'A2', name: 'Vocab Starter', icon: BookOpen, description: 'Learned 10 words.', unlocked: true },
    { id: 'A3', name: 'Quiz Whiz', icon: Trophy, description: 'Aced a quiz!', unlocked: false },
    { id: 'A4', name: 'Streak Keeper', icon: Zap, description: '3-Day Streak!', unlocked: true },
  ];
  
  const [userAchievements, setUserAchievements] = useState(achievementsList);

  // New: League and Competition Data
  const [leaderboardData, setLeaderboardData] = useState([
    { id: 'U1', name: 'LinguaLeo', score: 2580, rank: 1, avatarSeed: 'Leo' },
    { id: 'U2', name: 'PolyglotPriya', score: 2450, rank: 2, avatarSeed: 'Priya' },
    { id: 'U3', name: 'WordWizard 높은 뜻', score: 2300, rank: 3, avatarSeed: 'Wizard' }, // Example with non-latin characters
    { id: 'U4', name: 'You', score: 1850, rank: 4, avatarSeed: 'You', isCurrentUser: true }, // Current user
    { id: 'U5', name: 'GrammarGus', score: 1700, rank: 5, avatarSeed: 'Gus' },
    { id: 'U6', name: 'FluentFiona', score: 1550, rank: 6, avatarSeed: 'Fiona' },
  ].sort((a,b) => b.score - a.score).map((user, index) => ({...user, rank: index + 1})));
  // Ensure 'You' is correctly ranked after sort
  useEffect(() => {
    setLeaderboardData(prev => {
        const sorted = prev.sort((a,b) => b.score - a.score);
        return sorted.map((user, index) => ({...user, rank: index + 1}));
    });
  }, []);


  // --- Gemini API Call Functions (simplified for brevity in this view, assume they work as before) ---
  const callGeminiAPI = async (prompt) => {
    setApiError(null);
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
    try {
      const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error?.message || response.statusText); }
      const result = await response.json();
      if (result.candidates?.[0]?.content?.parts?.[0]?.text) return result.candidates[0].content.parts[0].text;
      throw new Error("Invalid API response structure.");
    } catch (error) {
      console.error("Gemini API Error:", error);
      setApiError(`API Error: ${error.message}`);
      return null;
    }
  };

  const generateNewVocabExample = async (vocabItem) => { setLoadingVocabExample(vocabItem.id); const prompt = `Short, clear example for "${vocabItem.word}" (means: ${vocabItem.definition}) for English learners.`; const ex = await callGeminiAPI(prompt); if (ex) setGeneratedVocabExamples(p => ({ ...p, [vocabItem.id]: ex })); setLoadingVocabExample(null); };
  const summarizePassage = async (passage) => { setLoadingSummary(passage.id); const prompt = `Summarize in 1-2 short sentences for learners: "${passage.content}"`; const sum = await callGeminiAPI(prompt); if (sum) setGeneratedSummaries(p => ({ ...p, [passage.id]: sum })); setLoadingSummary(null); };
  const generateMoreGrammarExamples = async (topic) => { setLoadingGrammarExamples(topic.id); const prompt = `2-3 simple examples for grammar topic "${topic.title}" (about: ${topic.description}) for learners.`; const exs = await callGeminiAPI(prompt); if (exs) setGeneratedGrammarExamples(p => ({ ...p, [topic.id]: exs.split('\n').map(e=>e.trim()).filter(Boolean) })); setLoadingGrammarExamples(null); };
  const explainLessonTopicDifferently = async (lesson) => { setLoadingLessonExplanation(lesson.id); const prompt = `Explain "${lesson.coreConcept}" (lesson: "${lesson.title}") simply for learners. Original: "${lesson.content}"`; const expl = await callGeminiAPI(prompt); if (expl) setGeneratedLessonExplanation(p => ({ ...p, [lesson.id]: expl })); setLoadingLessonExplanation(null); };
  const suggestConversationTopic = async () => { setLoadingConversationStarter(true); const prompt = "Simple, engaging conversation starter/question for English learners."; const top = await callGeminiAPI(prompt); if (top) setGeneratedConversationStarter(top); setLoadingConversationStarter(false); };

  const handleQuizOptionSelect = (questionId, option) => { setUserAnswers(prev => ({ ...prev, [questionId]: option })); setShowQuizScore(false); };
  const checkQuizAnswers = () => { let score = 0; quizQuestions.forEach(q => { if (userAnswers[q.id] === q.answer) score++; }); setQuizScore(score); setShowQuizScore(true); };
  const resetQuiz = () => { setUserAnswers({}); setShowQuizScore(false); setQuizScore(0); };
  const completeLessonPart = (lessonId) => { setLessonProgress(prev => ({ ...prev, [lessonId]: Math.min((prev[lessonId] || 0) + 25, 100) })); /* Achievement logic can be added here */ };

  const appBg = darkMode ? colors.bgDark : 'bg-gradient-to-br from-teal-50 to-cyan-100'; // Light mode gradient
  const textColor = darkMode ? colors.textDark : colors.textLight;
  const cardBg = darkMode ? colors.cardDark : colors.cardLight;
  const borderColor = darkMode ? colors.borderDark : colors.borderLight;
  const headerBg = darkMode ? 'bg-gray-800 shadow-md' : 'bg-white/80 backdrop-blur-md shadow-sm';
  const navBg = darkMode ? 'bg-gray-800 border-t border-gray-700' : 'bg-white/90 backdrop-blur-md border-t border-gray-200';

  const NavButton = ({ tabName, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex flex-col items-center justify-center p-2 rounded-lg w-1/5 transition-all duration-200 ease-in-out transform hover:scale-110 focus:outline-none ${
        activeTab === tabName ? `text-${colors.primary}-500 scale-110` : (darkMode ? 'text-gray-400 hover:text-teal-400' : 'text-gray-500 hover:text-teal-600')
      }`}
    >
      <Icon size={22} strokeWidth={activeTab === tabName ? 2.5 : 2} />
      <span className={`text-[10px] mt-0.5 font-medium ${activeTab === tabName ? `text-${colors.primary}-600 dark:text-${colors.primary}-400` : (darkMode ? 'text-gray-400' : 'text-gray-500')}`}>{label}</span>
    </button>
  );

  const SectionCard = ({ title, children, icon: Icon, className = '', titleClassName='' }) => (
    <div className={`rounded-xl shadow-lg ${cardBg} ${className} transition-all duration-300 hover:shadow-xl`}>
      {title && (
        <div className={`flex items-center p-4 border-b ${borderColor} ${titleClassName}`}>
          {Icon && <Icon className={`w-5 h-5 mr-2.5 text-${colors.primary}-500`} />}
          <h2 className={`text-lg font-bold text-${colors.primary}-600 ${darkMode ? `dark:text-${colors.primary}-400` : ''}`}>{title}</h2>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
  
  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode); }, [darkMode]);

  const currentLessonData = lessons[currentLessonIdx];

  return (
    <div className={`min-h-screen flex flex-col font-sans ${appBg} ${textColor} transition-colors duration-300 text-sm sm:text-base`}>
      <header className={`py-3 px-4 flex justify-between items-center sticky top-0 z-50 ${headerBg} transition-colors duration-300`}>
        <div className="flex items-center space-x-2">
          <BookOpen className={`h-7 w-7 text-${colors.primary}-500`} />
          <h1 className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-${colors.primary}-500 to-${colors.secondary}-500`}>LinguaLearn</h1>
        </div>
        <ToggleSwitch id="darkModeToggleHeader" checked={darkMode} onChange={() => setDarkMode(!darkMode)} darkMode={darkMode} />
      </header>

      <main className="flex-grow px-3 py-4 overflow-y-auto space-y-5">
        {apiError && ( <div className={`p-3 mb-3 text-xs text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800`} role="alert"> <span className="font-medium">Error!</span> {apiError} </div> )}

        {activeTab === 'home' && (
          <div className="space-y-5">
            <SectionCard title="Continue Your Journey" icon={Zap} className={`bg-gradient-to-r from-${colors.primary}-500 to-${colors.teal}-600 text-white`} titleClassName="border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-md">{currentLessonData.title}</h3>
                  <p className="text-xs opacity-90"> {currentLessonData.level} • {currentLessonData.duration} </p>
                </div>
                <button onClick={() => { setActiveTab('lessons'); }} className={`px-3 py-1.5 text-xs bg-${colors.accent}-500 text-white rounded-md shadow-md hover:bg-${colors.accent}-600 transition-transform transform hover:scale-105`}> Go to Lesson </button>
              </div>
              <div className="mt-2 w-full h-2 bg-white/30 rounded-full overflow-hidden">
                <div className={`bg-${colors.accent}-400 h-full rounded-full transition-all duration-500 ease-out`} style={{ width: `${lessonProgress[currentLessonData.id] || 0}%` }}></div>
              </div>
              <p className="text-[10px] text-right mt-0.5 opacity-80">{lessonProgress[currentLessonData.id] || 0}% done</p>
            </SectionCard>

            <SectionCard title="Daily Vocab" icon={Sparkles}>
                {vocabularyList.slice(0,1).map((item) => ( // Show only one for brevity on home
                  <div key={item.id} className={`p-3 rounded-lg ${darkMode ? `bg-gray-700` : `bg-teal-50`} border-l-4 border-${colors.primary}-400`}>
                    <h4 className="font-bold text-md">{item.word} <span className={`text-[10px] font-normal px-1.5 py-0.5 rounded-full ml-1 ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-teal-100 text-teal-700'}`}>{item.category}</span></h4>
                    <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.definition}</p>
                    <p className={`mt-1 text-xs italic ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>E.g.: "{generatedVocabExamples[item.id] || item.example}"</p>
                    <button onClick={() => generateNewVocabExample(item)} disabled={loadingVocabExample === item.id} className={`mt-2 w-full flex items-center justify-center text-[10px] py-1 px-2 bg-gradient-to-r from-${colors.accent}-400 to-${colors.amber}-500 text-white rounded-md shadow-sm hover:opacity-90 disabled:opacity-60`}>
                        {loadingVocabExample === item.id ? <LoadingSpinner size={14} color="text-white"/> : <Sparkles size={12} className="mr-1" />}
                        {loadingVocabExample === item.id ? 'Generating...' : 'New Example'}
                    </button>
                  </div>
                ))}
                 <button onClick={() => setActiveTab('practice')} className={`mt-3 w-full text-xs py-1.5 bg-gradient-to-r from-${colors.primary}-500 to-${colors.secondary}-500 text-white rounded-lg shadow hover:opacity-90`}> More Vocab & Quizzes </button>
            </SectionCard>
            
            <SectionCard title="Your Stats" icon={BarChart3}>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div> <p className={`text-xl font-bold text-${colors.primary}-500`}>7</p> <p className={`text-[10px] ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Day Streak</p> </div>
                <div> <p className={`text-xl font-bold text-${colors.secondary}-500`}>{Object.values(lessonProgress).filter(p => p === 100).length}</p> <p className={`text-[10px] ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Done</p> </div>
                <div> <p className={`text-xl font-bold text-${colors.accent}-500`}>38</p> <p className={`text-[10px] ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Words</p> </div>
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === 'lessons' && (
          <SectionCard title="All Lessons" icon={ListChecks}>
            <div className="space-y-2.5">
              {lessons.map((lesson, index) => (
                <div key={lesson.id} className={`p-3 rounded-lg shadow-sm border ${borderColor} transition-all duration-300 ${index === currentLessonIdx ? (darkMode ? `bg-${colors.primary}-700 border-${colors.primary}-600` : `bg-${colors.primary}-50 border-${colors.primary}-300`) : (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50')}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <h3 className={`font-semibold text-md ${index === currentLessonIdx && !darkMode ? `text-${colors.primary}-700` : ''}`}>{lesson.title}</h3>
                      <p className={`text-xs ${darkMode ? (index === currentLessonIdx ? 'text-gray-200' : 'text-gray-300') : (index === currentLessonIdx ? `text-${colors.primary}-600` : 'text-gray-600')}`}> {lesson.level} • {lesson.duration} </p>
                    </div>
                    <button className={`px-3 py-1 text-[10px] rounded-md shadow-sm transition-colors flex-shrink-0 ${ index === currentLessonIdx ? `bg-${colors.primary}-500 text-white hover:bg-${colors.primary}-600` : (darkMode ? `bg-gray-600 text-gray-200 hover:bg-gray-500` : `bg-gray-100 text-gray-700 hover:bg-gray-200`) }`}
                      onClick={() => { setCurrentLessonIdx(index); if (index !== currentLessonIdx || (lessonProgress[lesson.id] || 0) === 0) { completeLessonPart(lesson.id); } }} >
                      {lessonProgress[lesson.id] === 100 ? 'Review' : (index === currentLessonIdx ? (lessonProgress[lesson.id] > 0 ? 'Continue' : 'Start') : 'Start')}
                    </button>
                  </div>
                  {index === currentLessonIdx && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{lesson.content}</p>
                        <div className="mt-2 w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div className={`bg-${colors.primary}-500 h-full rounded-full`} style={{ width: `${lessonProgress[lesson.id] || 0}%` }}></div>
                        </div>
                        <p className="text-[10px] text-right mt-0.5">{lessonProgress[lesson.id] || 0}% done</p>
                        <button onClick={() => explainLessonTopicDifferently(lesson)} disabled={loadingLessonExplanation === lesson.id} className={`mt-2.5 w-full flex items-center justify-center text-[10px] py-1 px-2 bg-gradient-to-r from-${colors.accent}-400 to-${colors.amber}-500 text-white rounded-md shadow-sm hover:opacity-90 disabled:opacity-60`}>
                            {loadingLessonExplanation === lesson.id ? <LoadingSpinner size={14} color="text-white"/> : <HelpCircle size={12} className="mr-1" />}
                            {loadingLessonExplanation === lesson.id ? 'Explaining...' : 'Explain Differently'}
                        </button>
                        {generatedLessonExplanation[lesson.id] && ( <div className={`mt-2 p-2 rounded-md text-xs ${darkMode ? 'bg-gray-600' : 'bg-amber-50'} border-l-2 border-amber-400`}> <h4 className="font-semibold text-[10px] text-amber-700 dark:text-amber-300">Alternative Explanation:</h4> <p className={`italic ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{generatedLessonExplanation[lesson.id]}</p> </div> )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {activeTab === 'practice' && (
          <div className="space-y-4">
            <AccordionItem title="Vocabulary Quiz" icon={Brain} darkMode={darkMode} initiallyOpen={true}>
              {!showQuizScore ? (
                <div className="space-y-3">
                  {quizQuestions.map((quiz) => (
                    <div key={quiz.id} className={`p-2.5 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-gray-100'} border-l-4 border-${colors.secondary}-400`}>
                      <p className="font-medium text-xs mb-1.5">{quiz.question}</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {quiz.options.map((option, optIndex) => (
                          <button key={optIndex} onClick={() => handleQuizOptionSelect(quiz.id, option)}
                            className={`p-2 rounded-md text-xs text-left transition-all w-full ${ userAnswers[quiz.id] === option ? `bg-${colors.primary}-500 text-white ring-1 ring-${colors.primary}-300` : (darkMode ? `bg-gray-500 hover:bg-gray-400 text-gray-100` : `bg-white hover:bg-gray-50 text-gray-700 border ${borderColor}`) }`}> {option} </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={checkQuizAnswers} className={`w-full mt-2 py-2 text-xs bg-gradient-to-r from-${colors.primary}-500 to-${colors.secondary}-500 text-white rounded-lg shadow hover:opacity-90 font-semibold`}> Check Answers </button>
                </div>
              ) : (
                 <div className="text-center p-2">
                    <h3 className="text-md font-semibold mb-1.5">Quiz Results!</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>You scored <span className={`font-bold text-${colors.primary}-500`}>{quizScore}</span> / {quizQuestions.length}.</p>
                    {quizScore === quizQuestions.length && <p className="mt-1 text-xs text-green-500">Perfect score!</p>}
                    <div className="mt-3 space-y-1.5 text-xs">
                        {quizQuestions.map(q => ( <div key={q.id} className={`p-1.5 rounded-md text-left ${darkMode ? 'bg-gray-600' : 'bg-gray-100'} ${userAnswers[q.id] === q.answer ? 'border-l-2 border-green-500' : 'border-l-2 border-red-500'}`}> <p className="font-medium">{q.question}</p> <p className={`${userAnswers[q.id] === q.answer ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}> Your: {userAnswers[q.id] || "N/A"} {userAnswers[q.id] !== q.answer && `(Ans: ${q.answer})`} </p> </div> ))}
                    </div>
                    <button onClick={resetQuiz} className={`mt-3 py-1.5 px-4 text-xs bg-${colors.accent}-500 text-white rounded-lg shadow hover:bg-${colors.accent}-600`}> Try Again </button>
                 </div>
              )}
            </AccordionItem>

            <AccordionItem title="Conversation Cafe" icon={MessageCircleMore} darkMode={darkMode}>
                <div className="flex flex-col items-center space-y-2 p-2">
                    <button onClick={suggestConversationTopic} disabled={loadingConversationStarter} className={`w-full flex items-center justify-center text-sm py-2 px-4 bg-gradient-to-r from-${colors.primary}-400 to-${colors.secondary}-400 text-white rounded-lg shadow hover:opacity-90 disabled:opacity-60`}>
                        {loadingConversationStarter ? <LoadingSpinner size={18} color="text-white"/> : <Sparkles size={16} className="mr-1.5" />}
                        {loadingConversationStarter ? 'Thinking...' : 'Suggest Topic'}
                    </button>
                    {generatedConversationStarter && ( <div className={`mt-2 p-2.5 rounded-lg w-full text-center text-xs ${darkMode ? 'bg-gray-600' : 'bg-teal-50'} border-l-4 border-teal-400`}> <p className={`italic ${darkMode ? 'text-gray-200' : 'text-teal-800'}`}>{generatedConversationStarter}</p> </div> )}
                </div>
            </AccordionItem>

            <AccordionItem title="Speaking Practice (Illustrative)" icon={Mic} darkMode={darkMode}>
              <div className="flex flex-col items-center space-y-2 p-2">
                <button className={`p-3 rounded-full transition-all transform hover:scale-110 ${darkMode ? `bg-gray-600 hover:bg-gray-500` : `bg-${colors.primary}-100 hover:bg-${colors.primary}-200`}`}>
                  <Mic size={28} className={`text-${colors.primary}-500`} />
                </button>
                <p className={`text-center text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}> Tap & say: <span className={`font-semibold text-${colors.primary}-600 dark:text-${colors.primary}-400`}>"Hello World!"</span> </p>
              </div>
            </AccordionItem>
          </div>
        )}
        
        {activeTab === 'league' && (
            <SectionCard title="Leaderboard" icon={TrendingUp}>
                <div className="space-y-2">
                    {leaderboardData.map((user, index) => (
                        <div key={user.id} className={`flex items-center justify-between p-2.5 rounded-lg shadow-sm transition-all duration-200
                            ${user.isCurrentUser ? (darkMode ? 'bg-amber-600 text-white' : 'bg-amber-100 border-amber-400 border-2') : (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50 border border-gray-200')} `}
                        >
                            <div className="flex items-center">
                                <span className={`font-bold w-6 text-center text-xs mr-2 ${user.isCurrentUser ? '' : (darkMode ? 'text-gray-400' : 'text-gray-500')}`}>{user.rank}.</span>
                                <img 
                                    src={`https://source.boringavatars.com/beam/30/${user.avatarSeed}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`} 
                                    alt={`${user.name} avatar`} 
                                    className="w-7 h-7 rounded-full mr-2.5 border-2 border-white/50"
                                    onError={(e) => e.target.src = `https://placehold.co/30x30/silver/white?text=${user.name.substring(0,1)}`}
                                />
                                <span className={`font-medium text-sm truncate max-w-[150px] sm:max-w-xs ${user.isCurrentUser ? 'font-bold' : ''}`}>{user.name}</span>
                            </div>
                            <span className={`font-bold text-sm ${user.isCurrentUser ? '' : `text-${colors.primary}-500`}`}>{user.score.toLocaleString()} pts</span>
                        </div>
                    ))}
                </div>
            </SectionCard>
        )}


        {activeTab === 'grammar' && ( <SectionCard title="Grammar Guide" icon={Brain}> <div className="space-y-3"> {grammarTopics.map((topic) => ( <AccordionItem key={topic.id} title={topic.title} icon={topic.icon} darkMode={darkMode}> <p className={`text-xs mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{topic.description}</p> <p className={`text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{topic.details}</p> <button onClick={() => generateMoreGrammarExamples(topic)} disabled={loadingGrammarExamples === topic.id} className={`mt-2 w-full flex items-center justify-center text-[10px] py-1 px-2 bg-gradient-to-r from-${colors.accent}-400 to-${colors.amber}-500 text-white rounded-md shadow-sm hover:opacity-90 disabled:opacity-60`}> {loadingGrammarExamples === topic.id ? <LoadingSpinner size={14} color="text-white"/> : <Sparkles size={12} className="mr-1" />} {loadingGrammarExamples === topic.id ? 'Generating...' : 'More Examples'} </button> {generatedGrammarExamples[topic.id] && ( <div className="mt-2 space-y-0.5 pl-1.5 border-l-2 border-teal-300 text-xs"> {generatedGrammarExamples[topic.id].map((ex, i) => ( <p key={i} className={`italic ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>- {ex}</p> ))} </div> )} </AccordionItem> ))} </div> </SectionCard> )}
        {activeTab === 'reading' && ( <SectionCard title="Reading Corner" icon={FileText}> <div className="space-y-3"> {readingPassages.map((passage) => ( <AccordionItem key={passage.id} title={passage.title} darkMode={darkMode} icon={passage.level === 'Beginner' ? Zap : Palette /* Just for visual variety */}> <p className={`text-xs leading-relaxed mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{passage.content}</p> <button onClick={() => summarizePassage(passage)} disabled={loadingSummary === passage.id} className={`mt-2 w-full flex items-center justify-center text-[10px] py-1 px-2 bg-gradient-to-r from-${colors.primary}-400 to-${colors.secondary}-400 text-white rounded-md shadow-sm hover:opacity-90 disabled:opacity-60`}> {loadingSummary === passage.id ? <LoadingSpinner size={14} color="text-white"/> : <Sparkles size={12} className="mr-1" />} {loadingSummary === passage.id ? 'Summarizing...' : 'Summarize'} </button> {generatedSummaries[passage.id] && ( <div className={`mt-2 p-1.5 rounded-md text-xs ${darkMode ? 'bg-gray-600' : 'bg-teal-50'} border-l-2 border-teal-400`}> <h4 className="font-semibold text-[10px] text-teal-700 dark:text-teal-300">Summary:</h4> <p className={`italic ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{generatedSummaries[passage.id]}</p> </div> )} </AccordionItem> ))} </div> </SectionCard> )}
        {activeTab === 'achievements' && ( <SectionCard title="Your Achievements" icon={Trophy}> <div className="grid grid-cols-2 gap-2.5"> {userAchievements.map((ach) => ( <div key={ach.id} className={`p-2.5 rounded-lg shadow-sm flex items-center space-x-2 transition-all ${ach.unlocked ? (darkMode ? `bg-gradient-to-br from-${colors.primary}-700 to-${colors.accent}-700` : `bg-gradient-to-br from-${colors.primary}-100 to-${colors.accent}-100`) : (darkMode ? 'bg-gray-700 opacity-70' : 'bg-gray-100 opacity-70')}`}> <div className={`p-1.5 rounded-full ${ach.unlocked ? (darkMode ? `bg-${colors.accent}-500` : `bg-${colors.accent}-400`) : (darkMode ? 'bg-gray-600' : 'bg-gray-300')}`}> <ach.icon size={20} className={ach.unlocked ? 'text-white' : (darkMode ? 'text-gray-400' : 'text-gray-500')} /> </div> <div> <h4 className={`font-semibold text-xs ${ach.unlocked ? (darkMode ? 'text-white' : `text-${colors.primary}-700`) : (darkMode ? 'text-gray-300' : 'text-gray-600')}`}>{ach.name}</h4> <p className={`text-[10px] ${ach.unlocked ? (darkMode ? 'text-gray-200' : 'text-gray-600') : (darkMode ? 'text-gray-400' : 'text-gray-500')}`}>{ach.description}</p> </div> </div> ))} </div> </SectionCard> )}
        {activeTab === 'settings' && ( <SectionCard title="Profile & Settings" icon={Settings}> <div className="flex flex-col items-center mb-4"> <img src={`https://source.boringavatars.com/beam/60/JohnDoe?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`} alt="User Avatar" className="w-16 h-16 rounded-full mb-2 shadow-md" onError={(e) => e.target.src = `https://placehold.co/60x60/silver/white?text=JD`} /> <h2 className="text-lg font-bold">John Doe</h2> <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Beginner Level</p> </div> <div className="space-y-3"> <h3 className="text-sm font-semibold border-b pb-1 border-gray-300 dark:border-gray-600">App Settings</h3> <div className="flex justify-between items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"> <span className="font-medium text-xs">Dark Mode</span> <ToggleSwitch id="darkModeToggle" checked={darkMode} onChange={() => setDarkMode(!darkMode)} darkMode={darkMode} /> </div> <div className="flex justify-between items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"> <span className="font-medium text-xs">Daily Reminder</span> <ToggleSwitch id="reminderToggle" checked={true} onChange={() => {}} darkMode={darkMode} /> </div> <div className="flex justify-between items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"> <span className="font-medium text-xs">Sound Effects</span> <ToggleSwitch id="soundToggle" checked={false} onChange={() => {}} darkMode={darkMode} /> </div> <button className={`w-full mt-4 py-1.5 text-xs bg-${colors.secondary}-500 text-white rounded-lg shadow hover:bg-${colors.secondary}-600`}> Log Out </button> </div> </SectionCard> )}
      </main>

      <nav className={`px-1 py-1.5 flex justify-around shadow-top sticky bottom-0 z-50 ${navBg} transition-colors duration-300`}>
        <NavButton tabName="home" icon={Home} label="Home" />
        <NavButton tabName="lessons" icon={ListChecks} label="Lessons" />
        <NavButton tabName="practice" icon={Mic} label="Practice" />
        <NavButton tabName="league" icon={TrendingUp} label="League" /> 
        {/* <NavButton tabName="grammar" icon={Brain} label="Grammar" /> */}
        {/* <NavButton tabName="reading" icon={FileText} label="Reading" /> */}
        <NavButton tabName="achievements" icon={Trophy} label="Awards" />
        {/* <NavButton tabName="settings" icon={Settings} label="Profile" /> */}
      </nav>
    </div>
  );
}
