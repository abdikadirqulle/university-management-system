import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  School,
  Users,
  GraduationCap,
  Calendar,
  Settings,
  ArrowRight,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { StarsBackground } from "@/components/ui/stars-background";
import { LandingNav } from "@/components/landing-nav";

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Simulate a loading effect
  useState(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  });

  const features = [
    {
      icon: <School className="h-8 w-8 text-primary" />,
      title: "Academic Management",
      description:
        "Streamline curriculum planning, course scheduling, and faculty assignments.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Student Information System",
      description:
        "Manage student records, admissions, attendance, and performance tracking.",
    },
    {
      icon: <GraduationCap className="h-8 w-8 text-primary" />,
      title: "Faculty Portal",
      description:
        "Provide faculty with tools for grading, attendance, and course materials.",
    },
    {
      icon: <Calendar className="h-8 w-8 text-primary" />,
      title: "Academic Calendar",
      description:
        "Organize semesters, events, exam schedules, and important deadlines.",
    },
    {
      icon: <Settings className="h-8 w-8 text-primary" />,
      title: "Financial Administration",
      description:
        "Handle tuition, scholarships, payroll, and financial reporting.",
    },
  ];

  const testimonials = [
    {
      name: "Eng.Abdikarin gelle",
      role: "Dean of Computer Science",
      content:
        "This system has transformed how we manage academic operations. The efficiency gains have been remarkable.",
      avatar: "RC",
    },
    {
      name: "usame abdiwahab",
      role: "Student Affairs Director",
      content:
        "The student management features have streamlined our processes and improved service delivery tremendously.",
      avatar: "SJ",
    },
    {
      name: "Prof. maxamud",
      role: "Faculty Member",
      content:
        "As an instructor, I appreciate how easy it is to track student progress and manage course materials.",
      avatar: "MG",
    },
  ];

  const stats = [
    { value: "98%", label: "User Satisfaction" },
    { value: "45%", label: "Increase in Productivity" },
    { value: "30+", label: "University Partners" },
    { value: "10k+", label: "Active Users" },
  ];

  return (
    <StarsBackground>
      <LandingNav />

      {/* Hero Section */}
      <section className="relative pt-20 md:pt-28 lg:pt-32">
        <div className="container mx-auto px-4 md:px-6">
          <div
            className={`max-w-3xl mx-auto text-center transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Next-Generation University Management System
            </h1>
            <p className="mt-6 text-lg text-white/70 max-w-2xl mx-auto">
              A comprehensive $10,000 solution designed to streamline academic
              operations, enhance student experiences, and optimize
              administrative processes.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="animate-pulse w-full sm:w-auto"
              >
                <Link to="/login">Get Started</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/20 bg-white/5 hover:bg-white/10 w-full sm:w-auto text-white hover:text-white"
              >
                <Link to="/login" className="flex items-center gap-2">
                  Learn More <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div
          className={`mt-16 md:mt-20 transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
            <div className="rounded-xl shadow-xl ring-1 ring-white/10 overflow-hidden border border-white/10">
              <img
                src="/dashboard-demo.png"
                alt="University Management System Dashboard"
                className="w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28" id="features">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Comprehensive Features
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Our platform offers a complete suite of tools designed to address
              every aspect of university management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-white/5 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-white/10 hover:shadow-md transition-all duration-300 hover:translate-y-[-4px] ${
                  isVisible ? "opacity-100" : "opacity-0"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  {feature.title}
                </h3>
                <p className="text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/5" id="pricing">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`text-center transition-all duration-500 ${
                  isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <p className="text-4xl md:text-5xl font-bold text-primary">
                  {stat.value}
                </p>
                <p className="text-sm md:text-base text-white/70">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-28" id="testimonials">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-white">
              What Our Users Say
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Hear from the educators and administrators who use our platform
              every day.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Carousel className="w-full">
              <CarouselContent>
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index}>
                    <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl shadow-sm border border-white/10 text-center">
                      <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary font-semibold text-xl">
                          {testimonial.avatar}
                        </div>
                      </div>
                      <blockquote className="text-lg italic mb-6 text-white">
                        {testimonial.content}
                      </blockquote>
                      <div>
                        <p className="font-medium text-white">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-white/70">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center mt-8 gap-2">
                <CarouselPrevious className="relative inset-0 translate-y-0 bg-white/10 text-white border-white/20 hover:bg-white/20" />
                <CarouselNext className="relative inset-0 translate-y-0 bg-white/10 text-white border-white/20 hover:bg-white/20" />
              </div>
            </Carousel>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white/5" id="contact">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-white">
              Ready to Transform Your University Administration?
            </h2>
            <p className="text-lg mb-8 text-white/70">
              Join over 30+ leading universities that have already upgraded
              their management systems.
            </p>
            <Button asChild size="lg" className="animate-pulse px-8">
              <Link to="/login">Schedule a Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-md text-white py-12 border-t border-white/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <School className="h-8 w-8 text-primary mr-2" />
              <span className="text-xl font-semibold">Scholar Nexus</span>
            </div>
            <div className="flex flex-wrap gap-4 md:gap-8 justify-center">
              <a
                href="#features"
                className="hover:text-primary transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="hover:text-primary transition-colors"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="hover:text-primary transition-colors"
              >
                Testimonials
              </a>
              <a
                href="#contact"
                className="hover:text-primary transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/60">
            &copy; {new Date().getFullYear()} Scholar Nexus. All rights
            reserved.
          </div>
        </div>
      </footer>
    </StarsBackground>
  );
};

export default Index;
