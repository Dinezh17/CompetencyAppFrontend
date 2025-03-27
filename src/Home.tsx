import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
const Home: React.FC = () => {
 
  const navigate = useNavigate();
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      localStorage.setItem("userData", JSON.stringify(userData));
    }
  }, []);
 
  
    // Sample competency statistics
    const stats = [
      { value: "150+", label: "Total Competencies" },
      { value: "24", label: "Competency Categories" },
      { value: "98%", label: "Completion Rate" },
      { value: "4.9/5", label: "User Satisfaction" }
    ];
  
    // Sample featured competencies
    const featuredCompetencies = [
      "Leadership",
      "Technical Writing",
      "Project Management",
      "Data Analysis",
      "Team Collaboration"
    ];
  
    return (
      <div className="pt-16 min-h-screen bg-gray-50"> {/* pt-16 accounts for navbar height */}
        {/* Hero Section */}
        <section className="py-20 px-4 text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Welcome to Competency Management</h1>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Streamline your organization's competency framework with our powerful management tools
          </p>
          <button 
            onClick={() => navigate("/competencies")}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Explore Competencies
          </button>
        </section>
  
        {/* Stats Section */}
        <section className="py-16 px-4 max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>
  
        {/* Features Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 border rounded-lg hover:shadow-md transition">
                <h3 className="text-xl font-semibold mb-3">📊 Comprehensive Tracking</h3>
                <p>Monitor competency development across your entire organization with real-time analytics.</p>
              </div>
              <div className="p-6 border rounded-lg hover:shadow-md transition">
                <h3 className="text-xl font-semibold mb-3">🔄 Continuous Improvement</h3>
                <p>Identify skill gaps and create targeted development plans for your teams.</p>
              </div>
              <div className="p-6 border rounded-lg hover:shadow-md transition">
                <h3 className="text-xl font-semibold mb-3">🔒 Secure Access</h3>
                <p>Role-based access control ensures data security and proper information flow.</p>
              </div>
            </div>
          </div>
        </section>
  
        {/* Featured Competencies */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Featured Competencies</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {featuredCompetencies.map((comp, index) => (
                <div 
                  key={index} 
                  className="bg-white px-6 py-3 rounded-full shadow-sm border hover:bg-blue-50 transition cursor-pointer"
                  onClick={() => navigate(`/competencies?search=${comp}`)}
                >
                  {comp}
                </div>
              ))}
            </div>
          </div>
        </section>
  
        {/* Call to Action */}
        <section className="py-20 px-4 text-center bg-blue-600 text-white">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Competency Management?</h2>
          <button 
            onClick={() => navigate("/competencies")}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition"
          >
            Get Started Now
          </button>
        </section>
      </div>
    );
  };
  
  export default Home;