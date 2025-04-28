"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gradient-to-br from-purple-400/20 to-blue-300/20 blur-xl"
          style={{
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
          }}
          animate={{
            x: [Math.random() * 1000, Math.random() * 1000],
            y: [Math.random() * 500, Math.random() * 500],
          }}
          transition={{
            duration: Math.random() * 20 + 15,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col relative overflow-hidden">
      <FloatingElements />
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 font-bold text-xl"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="h-4 w-4 rounded-full bg-white/30"
              />
            </div>
            <span>EduSync</span>
          </motion.div>
          <nav className="hidden md:flex gap-6">
            {["Features", "About", "Contact"].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * i }}
              >
                <Link
                  href={`#${item.toLowerCase()}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item}
                </Link>
              </motion.div>
            ))}
          </nav>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <Link href="/login">
              <Button
                variant="outline"
                className="overflow-hidden group relative"
              >
                <span className="relative z-10">Login</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </Link>
          </motion.div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="flex flex-col justify-center space-y-4"
              >
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-400 animate-gradient">
                      Modern School Management System
                    </span>
                  </h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="max-w-[600px] text-muted-foreground md:text-xl"
                  >
                    Streamline your school operations with our comprehensive
                    management system. Designed for students, teachers, and
                    administrators.
                  </motion.p>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex flex-col gap-2 min-[400px]:flex-row"
                >
                  <Link href="/login">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 relative overflow-hidden group"
                    >
                      <span className="relative z-10">Get Started</span>
                      <ArrowRight className="ml-2 h-4 w-4 relative z-10" />
                      <motion.div
                        className="absolute inset-0 bg-white/10"
                        initial={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 2.5, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        style={{ originX: 0, originY: 0.5 }}
                      />
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button
                      size="lg"
                      variant="outline"
                      className="relative overflow-hidden group"
                    >
                      <span className="relative z-10">Learn More</span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "0%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                className="flex items-center justify-center"
              >
                <div className="relative w-full aspect-square md:aspect-video lg:aspect-square overflow-hidden rounded-lg border bg-gradient-to-br from-purple-50 via-white to-blue-50 p-2 shadow-xl">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-4 p-4 w-full max-w-md">
                      <motion.div
                        animate={{
                          boxShadow: [
                            "0px 0px 0px rgba(139, 92, 246, 0.3)",
                            "0px 0px 20px rgba(139, 92, 246, 0.6)",
                            "0px 0px 0px rgba(139, 92, 246, 0.3)",
                          ],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="col-span-2 h-24 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500"
                      ></motion.div>
                      <motion.div
                        animate={{
                          boxShadow: [
                            "0px 0px 0px rgba(59, 130, 246, 0.3)",
                            "0px 0px 20px rgba(59, 130, 246, 0.6)",
                            "0px 0px 0px rgba(59, 130, 246, 0.3)",
                          ],
                        }}
                        transition={{
                          duration: 3,
                          delay: 0.5,
                          repeat: Infinity,
                        }}
                        className="h-32 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400"
                      ></motion.div>
                      <motion.div
                        animate={{
                          boxShadow: [
                            "0px 0px 0px rgba(99, 102, 241, 0.3)",
                            "0px 0px 20px rgba(99, 102, 241, 0.6)",
                            "0px 0px 0px rgba(99, 102, 241, 0.3)",
                          ],
                        }}
                        transition={{ duration: 3, delay: 1, repeat: Infinity }}
                        className="h-32 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-400"
                      ></motion.div>
                      <motion.div
                        animate={{
                          boxShadow: [
                            "0px 0px 0px rgba(6, 182, 212, 0.3)",
                            "0px 0px 20px rgba(6, 182, 212, 0.6)",
                            "0px 0px 0px rgba(6, 182, 212, 0.3)",
                          ],
                        }}
                        transition={{
                          duration: 3,
                          delay: 1.5,
                          repeat: Infinity,
                        }}
                        className="col-span-2 h-24 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500"
                      ></motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-slate-50 relative"
        >
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="container px-4 md:px-6"
          >
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="inline-block rounded-lg bg-purple-100 px-3 py-1 text-sm text-purple-600"
                >
                  Features
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="text-3xl font-bold tracking-tighter sm:text-5xl"
                >
                  Everything You Need
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
                >
                  Our platform provides comprehensive tools for students,
                  teachers, and administrators to manage all aspects of school
                  operations.
                </motion.p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-12">
              {[
                {
                  title: "Admin Dashboard",
                  description:
                    "Manage classes, timetables, and all school operations from a centralized dashboard.",
                  icon: (
                    <svg
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2z" />
                      <path d="M7 7h10" />
                      <path d="M7 11h10" />
                      <path d="M7 15h10" />
                    </svg>
                  ),
                  bgColor: "bg-purple-100",
                },
                {
                  title: "Teacher Dashboard",
                  description:
                    "Track attendance, manage grades, and communicate with students and parents.",
                  icon: (
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M3 7v-2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v2" />
                      <path d="M3 16v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2 -2v-2" />
                      <path d="M3 12a9 3 0 0 0 18 0a9 3 0 0 0 -18 0" />
                    </svg>
                  ),
                  bgColor: "bg-blue-100",
                },
                {
                  title: "Student Dashboard",
                  description:
                    "View timetables, assignments, announcements, and track academic progress.",
                  icon: (
                    <svg
                      className="h-6 w-6 text-indigo-600"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M22 10v6m-2-2h4" />
                      <path d="M4 19a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h16a2 2 0 0 1 2 2v4" />
                      <path d="M12 17v.01" />
                      <path d="M7 13h.01" />
                      <path d="M17 13h.01" />
                      <path d="M12 13h.01" />
                      <path d="M7 9h.01" />
                      <path d="M17 9h.01" />
                      <path d="M12 9h.01" />
                    </svg>
                  ),
                  bgColor: "bg-indigo-100",
                },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className={`rounded-full ${feature.bgColor} p-3`}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      </main>
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2025 EduSync. All rights reserved.
          </p>
          <div className="flex gap-4">
            {["Terms", "Privacy", "Contact"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground relative group"
              >
                {item}
                <motion.div
                  className="absolute -bottom-1 left-0 h-0.5 bg-purple-500"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            ))}
          </div>
        </div>
      </footer>
      <style jsx global>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          background-size: 300% 300%;
          animation: gradient 8s ease infinite;
        }
      `}</style>
    </div>
  );
}
