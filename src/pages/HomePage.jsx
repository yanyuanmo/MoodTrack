import { useState } from 'react';

function HomePage() {
  // 状态管理
  const [selectedMood, setSelectedMood] = useState('');
  const [note, setNote] = useState('');
  const [recentRecords, setRecentRecords] = useState([
    { date: 'Oct 25', mood: '😊 Happy', note: 'Had a great lunch!' }
  ]);

  // 心情选项
  const moods = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '😢', label: 'Sad' },
    { emoji: '😠', label: 'Angry' },
    { emoji: '😰', label: 'Anxious' },
    { emoji: '😌', label: 'Calm' }
  ];

  // 提交表单
  const handleSubmit = () => {
    if (!selectedMood || !note) {
      alert('Please select a mood and add a note!');
      return;
    }

    const newRecord = {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: selectedMood,
      note: note
    };

    setRecentRecords([newRecord, ...recentRecords].slice(0, 3));
    setSelectedMood('');
    setNote('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      {/* <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
            Home
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
            Trends
          </button>
        </div>
        <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          Logout
        </button>
      </nav> */}

      {/* 主要内容区域 */}
      <div className="max-w-2xl mx-auto mt-8 p-6">
        {/* <h1 className="text-2xl font-bold text-gray-800 mb-6">Daily Mood Logging</h1> */}

        {/* 心情选择 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            How are you feeling today?
          </h2>
          
          <div className="flex gap-3 mb-6 flex-wrap">
            {moods.map((mood) => (
              <button
                key={mood.label}
                onClick={() => setSelectedMood(`${mood.emoji} ${mood.label}`)}
                className={`px-4 py-2 rounded-lg border-2 transition ${
                  selectedMood === `${mood.emoji} ${mood.label}`
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-400'
                }`}
              >
                <span className="text-2xl mr-2">{mood.emoji}</span>
                <span className="text-sm font-medium">{mood.label}</span>
              </button>
            ))}
          </div>

          {/* 笔记输入 */}
          <div className="mb-4">
            {/* <label className="block text-sm font-medium text-gray-700 mb-2">
              Note or Reflection
            </label> */}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              rows="3"
            />
          </div>

          {/* 提交按钮 */}
          <button
            onClick={handleSubmit}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-medium"
          >
            Submit
          </button>
        </div>

        {/* 最近记录 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Recent records
          </h2>
          
          {recentRecords.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No records yet</p>
          ) : (
            <div className="space-y-3">
              {recentRecords.map((record, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm text-gray-600">📅 {record.date}</span> |
                  <span className="text-sm font-medium">{record.mood}</span> |
                  <span className="text-sm text-gray-600">"{record.note}"</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;