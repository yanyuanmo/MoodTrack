import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://0bwf1p5coc.execute-api.us-east-1.amazonaws.com/prod';

function HomePage() {
  const navigate = useNavigate();
  
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const recordsRef = useRef(null);
  const inputRef = useRef(null);
  const [submitState, setSubmitState] = useState('idle');


  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/');
    } else {
      fetchRecentMoods();
    }
  }, [navigate]);


  const moodConfig = {
    5: { emoji: '😊', label: 'Happy' },
    4: { emoji: '😌', label: 'Calm' },
    3: { emoji: '😰', label: 'Anxious' },
    2: { emoji: '😠', label: 'Angry' },
    1: { emoji: '😢', label: 'Sad' }
  };

  const fetchRecentMoods = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/getmoods?userId=${userId}&limit=3`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch moods');
      }

      setRecentRecords(data.data);
    } catch (err) {
      console.error('Error fetching moods:', err);
      setError('Failed to load recent moods');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMood || !note) {
      alert('Please select a mood and add a note!');
      return;
    }

    setSubmitState('loading');

    try {
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        console.error('No userId found in localStorage');
        alert('User not logged in. Please login again.');
        navigate('/');
        return;
      }
      
      const selectedMoodConfig = moodConfig[selectedMood];
      

      const requestBody = {
        userId: userId,
        mood: selectedMood,  
        moodText: selectedMoodConfig.label,  
        note: note
      };
      
      console.log('Submitting mood with data:', requestBody);
      
      const response = await fetch(`${API_BASE_URL}/submitmood`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

    
      const contentType = response.headers.get("content-type");
      let data;
      
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned non-JSON response');
      }

      console.log('API Response:', { status: response.status, data });

      if (!response.ok) {
        console.error('API Error:', data);
        throw new Error(data.error || data.message || 'Failed to submit mood');
      }

      setSubmitState('success');

      
      const newRecord = {
        id: data.data?.timestamp || Date.now(),
        date: data.data?.date || new Date().toLocaleDateString(),
        mood: data.data?.mood || selectedMood,  
        moodText: data.data?.moodText || selectedMoodConfig.label,
        note: data.data?.note || note
      };

  
      flipInsert(newRecord);

      setSelectedMood(null);
      setNote('');

      setTimeout(() => setSubmitState('idle'), 1000);

    } catch (err) {
      console.error('Error submitting mood:', err);
      
     
      let errorMessage = 'Failed to submit mood. ';
      if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Please check your connection and try again.';
      }
      
      alert(errorMessage);
      setSubmitState('idle');
    }
  };

  
  const flipInsert = (newRecord) => {
    const container = recordsRef.current;
    if (!container) {
      setRecentRecords((prev) => [newRecord, ...prev].slice(0, 3));
      return;
    }

    const firstRects = new Map();
    container.querySelectorAll('[data-id]').forEach((node) => {
      const id = node.getAttribute('data-id');
      firstRects.set(id, node.getBoundingClientRect());
    });

    setRecentRecords((prev) => [newRecord, ...prev].slice(0, 3));

    requestAnimationFrame(() => {
      const inputRect = inputRef.current ? inputRef.current.getBoundingClientRect() : null;

      container.querySelectorAll('[data-id]').forEach((node) => {
        const id = node.getAttribute('data-id');
        const first = firstRects.get(id);
        const last = node.getBoundingClientRect();

        let invertY = 0;
        if (first) {
          invertY = first.top - last.top;
        } else if (inputRect) {
          invertY = inputRect.top - last.top;
          node.style.opacity = '0';
        }

        node.style.transform = `translateY(${invertY}px)`;
        node.style.willChange = 'transform, opacity';
      });

      // force reflow
      // eslint-disable-next-line no-unused-expressions
      container.offsetHeight;

      container.querySelectorAll('[data-id]').forEach((node) => {
        node.style.transition = 'transform 420ms cubic-bezier(.2,.9,.2,1), opacity 320ms';
        node.style.transform = '';
        node.style.opacity = '1';

        const cleanup = (e) => {
          if (e && e.propertyName !== 'transform') return;
          node.style.transition = '';
          node.style.willChange = '';
          node.removeEventListener('transitionend', cleanup);
        };
        node.addEventListener('transitionend', cleanup);
      });
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto pt-8 p-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            How are you feeling today?
          </h2>
          
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {Object.entries(moodConfig).reverse().map(([value, config]) => (
              <button
                key={value}
                onClick={() => setSelectedMood(Number(value))}
                className={`group px-4 py-2 rounded-lg border-2 transition ${
                  selectedMood === Number(value)
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-400'
                }`}
              >
                <span className="text-2xl mr-2 transform transition-transform duration-200 group-hover:-translate-y-1 inline-block">
                  {config.emoji}
                </span>
                <span className="text-sm font-medium">{config.label}</span>
              </button>
            ))}
          </div>

          <div className="mb-4">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              ref={inputRef}
              placeholder="What's on your mind?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              rows="3"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitState === 'loading'}
            aria-live="polite"
            className={`flex items-center justify-center relative w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 ${
              submitState === 'loading' ? 'cursor-wait' : ''
            }`}
          >
            <span
              className={`transition-opacity duration-150 ${
                submitState === 'loading'
                  ? 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0'
                  : ''
              }`}
            >
              Submit
            </span>

            {submitState === 'loading' && (
              <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />
            )}

            {submitState === 'success' && (
              <svg className="w-5 h-5 text-white opacity-100 transform scale-100 transition duration-200" viewBox="0 0 24 24" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Recent records (Last 3)
          </h2>
          
          {loading ? (
            <p className="text-gray-500 text-center py-4">Loading...</p>
          ) : error ? (
            <p className="text-red-500 text-center py-4">{error}</p>
          ) : recentRecords.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No records yet</p>
          ) : (
            <div className="space-y-3" ref={recordsRef}>
              {recentRecords.map((record) => {
                const mood = moodConfig[record.mood] || { emoji: '❓', label: 'Unknown' };
                return (
                  <div
                    key={record.id}
                    data-id={record.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-600">📅 {record.date}</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-lg">{mood.emoji}</span>
                    <span className="text-sm font-medium">{mood.label}</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-sm text-gray-600 italic">"{record.note}"</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;