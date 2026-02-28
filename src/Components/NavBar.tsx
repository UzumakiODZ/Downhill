import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHillAvalanche,
  faHouse,
  faComments,
  faChartColumn,
  faBars,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { to: "/", label: "Home", icon: faHouse },
    { to: "/discussion", label: "Discussion", icon: faComments },
    { to: "/placement-stats", label: "Placement & Stats", icon: faChartColumn },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${
        scrolled 
          ? "bg-[#121212]/80 backdrop-blur-xl py-4 shadow-2xl border-b border-white/5" 
          : "bg-[#121212] py-6 border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-[60px] flex justify-between items-center">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 group">
          <FontAwesomeIcon
            icon={faHillAvalanche}
            className="text-[#00e5ff] text-2xl transform group-hover:rotate-12 transition-transform duration-300"
          />
          <span className="text-2xl font-black tracking-tighter text-white uppercase italic">
            Downhill
          </span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <li key={link.to} className="relative">
                <Link
                  to={link.to}
                  className={`flex items-center gap-2.5 text-sm font-semibold tracking-wide transition-all duration-300 hover:text-[#00e5ff] ${
                    isActive ? "text-[#00e5ff]" : "text-[#888]"
                  }`}
                >
                  <FontAwesomeIcon icon={link.icon} className="text-[12px]" />
                  {link.label}
                </Link>
                {/* Active Indicator Underline */}
                {isActive && (
                  <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-[#00e5ff] rounded-full shadow-[0_0_8px_#00e5ff] animate-in fade-in zoom-in duration-300" />
                )}
              </li>
            );
          })}
        </ul>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} className="text-xl" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm transition-all duration-500 md:hidden ${
          menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-[300px] bg-[#121212] border-l border-white/5 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] md:hidden z-[101] ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-10">
          <div className="flex justify-between items-center mb-12">
            <span className="text-[10px] font-black tracking-[3px] text-[#444] uppercase">Navigation</span>
            <button onClick={() => setMenuOpen(false)} className="text-[#888] hover:text-white transition-colors">
              <FontAwesomeIcon icon={faXmark} className="text-xl" />
            </button>
          </div>

          <ul className="flex flex-col gap-8">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-5 text-xl font-bold transition-all ${
                    location.pathname === link.to ? "text-[#00e5ff] translate-x-2" : "text-[#666] hover:text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={link.icon} className="text-sm w-6" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-auto border-t border-white/5 pt-8">
            <p className="text-[#444] text-[12px] font-medium italic">
              © 2026 Downhill Community
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;