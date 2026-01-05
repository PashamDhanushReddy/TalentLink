import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const Home = () => {
  console.log("Home component rendering");
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            TL
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            TalentLink
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline transition-colors">Home</Link>
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline transition-colors">Log In</Link>
          <Link to="/register" className="text-sm font-medium bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 transition shadow-sm hover:shadow-md">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-6">
            #1 Freelance Marketplace
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Hire the best talent <br />
            <span className="text-blue-600">anywhere, anytime.</span>
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-lg">
            Connect with top-tier freelancers and clients. Whether you need a developer, designer, or writer, TalentLink makes it easy to build your dream team.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register" className="inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 md:text-lg shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-0.5">
              Find Talent
            </Link>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute -inset-4 bg-blue-100 rounded-full blur-3xl opacity-30 -z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80" 
            alt="Team working together" 
            className="rounded-3xl shadow-2xl w-full object-cover transform rotate-1 hover:rotate-0 transition-transform duration-500"
          />
          
          {/* Floating Badge */}
          <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce-slow">
             <div className="bg-green-100 p-2 rounded-full">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
             </div>
             <div>
                <p className="text-sm font-bold text-gray-900">Verified Talent</p>
                <p className="text-xs text-gray-500">Top 1% Vetted</p>
             </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="p-4">
              <div className="text-4xl font-bold text-blue-600 mb-2">20k+</div>
              <div className="text-gray-500 font-medium">Freelancers</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold text-blue-600 mb-2">10k+</div>
              <div className="text-gray-500 font-medium">Projects Completed</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
              <div className="text-gray-500 font-medium">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
         <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose TalentLink?</h2>
         <p className="text-gray-500 max-w-2xl mx-auto mb-12">
            We provide the tools and security you need to focus on what matters most: your work.
         </p>
         
         <div className="grid md:grid-cols-3 gap-8">
            {[
                { title: 'Safe Payments', desc: 'Secure transactions and payment protection for peace of mind.' },
                { title: 'Top Quality', desc: 'Access a curated network of professional freelancers.' },
                { title: '24/7 Support', desc: 'Our dedicated team is here to help you anytime, anywhere.' }
            ].map((item, i) => (
                <div key={i} className="bg-gray-50 p-8 rounded-2xl hover:bg-blue-50 transition-colors group">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600">{item.title}</h3>
                    <p className="text-gray-500">{item.desc}</p>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default Home;
