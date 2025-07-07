'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, memo } from 'react';
import Loading from '@/components/Loading';
import { 
  Calendar, 
  Users, 
  Shield, 
  Sparkles, 
  ArrowRight, 
  Github, 
  Linkedin, 
  Mail,
  Menu,
  X,
  CheckCircle,
  Star,
  Globe,
  Zap
} from 'lucide-react';

const LandingPage = memo(function LandingPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);


  // Redirect authenticated users to their dashboards
  useEffect(() => {
    if (!loading && user && userProfile) {
      if (userProfile.role === 'organizer') {
        router.push('/organizer/dashboard');
      } else if (userProfile.role === 'attendee') {
        router.push('/attendee/dashboard');
      }
    }
  }, [user, userProfile, loading, router]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = useCallback((role: 'organizer' | 'attendee') => {
    router.push(`/auth/role-selection?role=${role}`);
  }, [router]);

  if (loading) {
    return <Loading text="Initializing Event Organizer..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                EventOrganizer
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-indigo-600 transition-colors">Home</a>
              <a href="#features" className="text-gray-700 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#about" className="text-gray-700 hover:text-indigo-600 transition-colors">About</a>
              <a href="#contact" className="text-gray-700 hover:text-indigo-600 transition-colors">Contact</a>
              <button
                onClick={() => handleGetStarted('attendee')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                <a href="#home" className="text-gray-700 hover:text-indigo-600 transition-colors">Home</a>
                <a href="#features" className="text-gray-700 hover:text-indigo-600 transition-colors">Features</a>
                <a href="#about" className="text-gray-700 hover:text-indigo-600 transition-colors">About</a>
                <a href="#contact" className="text-gray-700 hover:text-indigo-600 transition-colors">Contact</a>
                <button
                  onClick={() => handleGetStarted('attendee')}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 w-full"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            {/* Hero content */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent leading-tight">
                Manage and Join Events 
                <span className="block">Effortlessly</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                One-stop solution to organize and participate in events securely and smartly
              </p>
            </div>

            {/* Role Selection Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-16">
              {/* Organizer Card */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-gray-100 group-hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2">
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Event Organizer</h3>
                      <p className="text-gray-600 mb-6">Create, manage, and monitor your events with powerful tools</p>
                      <ul className="text-left space-y-2 mb-8">
                        <li className="flex items-center text-gray-700">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                          Create unlimited events
                        </li>
                        <li className="flex items-center text-gray-700">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                          Manage attendees
                        </li>
                        <li className="flex items-center text-gray-700">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                          Real-time analytics
                        </li>
                        <li className="flex items-center text-gray-700">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                          Secure payment processing
                        </li>
                      </ul>
                    </div>
                    <button
                      onClick={() => handleGetStarted('organizer')}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 text-lg font-semibold"
                    >
                      <span>Start Organizing</span>
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Attendee Card */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-gray-100 group-hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2">
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center mx-auto">
                      <Star className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Event Attendee</h3>
                      <p className="text-gray-600 mb-6">Discover amazing events and connect with like-minded people</p>
                      <ul className="text-left space-y-2 mb-8">
                        <li className="flex items-center text-gray-700">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                          Browse events easily
                        </li>
                        <li className="flex items-center text-gray-700">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                          Quick registration
                        </li>
                        <li className="flex items-center text-gray-700">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                          Event notifications
                        </li>
                        <li className="flex items-center text-gray-700">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                          Connect with attendees
                        </li>
                      </ul>
                    </div>
                    <button
                      onClick={() => handleGetStarted('attendee')}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 text-lg font-semibold"
                    >
                      <span>Join Events</span>
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-8">
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="group bg-white text-indigo-600 px-8 py-4 rounded-xl border-2 border-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto text-lg font-semibold"
              >
                <span>Explore Features</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose EventOrganizer?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to make event management seamless and attendee experience unforgettable
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Organizer Access</h3>
              <p className="text-gray-600">
                Enterprise-grade security with verified organizer accounts and secure payment processing
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Verified Workflows</h3>
              <p className="text-gray-600">
                Streamlined processes with payment holds and automated verification systems
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart AI Support</h3>
              <p className="text-gray-600">
                AI-powered insights and recommendations to optimize your event management strategy
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Simple Experience</h3>
              <p className="text-gray-600">
                Intuitive interface designed for both organizers and attendees with minimal learning curve
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Info Section */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Meet the Developer
            </h2>
            
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-12">
              <div className="space-y-6">
                {/* Profile Image */}
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 p-1">
                  <img 
                    src="https://lh3.googleusercontent.com/a/ACg8ocIxzWgeObFvGWcch-bt6PyZGNvwKXBDAq42hClseWvJYFS2557N=s432-c-no"
                    alt="Udit Mehra"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold text-gray-900">Udit Mehra</h3>
                  <p className="text-xl text-indigo-600 font-semibold">Full-stack Developer</p>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Passionate about creating seamless digital experiences with React, Next.js, and MongoDB. 
                    Building solutions that bridge the gap between complex functionality and intuitive design.
                  </p>
                  
                  {/* Tech Stack */}
                  <div className="flex flex-wrap justify-center gap-3 pt-4">
                    {['React', 'Next.js', 'MongoDB', 'TypeScript', 'Tailwind CSS'].map((tech) => (
                      <span key={tech} className="bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-700 border border-gray-200">
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Social Links */}
                  <div className="flex justify-center space-x-6 pt-6">
                    <a
                      href="https://github.com/uditme"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                    >
                      <Github className="h-6 w-6" />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/udit-mehra-32692b1b3/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                    >
                      <Linkedin className="h-6 w-6" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600">
              Have questions or need support? I'd love to hear from you!
            </p>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-600">Email Support</p>
                  <a
                    href="mailto:uditmehra827@gmail.com"
                    className="text-xl font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    uditmehra827@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Logo and Description */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">EventOrganizer</span>
              </div>
              <p className="text-gray-400">
                Making event management and participation effortless for everyone.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quick Links</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#contact" className="block text-gray-400 hover:text-white transition-colors">Support</a>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Connect</h3>
              <div className="flex space-x-4">
                <a
                  href="https://github.com/uditme"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/udit-mehra-32692b1b3/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="mailto:uditmehra827@gmail.com"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 EventOrganizer. All rights reserved. Built with ❤️ by Udit Mehra</p>
          </div>
        </div>
      </footer>
    </div>
  );
});

export default LandingPage;
