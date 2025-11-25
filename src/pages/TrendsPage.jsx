import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TrendsPage() {
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);


  //TODO：
  // useEffect(() => {
  //   setLoading(true);
  //   fetch("http://your-backend-api/moods/trends?userId=xxx")
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setTrendData(data);
  //       setLoading(false);
  //     })
  //     .catch(() => setLoading(false));
  // }, []);

  useEffect(() => {
    const fakeData = [
      { date: "01-01", mood: 5, moodText: "Happy", note: "Great day!" },
      { date: "01-02", mood: 4, moodText: "Calm", note: "Peaceful" },
      { date: "01-03", mood: 3, moodText: "Anxious", note: "Nervous" },
      { date: "01-04", mood: 2, moodText: "Angry", note: "Bad traffic" },
      { date: "01-05", mood: 1, moodText: "Sad", note: "Missing friends" },
      { date: "01-06", mood: 4, moodText: "Calm", note: "Relaxing" },
      { date: "01-07", mood: 5, moodText: "Happy", note: "Promoted!" },
    ];
    setTrendData(fakeData);
    setLoading(false);
  }, []);

  const moodConfig = {
    5: { emoji: "😄", text: "Happy", color: "text-green-600", bg: "bg-green-100" },
    4: { emoji: "😌", text: "Calm", color: "text-blue-600", bg: "bg-blue-100" },
    3: { emoji: "😰", text: "Anxious", color: "text-yellow-600", bg: "bg-yellow-100" },
    2: { emoji: "😠", text: "Angry", color: "text-red-600", bg: "bg-red-100" },
    1: { emoji: "😢", text: "Sad", color: "text-gray-600", bg: "bg-gray-100" },
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-1">📈 Mood Trends</h1>
      <p className="text-sm text-gray-600 mb-3">Visualize your mood changes over time.</p>

      <div className="w-full h-48 mb-4 border border-gray-300 rounded-lg bg-gray-50 p-2">
        {loading ? (
          <p className="text-center mt-20 text-gray-500 text-sm">Loading chart...</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tickFormatter={(val) => moodConfig[val]?.emoji || ""}
                tick={{ fontSize: 14 }}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "mood") {
                    return [moodConfig[value]?.text || value, "Mood"];
                  }
                  return value;
                }}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: "#7c3aed", strokeWidth: 1, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <h2 className="text-lg font-semibold mb-2">📅 Weekly Details</h2>

      {loading ? (
        <p className="text-sm text-gray-600">Loading data...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 py-1 text-left text-xs font-semibold">Date</th>
                <th className="border border-gray-300 px-2 py-1 text-left text-xs font-semibold">Mood</th>
                <th className="border border-gray-300 px-2 py-1 text-left text-xs font-semibold">Note</th>
              </tr>
            </thead>
            <tbody>
              {trendData.map((item, index) => {
                const mood = moodConfig[item.mood];
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-2 py-1 text-xs">
                      {item.date}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${mood.bg} ${mood.color}`}>
                        <span>{mood.emoji}</span>
                        {mood.text}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-xs text-gray-700">
                      {item.note}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 p-2 bg-gray-50 rounded">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-gray-600">Scale:</span>
          {Object.entries(moodConfig).reverse().map(([value, config]) => (
            <div key={value} className="flex items-center gap-1">
              <span className="text-xs">{config.emoji}</span>
              <span className="text-xs text-gray-600">{config.text}({value})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}