import { useState, useRef } from 'react';

function HomePage() {
  
  // 状态管理
  const [selectedMood, setSelectedMood] = useState('');
  const [note, setNote] = useState('');

  // 使用系统/浏览器的本地短日期 + 短时间格式
  // 例如在 en-US 上通常显示为 "11/25/2025, 2:35 PM"，在其他地区会使用相应本地格式
  const formatDateTime = (d = new Date()) =>
    d.toLocaleString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const [recentRecords, setRecentRecords] = useState([
    { id: Date.now(), date: formatDateTime(), mood: '😊 Happy', note: 'Had a great lunch!' }
  ]);

  const recordsRef = useRef(null);
  const inputRef = useRef(null);

  // submitState 控制提交按钮的动画与显示内容
  // 'idle'   - 空闲状态，显示 "Submit"
  // 'loading'- 加载中，显示 spinner（按钮宽度不变）
  // 'success'- 成功，短暂显示对勾后恢复
  const [submitState, setSubmitState] = useState('idle');

  // 心情选项
    const moods = [
      { emoji: '😊', label: 'Happy' },
      { emoji: '😃', label: 'Excited' },
      { emoji: '😎', label: 'Confident' },
      { emoji: '😌', label: 'Calm' },
      { emoji: '😢', label: 'Sad' },
      { emoji: '😠', label: 'Angry' },
      { emoji: '😫', label: 'Stressed' },
      { emoji: '😰', label: 'Anxious' }, 
      // { emoji: '😐', label: 'Neutral' } 
    ];

  // 提交表单（带 loading->success 的视觉流程）
  const handleSubmit = () => {
    if (!selectedMood || !note) {
      alert('Please select a mood and add a note!');
      return;
    }

    // 进入加载状态（显示 spinner）
    setSubmitState('loading');

  
    setTimeout(() => {
      // 显示成功状态（对勾）
      setSubmitState('success');

      // 准备新记录（带唯一 id）
      const newRecord = {
        id: Date.now(),
        date: formatDateTime(),
        mood: selectedMood,
        note: note
      };

      // 使用 FLIP 动画插入新记录（函数在下方）
      flipInsert(newRecord);

      // 清空输入
      setSelectedMood('');
      setNote('');

      // 在短暂延时后回到空闲
      setTimeout(() => setSubmitState('idle'), 1000);
    }, 900);
  };

  // FLIP 插入：平滑将新卡片从输入区滑入，同时旧卡片顺滑下移
  const flipInsert = (newRecord) => {
    const container = recordsRef.current;
    if (!container) {
      setRecentRecords((prev) => [newRecord, ...prev].slice(0, 5));
      return;
    }

    // 记录插入前每个项目的位置
    const firstRects = new Map();
    container.querySelectorAll('[data-id]').forEach((node) => {
      const id = node.getAttribute('data-id');
      firstRects.set(id, node.getBoundingClientRect());
    });

    // 更新数据（新项目插到最前）
    setRecentRecords((prev) => [newRecord, ...prev].slice(0, 5));

    // 下一帧：计算反向位移并应用，然后触发过渡
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
          // 新节点：从输入区域位置开始显示
          invertY = inputRect.top - last.top;
          node.style.opacity = '0';
        }

        node.style.transform = `translateY(${invertY}px)`;
        node.style.willChange = 'transform, opacity';
      });

      // force reflow
      // eslint-disable-next-line no-unused-expressions
      container.offsetHeight;

      // 播放过渡：移除 transform 以让元素平滑回到自然位置
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
        {/* 心情选择 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            How are you feeling today?
          </h2>
          
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {moods.map((mood) => (
              <button
                key={mood.label}
                onClick={() => setSelectedMood(`${mood.emoji} ${mood.label}`)}
                /* 使用 group 以便子元素（emoji）在悬停时响应 */
                className={`group px-4 py-2 rounded-lg border-2 transition ${
                  selectedMood === `${mood.emoji} ${mood.label}`
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-400'
                }`}
              >
                {/* emoji：使用 Tailwind 的 group-hover 实现微上移 */}
                <span className="text-2xl mr-2 transform transition-transform duration-200 group-hover:-translate-y-1 inline-block">{mood.emoji}</span>
                <span className="text-sm font-medium">{mood.label}</span>
              </button>
            ))}
          </div>

          {/* 笔记输入 */}
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

          {/* 提交按钮 */}
          <button
            onClick={handleSubmit}
            disabled={submitState === 'loading'}
            aria-live="polite"
            className={`flex items-center justify-center relative w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 ${
              submitState === 'loading' ? 'cursor-wait' : ''
            }`}
          >
            {/* 主要文字：加载时绝对定位并隐藏，使 spinner 居中且不引起布局跳动 */}
            <span
              className={`transition-opacity duration-150 ${
                submitState === 'loading'
                  ? 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0'
                  : ''
              }`}
            >
              Submit
            </span>

            {/* 加载指示：使用 Tailwind 的 animate-spin + border utilities */}
            {submitState === 'loading' && (
              <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />
            )}

            {/* 对勾：使用 scale 和 opacity 过渡实现弹出效果 */}
            {submitState === 'success' && (
              <svg className="w-5 h-5 text-white opacity-100 transform scale-100 transition duration-200" viewBox="0 0 24 24" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
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
            <div className="space-y-3" ref={recordsRef}>
              {recentRecords.map((record) => (
                <div
                  key={record.id}
                  data-id={record.id}
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