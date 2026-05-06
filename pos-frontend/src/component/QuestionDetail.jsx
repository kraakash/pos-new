import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';

const API_BASE_URL = 'http://localhost:5001/api/questions'; // Make sure port matches
const CODE_API_URL = 'http://localhost:5001/api/code/run';

export default function QuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('problem');
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [consoleTab, setConsoleTab] = useState('testcases');
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [runError, setRunError] = useState('');

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        const data = await response.json();
        setQuestion(data.data);
      } catch {
        console.error("Failed to load question");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [id]);

  const getActiveInput = () => {
    return question?.examples?.[activeTestCase]?.input || '';
  };

  // ==========================================
  // FUNCTION: handleRunCode
  // ==========================================
  // Yeh function tab call hota hai jab user "Run Code" button par click karta hai.
  // Iska kaam code, language aur active testcase (input) ko backend API tak bhejna 
  // aur wapas aaye response ko Output tab me dikhana hai.
  const handleRunCode = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setRunError('Please login first to run code.');
      setConsoleTab('output');
      return;
    }

    setIsRunning(true);
    setRunError('');
    setRunResult(null);
    setConsoleTab('output');

    try {
      // Backend ke Local Execution API ko request bhejna
      const response = await fetch(CODE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        // Payload me sab kuch bhej rahe hain: question ID, language, source code, aur raw input
        body: JSON.stringify({
          questionId: question.id,
          language,
          code,
          input: getActiveInput(), // Ex: "nums = [2,7,11,15], target = 9"
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Code run failed.');
      }

      setRunResult(data.data);
    } catch (err) {
      setRunError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  if (loading) return <div className="h-screen bg-[#12161b] text-[#40e0d0] flex items-center justify-center font-sans">Loading workspace...</div>;
  if (!question) return <div className="h-screen bg-[#12161b] text-white flex items-center justify-center font-sans">Problem not found</div>;

  return (
    <div className="flex flex-col h-screen bg-[#12161b] text-gray-300 font-sans overflow-hidden">

      {/* Sleek Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-[#222a35] shrink-0 bg-[#0e1115]">
        <div className="flex items-center gap-6">
          <Link to="/practice" className="flex items-center gap-2 text-gray-400 hover:text-[#40e0d0] transition-colors group">
            <div className="w-8 h-8 rounded-full bg-[#171c23] border border-[#222a35] flex items-center justify-center group-hover:border-[#40e0d0]/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-wide">Library</span>
          </Link>
          <div className="h-6 w-px bg-[#222a35]"></div>
          <h2 className="text-white font-semibold">{question.title}</h2>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-[#171c23] border border-[#222a35] text-gray-300 hover:text-white hover:bg-[#1f2630] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#40e0d0]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
          <button className="flex items-center gap-2 px-6 py-2 text-sm font-bold rounded-lg bg-[#40e0d0] text-black shadow-[0_0_15px_rgba(64,224,208,0.3)] hover:bg-[#3bc7b9] hover:shadow-[0_0_20px_rgba(64,224,208,0.5)] transition-all">
            Submit Solution
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden p-4 gap-4 bg-gradient-to-br from-[#12161b] to-[#0e1115]">

        {/* Left Side: Problem Card */}
        <div className="w-[45%] flex flex-col bg-[#171c23] rounded-2xl border border-[#222a35] shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden">

          {/* Custom Tabs */}
          <div className="flex px-4 pt-4 pb-2 border-b border-[#222a35] gap-2">
            {['problem', 'submissions', 'discussion'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${activeTab === tab
                    ? 'bg-[#40e0d0]/10 text-[#40e0d0]'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a212b]'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === 'problem' && (
              <div className="space-y-8">
                {/* Header Info */}
                <div>
                  <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">{question.id}. {question.title}</h1>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${question.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-400/5 border-emerald-400/20' :
                        question.difficulty === 'Medium' ? 'text-yellow-400 bg-yellow-400/5 border-yellow-400/20' :
                          'text-red-400 bg-red-400/5 border-red-400/20'
                      }`}>
                      {question.difficulty}
                    </span>
                    {question.category && (
                      <span className="px-4 py-1.5 rounded-full text-xs font-bold text-gray-300 bg-[#222a35] border border-[#2a3441]">
                        {question.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="prose prose-invert prose-p:leading-relaxed prose-p:text-gray-300 prose-strong:text-white max-w-none text-[15px]">
                  {(question.description || '').split('\n').map((para, i) => (
                    <p key={i} className="mb-4">{para}</p>
                  ))}
                </div>

                {/* Examples */}
                {question.examples && question.examples.length > 0 && (
                  <div className="space-y-4 mt-8">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Examples</h3>
                    {question.examples.map((ex, idx) => (
                      <div key={idx} className="bg-[#12161b] rounded-xl border border-[#222a35] p-5 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#40e0d0]/50 group-hover:bg-[#40e0d0] transition-colors"></div>
                        <p className="text-xs font-bold text-gray-500 mb-3 uppercase">Example {idx + 1}</p>
                        <div className="space-y-2 text-sm font-mono">
                          <div className="flex"><span className="text-gray-500 w-20">Input:</span> <span className="text-[#a5d6ff]">{ex.input}</span></div>
                          <div className="flex"><span className="text-gray-500 w-20">Output:</span> <span className="text-[#7ee787]">{ex.output}</span></div>
                          {ex.explanation && (
                            <div className="flex mt-2 pt-2 border-t border-[#222a35]"><span className="text-gray-500 w-20">Expl:</span> <span className="text-gray-400 whitespace-normal">{ex.explanation}</span></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints & Complexity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  {question.constraints && question.constraints.length > 0 && (
                    <div className="bg-[#12161b] rounded-xl border border-[#222a35] p-5">
                      <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Constraints</h3>
                      <ul className="space-y-2">
                        {question.constraints.map((c, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#40e0d0] mt-1 text-xs">▹</span>
                            <code className="text-xs font-mono text-gray-300 bg-[#1a212b] px-1.5 py-0.5 rounded">{c}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(question.expectedTimeComplexity || question.expectedSpaceComplexity) && (
                    <div className="bg-[#12161b] rounded-xl border border-[#222a35] p-5 flex flex-col justify-center gap-4">
                      {question.expectedTimeComplexity && (
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Time Complexity</p>
                          <code className="text-sm font-mono text-[#ff7b72]">{question.expectedTimeComplexity}</code>
                        </div>
                      )}
                      {question.expectedSpaceComplexity && (
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Space Complexity</p>
                          <code className="text-sm font-mono text-[#79c0ff]">{question.expectedSpaceComplexity}</code>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab !== 'problem' && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <p className="capitalize font-medium">{activeTab} section is under construction</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Workspace (Editor + Terminal) */}
        <div className="w-[55%] flex flex-col gap-4">

          {/* Editor Container */}
          <div className="flex-1 bg-[#171c23] rounded-2xl border border-[#222a35] shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col overflow-hidden">
            <div className="h-12 bg-[#12161b] border-b border-[#222a35] px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Language</span>
                <select
                  className="bg-[#1a212b] text-sm text-[#40e0d0] font-medium border border-[#2a3441] rounded-md px-3 py-1 outline-none appearance-none focus:border-[#40e0d0]/50 transition-colors cursor-pointer"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="python">Python 3</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button className="p-1.5 text-gray-500 hover:text-gray-300 bg-[#1a212b] rounded-md border border-[#2a3441] transition-colors" title="Settings">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </button>
                <button className="p-1.5 text-gray-500 hover:text-gray-300 bg-[#1a212b] rounded-md border border-[#2a3441] transition-colors" title="Reset Code">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
              </div>
            </div>

            <div className="flex-1 relative bg-[#0e1115]">
              <Editor
                height="100%"
                theme="vs-dark"
                language={language}
                value={code}
                onChange={(value) => setCode(value)}
                options={{
                  minimap: { enabled: false },
                  fontSize: 15,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  padding: { top: 20 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                  formatOnPaste: true,
                }}
              />
            </div>
          </div>

          {/* Execution Console (Test Cases) */}
          <div className="h-[250px] bg-[#171c23] rounded-2xl border border-[#222a35] shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col overflow-hidden shrink-0">
            <div className="h-10 bg-[#12161b] border-b border-[#222a35] px-4 flex items-center gap-6">
              <button
                onClick={() => setConsoleTab('testcases')}
                className={`text-sm font-semibold relative h-full flex items-center ${consoleTab === 'testcases' ? 'text-[#40e0d0]' : 'text-gray-500 hover:text-gray-300 transition-colors'}`}
              >
                Testcases
                {consoleTab === 'testcases' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#40e0d0]"></div>}
              </button>
              <button
                onClick={() => setConsoleTab('output')}
                className={`text-sm font-semibold relative h-full flex items-center ${consoleTab === 'output' ? 'text-[#40e0d0]' : 'text-gray-500 hover:text-gray-300 transition-colors'}`}
              >
                Console Output
                {consoleTab === 'output' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#40e0d0]"></div>}
              </button>
            </div>

            <div className="flex-1 flex flex-col p-4 overflow-hidden">
              {consoleTab === 'testcases' && (
                <>
                  <div className="flex gap-2 mb-4">
                    {question.examples?.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveTestCase(idx)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all border ${activeTestCase === idx
                            ? 'bg-[#1a212b] text-white border-[#40e0d0]/50 shadow-[0_0_10px_rgba(64,224,208,0.1)]'
                            : 'bg-[#12161b] text-gray-500 border-[#222a35] hover:text-gray-300 hover:border-gray-600'
                          }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  {question.examples && question.examples[activeTestCase] && (
                    <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                      {/* 
                         Ye logic backend database se aayi string (e.g. "nums = [2,7,11,15], target = 9") 
                         ko comma ke basis par split karta hai taki hum UI par har variable ko 
                         alag se khoobsurati se dikha sakein. 
                      */}
                      {(question.examples[activeTestCase].input || '').split(', ').map((variable, i) => {
                        const [name, value] = variable.split(' = ');
                        return (
                          <div key={i} className="flex flex-col gap-1.5">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{name || 'Input'}</span>
                            <div className="bg-[#0e1115] px-4 py-2.5 rounded-xl border border-[#222a35] font-mono text-sm text-[#a5d6ff]">
                              {value || variable}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {consoleTab === 'output' && (
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {isRunning ? (
                    <div className="h-full flex items-center justify-center text-sm text-gray-500">Running code...</div>
                  ) : runError ? (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-300">
                      {runError}
                    </div>
                  ) : runResult ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full bg-[#1a212b] border border-[#2a3441] text-xs text-[#40e0d0]">
                          {runResult.status?.description || 'Finished'}
                        </span>
                        {runResult.time && (
                          <span className="px-3 py-1 rounded-full bg-[#1a212b] border border-[#2a3441] text-xs text-gray-400">
                            {runResult.time}s
                          </span>
                        )}
                        {runResult.memory && (
                          <span className="px-3 py-1 rounded-full bg-[#1a212b] border border-[#2a3441] text-xs text-gray-400">
                            {runResult.memory} KB
                          </span>
                        )}
                      </div>
                      {runResult.compile_output && (
                        <div className="bg-red-500/10 rounded-xl border border-red-500/30 p-4">
                          <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Compilation Error</p>
                          <pre className="text-sm text-red-300 whitespace-pre-wrap font-mono">
                            {runResult.compile_output}
                          </pre>
                        </div>
                      )}

                      {runResult.stderr && (
                        <div className="bg-red-500/10 rounded-xl border border-red-500/30 p-4">
                          <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Runtime Error</p>
                          <pre className="text-sm text-red-300 whitespace-pre-wrap font-mono">
                            {runResult.stderr}
                          </pre>
                        </div>
                      )}

                      {runResult.stdout && (
                        <div className="bg-[#0e1115] rounded-xl border border-[#222a35] p-4">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Standard Output</p>
                          <pre className="text-sm text-gray-200 whitespace-pre-wrap font-mono">
                            {runResult.stdout}
                          </pre>
                        </div>
                      )}

                      {(!runResult.compile_output && !runResult.stderr && !runResult.stdout) && (
                        <div className="bg-[#0e1115] rounded-xl border border-[#222a35] p-4">
                          <p className="text-sm text-gray-500">No output returned.</p>
                        </div>
                      )}

                      {!runResult.compile_output && !runResult.stderr && question.examples?.[activeTestCase]?.output && (
                        <div className="bg-[#0e1115] rounded-xl border border-[#222a35] p-4">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Expected Output</p>
                          <pre className="text-sm text-[#7ee787] whitespace-pre-wrap font-mono">
                            {question.examples[activeTestCase].output}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-gray-500">Run code to see output.</div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
