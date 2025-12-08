import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Replace with your actual API Gateway endpoint
const API_BASE_URL = 'https://0bwf1p5coc.execute-api.us-east-1.amazonaws.com/prod';

export default function TrendsPage() {
  const navigate = useNavigate();
  const [trendData, setTrendData] = useState([]);
  const [rawMoodData, setRawMoodData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const moodConfig = {
    5: { emoji: "😊", text: "Happy", color: "text-green-600", bg: "bg-green-100" },
    4: { emoji: "😌", text: "Calm", color: "text-blue-600", bg: "bg-blue-100" },
    3: { emoji: "😰", text: "Anxious", color: "text-yellow-600", bg: "bg-yellow-100" },
    2: { emoji: "😠", text: "Angry", color: "text-red-600", bg: "bg-red-100" },
    1: { emoji: "😢", text: "Sad", color: "text-gray-600", bg: "bg-gray-100" },
  };

  // Check if user is logged in and fetch mood data
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/');
    } else {
      fetchMoodData();
    }
  }, [navigate]);

  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      days.push({
        date: `${month}-${day}`,
        dayName: dayName,
        fullDate: date
      });
    }
    return days;
  };

  const fetchMoodData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/getmoods?userId=${userId}&limit=7`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch mood data');
      }

      console.log('Raw API data:', data.data); 

      const processedData = data.data.map(item => {
        let formattedDate = item.date;
        
        if (item.date) {
          if (item.date.includes('/')) {
            const parts = item.date.split('/');
            if (parts.length >= 2) {
              const month = parts[0].padStart(2, '0');
              const day = parts[1].padStart(2, '0');
              formattedDate = `${month}-${day}`;
            }
          }
          
          else if (item.date.includes('-') && item.date.length > 7) {
            const parts = item.date.split('-');
            if (parts.length >= 3) {
              formattedDate = `${parts[1]}-${parts[2].substring(0, 2)}`;
            }
          }
        }
        
        return {
          ...item,
          originalDate: item.date,  
          date: formattedDate       
        };
      });

      console.log('Processed data:', processedData); 

      setRawMoodData(processedData);

      const last7Days = getLast7Days();
      const moodMap = new Map();
      
      processedData.forEach(item => {
        moodMap.set(item.date, item.mood);
      });

      console.log('Date map:', Array.from(moodMap.entries())); 
      console.log('Expected dates:', last7Days.map(d => d.date)); 

      const chartData = last7Days.map(day => ({
        date: day.date,
        dayName: day.dayName,
        mood: moodMap.get(day.date) || null, 
        hasData: moodMap.has(day.date)
      }));

      setTrendData(chartData);
    } catch (err) {
      console.error('Error fetching mood data:', err);
      setError('Failed to load mood trends');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload[0] && payload[0].value !== null) {
      const value = payload[0].value;
      const mood = moodConfig[value];
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
          <p className="text-sm">
            <span className="font-semibold">{payload[0].payload.dayName}</span>
          </p>
          <p className="text-sm">
            {mood.emoji} {mood.text}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (payload.mood === null) {
      return null; 
    }
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={4} 
        fill="#7c3aed" 
        stroke="#fff" 
        strokeWidth={2}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 max-w-6xl mx-auto mt-6">
        <h1 className="text-xl font-bold mb-1">📈 Mood Trends</h1>
        <p className="text-sm text-gray-600 mb-3">Your mood patterns over the last 7 days</p>

        <div className="w-full h-64 mb-6 border border-gray-300 rounded-lg bg-white p-4">
          {loading ? (
            <p className="text-center mt-20 text-gray-500 text-sm">Loading chart...</p>
          ) : error ? (
            <p className="text-center mt-20 text-red-500 text-sm">{error}</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="dayName" 
                  tick={{ fontSize: 12 }}
                  angle={0}
                />
                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tickFormatter={(val) => moodConfig[val]?.emoji || ""}
                  tick={{ fontSize: 14 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={<CustomDot />}
                  activeDot={{ r: 6 }}
                  connectNulls={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <h2 className="text-lg font-semibold mb-2">📅 Weekly Details</h2>

        {loading ? (
          <p className="text-sm text-gray-600">Loading data...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : rawMoodData.length === 0 ? (
          <p className="text-sm text-gray-600">No mood records yet. Start tracking your mood from the home page!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">Date</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">Mood</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">Note</th>
                </tr>
              </thead>
              <tbody>
                {getLast7Days().map((day, index) => {
                  const dayData = rawMoodData.find(item => item.date === day.date);
                  
                  if (dayData) {
                    const mood = moodConfig[dayData.mood];
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2 text-xs">
                          <span className="font-medium">{day.dayName}</span> {day.date}
                          <span className="text-gray-400 ml-1">({dayData.originalDate})</span>
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${mood.bg} ${mood.color}`}>
                            <span className="text-base">{mood.emoji}</span>
                            {mood.text}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-xs text-gray-700">
                          {dayData.note}
                        </td>
                      </tr>
                    );
                  } else {
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2 text-xs">
                          <span className="font-medium">{day.dayName}</span> {day.date}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          <span className="text-gray-400 text-xs">-</span>
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          <span className="text-gray-400 text-xs italic">No record</span>
                        </td>
                      </tr>
                    );
                  }
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              📊 You've tracked your mood {rawMoodData.length} out of the last 7 days.
              {rawMoodData.length < 7 && " Keep tracking daily for better insights!"}
            </p>
          </div>
        )}

        <div className="mt-4 p-3 bg-gray-50 rounded">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-gray-600">Mood Scale:</span>
            {Object.entries(moodConfig).reverse().map(([value, config]) => (
              <div key={value} className="flex items-center gap-1">
                <span className="text-sm">{config.emoji}</span>
                <span className="text-xs text-gray-600">{config.text} ({value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}