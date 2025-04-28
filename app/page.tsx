"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  GraduationCap,
  Users,
  Calendar,
  BarChart3,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Menu,
  X,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      title: "Smart Attendance",
      description: "Automated attendance tracking with real-time updates",
      icon: <CheckCircle2 className="h-6 w-6" />,
    },
    {
      title: "Grade Management",
      description: "Efficient grade tracking and reporting system",
      icon: <BarChart3 className="h-6 w-6" />,
    },
    {
      title: "Class Scheduling",
      description: "Intelligent timetable management",
      icon: <Calendar className="h-6 w-6" />,
    },
    {
      title: "Communication Hub",
      description: "Seamless communication between teachers and students",
      icon: <MessageSquare className="h-6 w-6" />,
    },
  ];

  const stats = [
    { label: "Students", value: "5000+", icon: <Users className="h-6 w-6" /> },
    {
      label: "Teachers",
      value: "200+",
      icon: <GraduationCap className="h-6 w-6" />,
    },
    { label: "Classes", value: "100+", icon: <BookOpen className="h-6 w-6" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-xl">EduSync</span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {["Features", "About", "Contact"].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  {item}
                </Link>
              ))}
              {!session ? (
                <Link href="/login">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                    Login
                  </Button>
                </Link>
              ) : (
                <Link href={`/${session.user.role.toLowerCase()}/dashboard`}>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                    Dashboard
                  </Button>
                </Link>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-2 space-y-2">
              {["Features", "About", "Contact"].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="block py-2 text-gray-600 hover:text-purple-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
              {!session ? (
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                    Login
                  </Button>
                </Link>
              ) : (
                <Link
                  href={`/${session.user.role.toLowerCase()}/dashboard`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                    Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50" />
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gradient-to-br from-purple-200/30 to-blue-200/30"
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left space-y-8"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-600"
              >
                <Sparkles className="h-5 w-5" />
                <span className="font-medium">Welcome to EduSync</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900">
                Transform Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  School
                </span>{" "}
                with Smart Management
              </h1>

              <p className="text-xl text-gray-600 max-w-2xl">
                A comprehensive school management system that streamlines
                operations, enhances learning, and connects the entire school
                community.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {!session ? (
                  <>
                    <Link href="/login">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/about">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-purple-200 hover:bg-purple-50 transition-all duration-300"
                      >
                        Learn More
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link href={`/${session.user.role.toLowerCase()}/dashboard`}>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-purple-600">
                    5000+
                  </div>
                  <div className="text-gray-600">Students</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-blue-600">200+</div>
                  <div className="text-gray-600">Teachers</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-indigo-600">100+</div>
                  <div className="text-gray-600">Classes</div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Column - Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                {/* Main Card */}
                <motion.div
                  initial={{ scale: 0.9, rotate: -2 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white rounded-2xl shadow-xl p-6 transform"
                >
                  <div className="grid grid-cols-2 gap-4">
                    {/* Calendar Card */}
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-purple-50 rounded-xl p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-600">
                          Today
                        </span>
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-purple-900">
                        15
                      </div>
                      <div className="text-xs text-purple-600">Classes</div>
                    </motion.div>

                    {/* Attendance Card */}
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-blue-50 rounded-xl p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-600">
                          Attendance
                        </span>
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-blue-900">
                        95%
                      </div>
                      <div className="text-xs text-blue-600">This Week</div>
                    </motion.div>

                    {/* Grades Card */}
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-indigo-50 rounded-xl p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-indigo-600">
                          Grades
                        </span>
                        <BarChart3 className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="text-2xl font-bold text-indigo-900">
                        A+
                      </div>
                      <div className="text-xs text-indigo-600">Average</div>
                    </motion.div>

                    {/* Messages Card */}
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-pink-50 rounded-xl p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-pink-600">
                          Messages
                        </span>
                        <MessageSquare className="h-4 w-4 text-pink-600" />
                      </div>
                      <div className="text-2xl font-bold text-pink-900">12</div>
                      <div className="text-xs text-pink-600">New</div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Floating Elements */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-8 -left-8 bg-purple-100 rounded-full p-4 shadow-lg"
                >
                  <Users className="h-6 w-6 text-purple-600" />
                </motion.div>

                <motion.div
                  animate={{
                    y: [0, 10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                  className="absolute -bottom-8 -right-8 bg-blue-100 rounded-full p-4 shadow-lg"
                >
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section (Features) */}
      <section
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        id="features"
      >
        {/* Minimalistic soft radial gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(167,139,250,0.08)_0%,rgba(59,130,246,0.04)_60%,white_100%)]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-600 mb-4"
            >
              <Sparkles className="h-5 w-5" />
              <span className="font-medium">Why Choose EduSync?</span>
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Experience the Future of Education
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how EduSync transforms the way schools operate, making
              education more efficient and engaging for everyone.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="group relative h-full flex"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300" />
              <div className="relative bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-6">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Smart Scheduling
                </h3>
                <p className="text-gray-600 mb-4 flex-1">
                  Intelligent timetable management that adapts to your school's
                  needs, ensuring optimal class organization.
                </p>
                <div className="flex items-center text-purple-600 font-medium mt-auto">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="group relative h-full flex"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300" />
              <div className="relative bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-6">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Real-time Analytics
                </h3>
                <p className="text-gray-600 mb-4 flex-1">
                  Get instant insights into student performance, attendance
                  trends, and academic progress.
                </p>
                <div className="flex items-center text-blue-600 font-medium mt-auto">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="group relative h-full flex"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300" />
              <div className="relative bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-6">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Seamless Communication
                </h3>
                <p className="text-gray-600 mb-4 flex-1">
                  Connect teachers, students, and parents through our integrated
                  communication platform.
                </p>
                <div className="flex items-center text-indigo-600 font-medium mt-auto">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="group relative h-full flex"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300" />
              <div className="relative bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pink-100 text-pink-600 mb-6">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Automated Attendance
                </h3>
                <p className="text-gray-600 mb-4 flex-1">
                  Streamline attendance tracking with our smart system that
                  saves time and reduces errors.
                </p>
                <div className="flex items-center text-pink-600 font-medium mt-auto">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
              className="group relative h-full flex"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300" />
              <div className="relative bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-100 text-cyan-600 mb-6">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Digital Learning
                </h3>
                <p className="text-gray-600 mb-4 flex-1">
                  Access course materials, assignments, and resources anytime,
                  anywhere.
                </p>
                <div className="flex items-center text-cyan-600 font-medium mt-auto">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
              className="group relative h-full flex"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300" />
              <div className="relative bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-600 mb-6">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Teacher Support
                </h3>
                <p className="text-gray-600 mb-4 flex-1">
                  Tools and resources to help teachers focus on what matters
                  most - teaching.
                </p>
                <div className="flex items-center text-amber-600 font-medium mt-auto">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        id="testimonials"
      >
        {/* Unique Animated Background: Animated pastel bubbles */}
        <div className="absolute inset-0 z-0">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 120 + 60}px`,
                height: `${Math.random() * 120 + 60}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `linear-gradient(135deg, #f9a8d4 40%, #a5b4fc 100%)`,
                opacity: 0.18 + Math.random() * 0.12,
                filter: "blur(2px)",
              }}
              animate={{
                y: [0, Math.random() * 40 - 20, 0],
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-600 mb-4"
            >
              <Sparkles className="h-5 w-5" />
              <span className="font-medium">What Our Users Say</span>
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from schools that have transformed their operations with
              EduSync
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {[
              {
                name: "Sarah Johnson",
                role: "Principal, Greenfield High",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
                quote:
                  "EduSync has revolutionized how we manage our school. The attendance tracking and communication features are game-changers.",
              },
              {
                name: "Michael Chen",
                role: "Teacher, Riverside Academy",
                image:
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
                quote:
                  "The grade management system is intuitive and saves me hours every week. I can focus more on teaching.",
              },
              {
                name: "Emma Davis",
                role: "Parent, Oakwood Elementary",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
                quote:
                  "I love being able to track my child's progress and communicate with teachers easily. It's made a huge difference.",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative h-full flex"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300" />
                <div className="relative bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {testimonial.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic flex-1">
                    "{testimonial.quote}"
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        id="pricing"
      >
        {/* Minimalistic background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50 to-white" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-600 mb-4"
            >
              <Sparkles className="h-5 w-5" />
              <span className="font-medium">Simple Pricing</span>
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Flexible pricing options for schools of all sizes
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {[
              {
                name: "Basic",
                price: "₹2,999",
                period: "/mo",
                features: [
                  "Up to 500 students",
                  "Basic attendance tracking",
                  "Grade management",
                  "Email support",
                ],
                highlight: false,
              },
              {
                name: "Pro",
                price: "₹5,999",
                period: "/mo",
                features: [
                  "Up to 2000 students",
                  "Advanced analytics",
                  "Parent portal",
                  "Priority support",
                  "Custom reports",
                ],
                highlight: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "",
                features: [
                  "Unlimited students",
                  "Custom integrations",
                  "Dedicated support",
                  "API access",
                  "Custom branding",
                ],
                highlight: false,
              },
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`group relative h-full flex`}
                whileHover={{
                  y: -8,
                  boxShadow: "0 8px 32px 0 rgba(99,102,241,0.10)",
                }}
              >
                <div
                  className={`relative w-full bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full px-8 py-10 ${
                    plan.highlight ? "border-2 border-purple-400 shadow-md" : ""
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute top-4 right-4 bg-purple-100 text-purple-600 text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-6 flex items-end gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-gray-500 text-lg">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-gray-600"
                      >
                        <CheckCircle2 className="h-5 w-5 text-purple-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-auto ${
                      plan.highlight
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    Get Started
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        id="contact"
      >
        {/* Unique Animated Background: Animated paper planes and clouds */}
        <div className="absolute inset-0 z-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 60 - 30, 0],
                y: [0, Math.random() * 20 - 10, 0],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: Math.random() * 12 + 8,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeInOut",
              }}
            >
              <span className="inline-block text-3xl">✈️</span>
            </motion.div>
          ))}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, Math.random() * 15 - 7, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
            >
              <span className="inline-block text-4xl text-blue-200">☁️</span>
            </motion.div>
          ))}
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-600 mb-4"
            >
              <Sparkles className="h-5 w-5" />
              <span className="font-medium">Get in Touch</span>
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Let's Transform Your School
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ready to take your school to the next level? Contact us today for
              a demo.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300" />
                  <div className="relative bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-4">
                      <MailIcon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Email Us
                    </h3>
                    <p className="text-gray-600">hello@edusync.com</p>
                  </div>
                </div>

                <div className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300" />
                  <div className="relative bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                      <PhoneIcon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Call Us
                    </h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300" />
                <div className="relative bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                    <MapPinIcon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Visit Us
                  </h3>
                  <p className="text-gray-600">
                    123 Education Street, Tech City, TC 12345
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300" />
              <div className="relative bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <form className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="Your message"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    Send Message
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-xl text-white">EduSync</span>
              </div>
              <p className="text-gray-400">
                Transforming education through innovative technology solutions.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                {["Features", "Pricing", "Testimonials", "Updates"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href={`#${item.toLowerCase()}`}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                {["About", "Careers", "Blog", "Contact"].map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                {["Privacy", "Terms", "Security", "Cookies"].map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © 2024 EduSync. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              {["Twitter", "Facebook", "LinkedIn", "Instagram"].map(
                (social) => (
                  <a
                    key={social}
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {social}
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
