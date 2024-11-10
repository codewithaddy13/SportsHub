import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const AnalyticsDashboard = () => {
  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/analysis');
        setAnalysisData(response.data);
      } catch (error) {
        console.error('Error fetching analysis data:', error);
      }
    };
    fetchAnalysisData();
  }, []);

  if (!analysisData) return <p>Loading analysis data...</p>;

  const timeCategoryData = [
    { name: 'Morning', count: analysisData.morningCount },
    { name: 'Afternoon', count: analysisData.afternoonCount },
    { name: 'Evening', count: analysisData.eveningCount },
    { name: 'Night', count: analysisData.nightCount },
  ];

  // Transforming popular turfs data
  const popularTurfsData = analysisData.popularTurfs.map((turf) => ({
    name: turf.name, // Ensure this key matches your data structure
    count: turf.count // Ensure this key matches your data structure
  }));

  const COLORS = ['#0088FE', '#FF8042', '#FFBB28', '#00C49F', '#8884d8'];

  return (
    <div className="container mx-auto p-4 pt-6 md:p-6 lg:p-12 xl:p-12">
      <h2 className="text-3xl text-gray-900 leading-tight text-center mb-4">
        Analytics Dashboard
      </h2>
      {/* Peak Time Highlight */}
      <div className="bg-yellow-100 rounded p-4 mb-6 text-center">
        <h3 className="text-xl text-gray-700 font-bold">
          Current Peak Booking Time: {analysisData.peakTimes}
        </h3>
      </div>
      <div className="flex flex-wrap -mx-4">
        {/* Booking Times Categorization */}
        <div className="w-full xl:w-1/2 p-4">
          <div className="bg-white rounded shadow-md p-4">
            <h3 className="text-lg text-gray-900 leading-tight mb-2">
              Booking Times Categorization
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeCategoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d">
                  {timeCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === analysisData.peakTimes ? "#FF8042" : "#82ca9d"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Pie Chart for Popular Turfs */}
      <div className="w-full p-4">
        <div className="bg-white rounded shadow-md p-4">
          <h3 className="text-lg text-gray-900 leading-tight mb-2">
            Most Popular Turfs
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={popularTurfsData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {popularTurfsData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
