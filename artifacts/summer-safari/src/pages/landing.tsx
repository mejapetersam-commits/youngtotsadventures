import { Link } from "wouter";
import { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, Calendar, Clock, Bus, Apple, PhoneCall, MessageCircle,
  ChevronRight, Check, CheckCircle2, Users, Shield, Heart,
  ChevronDown, ChevronUp, Sparkles, Award, Camera, Utensils,
  Mail, Compass, BookOpen, Leaf, PartyPopper
} from "lucide-react";
import { useGetRegistrationCount } from "@workspace/api-client-react";

// Real Images
import enankaLogo from "@assets/Enanka_art_gallery_logo_1781863628482.png";
import enankaPaintings from "@assets/Enanka_1_1782420466047.jpg";
import enankaPainting from "@assets/Enanka_7_1782420523829.jpg";

import pinsLogo from "@assets/Pins_logo_1781863628483.jpg";
import pinsBowling from "@assets/Pins_1_1782420615995.jpg";
import pinsSlides from "@assets/Pins_2_1782420640979.jpg";
import pinsPlayground from "@assets/Pins_5_1782420667125.jpeg";

import stedmakLogo from "@assets/Stedmak_hotels_&_gardens_logo_1781863628483.jpg";
import stedmakNight from "@assets/Stedmak_1_1782420736044.jpg";
import stedmakAerial from "@assets/Stedmak_2_1782420750496.jpg";
import stedmakPlayground from "@assets/Stedmak_4_1782420793986.jpg";

import ginahLogo from "@assets/Ginah's_bakery_1781863628482.png";
import ginahCake from "@assets/Gina_3_1782420545576.jpg";
import ginahCupcakes from "@assets/Gina_4_1782420577959.jpg";
import ginahSafariCake from "@assets/Gina_5_1782420597645.jpg";

import cinemaxLogo from "@assets/Cinemax_logo_1781863560866.png";
import centuryConcession from "@assets/Century_1_1782420390082.jpeg";
import centuryOrange from "@assets/Century_3_1782420407142.jpg";
import centuryImax from "@assets/Century_4_1782420416012.jpg";

const HERO_SLIDES = [
  { src: enankaPaintings, alt: "Art Gallery – Day 1", caption: "Day 1 · Enanka Art Gallery" },
  { src: pinsPlayground, alt: "Kids Playground – Day 2", caption: "Day 2 · Pins Entertainment" },
  { src: stedmakAerial, alt: "Adventure Park – Day 3", caption: "Day 3 · Stedmak Gardens" },
  { src: ginahSafariCake, alt: "Baking – Day 4", caption: "Day 4 · Ginah's Bakery" },
  { src: centuryImax, alt: "Movie Day – Day 5", caption: "Day 5 · Movie Celebration" },
];

const SAFARI_START = new Date("2026-07-06T08:15:00+03:00");

function useCountdown(target: Date) {
  const calc = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, started: true };
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { days, hours, minutes, seconds, started: false };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  });
  return t;
}

const WHY_ITEMS = [
  { icon: Shield, label: "Safe & Supervised", desc: "Professional supervision at all times" },
  { icon: Users, label: "Trained Professionals", desc: "Caring, experienced team" },
  { icon: Bus, label: "Organized Transport", desc: "Safe travel to every venue" },
  { icon: Utensils, label: "Lunch & Water Daily", desc: "Nutritious meals every day" },
  { icon: Sparkles, label: "Fun Educational Trips", desc: "Experiences that inspire curiosity" },
  { icon: Award, label: "Carefully Planned", desc: "Every detail thought through" },
  { icon: Heart, label: "Child-Centered", desc: "Every child feels special" },
  { icon: Camera, label: "Memorable Adventures", desc: "Moments they'll treasure forever" },
];

const FAQS = [
  {
    q: "What age groups can attend?",
    a: "The Summer Safari is designed for children aged 4–12 years. All activities are carefully selected to be age-appropriate and engaging for this range.",
  },
  {
    q: "What is included in the KES 21,500 fee?",
    a: "The fee covers transport to and from all venues, all entry fees and activity costs, lunch and drinking water daily, art materials, baking supplies, and full professional supervision throughout the program.",
  },
  {
    q: "How do children travel to the venues?",
    a: "A dedicated bus transports all children safely from the assembly point (outside Cavina School, Kilungu Road) to each day's venue. The bus departs at 8:15 AM and returns children by 3:00 PM.",
  },
  {
    q: "Who supervises the children?",
    a: "Our experienced and trained team of educators and coordinators supervise the children at all times. We maintain a low child-to-supervisor ratio to ensure every child receives personal attention.",
  },
  {
    q: "What should children bring each day?",
    a: "Children should wear comfortable, sporty clothing and closed shoes. They may bring a light snack if desired. Please do not send valuables — all essential items including lunch and water are provided.",
  },
  {
    q: "How do I make payment?",
    a: "Payment is made via M-Pesa. Send the full amount of KES 21,500 to Judie Wambua (0720 764 275) or Celestine Sabuti (0724 810 846). Upload your M-Pesa screenshot during registration to confirm payment.",
  },
  {
    q: "What happens in case of an emergency?",
    a: "We have a first-aid trained team member on site at all times. In any emergency, parents/guardians and emergency contacts will be notified immediately. All children's medical information is reviewed before the program.",
  },
  {
    q: "How do I complete the consent form?",
    a: "The digital consent and liability form is included in Step 5 of the online registration. You will read and accept the waiver, then sign digitally using the signature pad directly on your phone or computer.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-amber-50/50 transition-colors"
      >
        <span className="font-semibold text-foreground pr-4">{q}</span>
        {open ? <ChevronUp className="h-5 w-5 text-primary shrink-0" /> : <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 bg-white text-muted-foreground leading-relaxed border-t border-border/50">
          <p className="pt-4">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function Landing() {
  const { data: countData } = useGetRegistrationCount();
  const countdown = useCountdown(SAFARI_START);

  const [slideIdx, setSlideIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSlideIdx(i => (i + 1) % HERO_SLIDES.length), 4500);
    return () => clearInterval(id);
  }, []);

  const item: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
  };
  const stagger: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const currentSlide = HERO_SLIDES[slideIdx];

  return (
    <div className="min-h-screen bg-background font-sans overflow-x-hidden">

      {/* ── Floating Buttons ── */}
      <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-3 items-end">
        <a
          href="https://wa.me/254720764275?text=Hi%2C%20I%27m%20interested%20in%20Young%20Tots%20Summer%20Safari%202026"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-xl transition-all font-semibold text-sm"
        >
          <MessageCircle className="h-5 w-5" /> WhatsApp
        </a>
        <Link href="/register">
          <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-full shadow-xl transition-all font-bold text-sm">
            <ChevronRight className="h-5 w-5" /> Register Now
          </button>
        </Link>
      </div>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="font-serif font-bold text-foreground">
              <span className="text-xl">Young Tots</span>
              <span className="hidden sm:inline text-base font-medium text-muted-foreground ml-1">Edventures</span>
            </span>
          </a>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex text-sm">
              <a href="#why-us">Why Us</a>
            </Button>
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex text-sm">
              <a href="#schedule">Schedule</a>
            </Button>
            <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex text-sm">
              <a href="#faq">FAQ</a>
            </Button>
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex text-sm">
              <a href="#contact">Contact</a>
            </Button>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90 text-white font-medium shadow-md text-sm h-9">
                Register Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Sliding background images */}
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === slideIdx ? 1 : 0 }}
          >
            <img src={slide.src} alt={slide.alt} className="w-full h-full object-cover" />
          </div>
        ))}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

        {/* Slide dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIdx(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === slideIdx}
              className={`h-2 rounded-full transition-all ${i === slideIdx ? "w-6 bg-primary" : "w-2 bg-white/50"}`}
            />
          ))}
        </div>

        {/* Caption */}
        <div className="absolute bottom-16 right-6 z-20 hidden sm:block">
          <Badge className="bg-black/40 text-white border-white/20 text-xs backdrop-blur-sm">
            📸 {currentSlide.caption}
          </Badge>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-16">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.span variants={item} className="inline-block py-1.5 px-4 rounded-full bg-primary/90 text-white font-semibold text-sm mb-6 tracking-widest uppercase shadow-lg">
              ✦ Summer Safari 2026 ✦
            </motion.span>

            <motion.h1 variants={item} className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-white leading-tight mb-4 drop-shadow-lg">
              Young Tots<br />
              <span className="text-primary">Edventures</span>
            </motion.h1>

            <motion.p variants={item} className="text-xl md:text-2xl text-white/90 mb-2 font-light tracking-wide">
              Adventure • Discovery • Learning • Fun
            </motion.p>
            <motion.p variants={item} className="text-base md:text-lg text-white/70 mb-8">
              6th – 10th July 2026 &nbsp;·&nbsp; Nairobi, Kenya &nbsp;·&nbsp; KES 21,500 / child
            </motion.p>

            {/* Countdown */}
            {!countdown.started && (
              <motion.div variants={item} className="flex justify-center gap-3 mb-10">
                {[
                  { v: countdown.days, l: "Days" },
                  { v: countdown.hours, l: "Hours" },
                  { v: countdown.minutes, l: "Mins" },
                  { v: countdown.seconds, l: "Secs" },
                ].map(({ v, l }) => (
                  <div key={l} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 min-w-[70px]">
                    <div className="text-3xl md:text-4xl font-bold text-white tabular-nums">
                      {String(v).padStart(2, "0")}
                    </div>
                    <div className="text-xs text-white/60 uppercase tracking-widest mt-1">{l}</div>
                  </div>
                ))}
              </motion.div>
            )}
            {countdown.started && (
              <motion.div variants={item} className="mb-10">
                <Badge className="bg-green-500 text-white text-base px-6 py-2 rounded-full shadow-lg">
                  🎉 Safari is happening right now!
                </Badge>
              </motion.div>
            )}

            <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-10 bg-primary hover:bg-primary/90 text-white shadow-2xl rounded-full font-bold transition-all hover:scale-105">
                  Register Now <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto text-lg h-14 px-8 border-2 border-white/60 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full">
                <a href="#schedule">View Activities</a>
              </Button>
            </motion.div>

            {/* Spot counter */}
            {countData && (
              <motion.div variants={item}>
                <div className={`inline-flex flex-col items-center gap-3 px-6 py-4 rounded-2xl shadow-md border-2 backdrop-blur-md ${countData.spotsLeft <= 5 ? "bg-red-900/40 border-red-400" : countData.spotsLeft <= 10 ? "bg-amber-900/40 border-amber-400" : "bg-green-900/40 border-green-400"}`}>
                  <div className="flex items-center gap-2">
                    <Users className={`h-5 w-5 ${countData.spotsLeft <= 5 ? "text-red-300" : countData.spotsLeft <= 10 ? "text-amber-300" : "text-green-300"}`} />
                    <span className={`font-bold text-sm sm:text-base ${countData.spotsLeft <= 5 ? "text-red-200" : countData.spotsLeft <= 10 ? "text-amber-200" : "text-green-200"}`}>
                      {countData.spotsLeft === 0
                        ? "All spots are filled!"
                        : countData.spotsLeft <= 5
                        ? `Only ${countData.spotsLeft} spot${countData.spotsLeft === 1 ? "" : "s"} remaining — register now!`
                        : `${countData.spotsLeft} of ${countData.capacity} spots still available`}
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2 min-w-[200px]">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ${countData.spotsLeft <= 5 ? "bg-red-400" : countData.spotsLeft <= 10 ? "bg-amber-400" : "bg-green-400"}`}
                      style={{ width: `${Math.min(100, (countData.total / countData.capacity) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/60">{countData.total} families registered so far</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Why Choose Young Tots ── */}
      <section id="why-us" className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.span variants={item} className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4 uppercase tracking-wide">
              Why Families Trust Us
            </motion.span>
            <motion.h2 variants={item} className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Why Parents Choose<br />Young Tots Edventures
            </motion.h2>
            <motion.p variants={item} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We go beyond a simple holiday program. Every detail is designed to give your child a safe, enriching, and unforgettable experience.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {WHY_ITEMS.map(({ icon: Icon, label, desc }) => (
              <motion.div key={label} variants={item}>
                <Card className="text-center p-5 md:p-6 hover:shadow-lg transition-all border hover:border-primary/30 cursor-default group h-full">
                  <CardContent className="p-0 flex flex-col items-center gap-3">
                    <div className="h-12 w-12 bg-primary/10 group-hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-bold text-foreground text-sm md:text-base">{label}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">{desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats strip */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 bg-gradient-to-r from-secondary to-secondary/90 rounded-3xl p-8 text-white text-center">
            {[
              { n: "5", l: "Exciting Days" },
              { n: "Ages 4–12", l: "Welcome" },
              { n: "30", l: "Limited Slots" },
              { n: "100%", l: "Supervised" },
            ].map(({ n, l }) => (
              <motion.div key={l} variants={item}>
                <div className="text-4xl md:text-5xl font-bold text-primary mb-1">{n}</div>
                <div className="text-white/80 text-sm font-medium">{l}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── About ── */}
      <section className="py-16 bg-amber-50 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-foreground">About The Safari</h2>
          <p className="text-lg md:text-xl leading-relaxed text-muted-foreground font-light max-w-3xl mx-auto">
            Get ready for an unforgettable Summer Safari filled with adventure, discovery, laughter, and endless fun. Our carefully designed 5-day experience combines exciting excursions, creative activities, and enriching experiences that inspire curiosity, build confidence, and create lasting friendships.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {["Nairobi, Kenya", "Mon 6 – Fri 10 July 2026", "Ages 4–12", "8:15 AM – 3:00 PM Daily", "Assembly: Cavina School, Kilungu Rd"].map(t => (
              <span key={t} className="bg-white text-secondary font-medium text-sm px-4 py-2 rounded-full shadow-sm border border-border">
                {t}
              </span>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { icon: Compass, label: "Adventure" },
              { icon: BookOpen, label: "Learning" },
              { icon: Leaf, label: "Nature" },
              { icon: PartyPopper, label: "Fun" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 bg-white rounded-2xl py-5 px-3 shadow-sm border border-border">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <span className="font-bold text-secondary">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5-Day Schedule ── */}
      <section id="schedule" className="py-24 px-4 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.span variants={item} className="inline-block py-1 px-3 rounded-full bg-secondary/10 text-secondary font-semibold text-sm mb-4 uppercase tracking-wide">
              The Itinerary
            </motion.span>
            <motion.h2 variants={item} className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              5-Day Schedule
            </motion.h2>
            <motion.p variants={item} className="text-lg text-muted-foreground">
              Every day brings a new destination and a new adventure.
            </motion.p>
          </motion.div>

          <div className="space-y-10">
            {/* Day 1 */}
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={item}>
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow bg-white group">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-2/5 p-1 bg-amber-50 overflow-hidden">
                    <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden h-[260px] md:h-full md:min-h-[320px]">
                      <img src={enankaPaintings} alt="Art exhibition" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <img src={enankaPainting} alt="Child painting" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  </div>
                  <div className="p-6 md:p-10 flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-primary/10 text-primary border-primary/20 font-bold uppercase tracking-wider">Day 1 · Monday 6th July</Badge>
                      <img src={enankaLogo} alt="Enanka Logo" className="h-8 object-contain" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-serif font-bold mb-2">Enanka Art Gallery</h3>
                    <p className="text-muted-foreground mb-6 flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /> Westlands</p>
                    <ul className="space-y-2 grid sm:grid-cols-2 gap-x-4">
                      {["Art exploration & creativity", "Self-expression workshops", "Interactive gallery exhibitions", "Kenyan art and culture"].map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-foreground/80 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Day 2 */}
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={item}>
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow bg-white group">
                <div className="flex flex-col md:flex-row-reverse">
                  <div className="w-full md:w-2/5 p-1 bg-green-50 overflow-hidden">
                    <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden h-[260px] md:h-full md:min-h-[320px]">
                      <img src={pinsPlayground} alt="Indoor playground" className="w-full h-full object-cover col-span-2 group-hover:scale-105 transition-transform duration-700" />
                      <img src={pinsSlides} alt="Play slides" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <img src={pinsBowling} alt="Bowling" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  </div>
                  <div className="p-6 md:p-10 flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-accent/10 text-accent border-accent/20 font-bold uppercase tracking-wider">Day 2 · Tuesday 7th July</Badge>
                      <img src={pinsLogo} alt="Pins Logo" className="h-8 object-contain rounded" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-serif font-bold mb-2">The Jungle – Pins Entertainment</h3>
                    <p className="text-muted-foreground mb-6 flex items-center gap-1.5"><MapPin className="h-4 w-4 text-accent" /> Sarit Centre</p>
                    <ul className="space-y-2 grid sm:grid-cols-2 gap-x-4">
                      {["Interactive games & rides", "Adventure activities", "Team building challenges", "Fun competitions"].map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-foreground/80 text-sm">
                          <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" /> {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Day 3 */}
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={item}>
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow bg-white group">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-2/5 p-1 bg-amber-50 overflow-hidden">
                    <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden min-h-[260px]">
                      <img src={stedmakAerial} alt="Adventure park" className="w-full h-full object-cover min-h-[260px] col-span-2 group-hover:scale-105 transition-transform duration-700" />
                      <img src={stedmakPlayground} alt="Playground" className="w-full h-full object-cover min-h-[200px] group-hover:scale-105 transition-transform duration-700" />
                      <img src={stedmakNight} alt="Gardens" className="w-full h-full object-cover min-h-[200px] group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  </div>
                  <div className="p-6 md:p-10 flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-secondary/10 text-secondary border-secondary/20 font-bold uppercase tracking-wider">Day 3 · Wednesday 8th July</Badge>
                      <img src={stedmakLogo} alt="Stedmak Logo" className="h-10 object-contain" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-serif font-bold mb-2">Stedmak Gardens & Recreation</h3>
                    <p className="text-muted-foreground mb-6 flex items-center gap-1.5"><MapPin className="h-4 w-4 text-secondary" /> Karen</p>
                    <ul className="space-y-2 grid sm:grid-cols-2 gap-x-4">
                      {["Animal park tour", "Train rides & Trampolines", "Bouncing castles & Rock climbing", "Floating restaurant experience"].map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-foreground/80 text-sm">
                          <Check className="h-4 w-4 text-secondary shrink-0 mt-0.5" /> {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Day 4 */}
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={item}>
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow bg-white group">
                <div className="flex flex-col md:flex-row-reverse">
                  <div className="w-full md:w-2/5 p-1 bg-amber-50 overflow-hidden">
                    <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden h-[260px] md:h-full md:min-h-[320px]">
                      <img src={ginahSafariCake} alt="Safari cake" className="w-full h-full object-cover col-span-2 group-hover:scale-105 transition-transform duration-700" />
                      <img src={ginahCupcakes} alt="Safari cupcakes" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <img src={ginahCake} alt="Decorated cake" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  </div>
                  <div className="p-6 md:p-10 flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-primary/10 text-primary border-primary/20 font-bold uppercase tracking-wider">Day 4 · Thursday 9th July</Badge>
                      <img src={ginahLogo} alt="Ginah's Logo" className="h-12 object-contain" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-serif font-bold mb-2">Ginah's Bakery</h3>
                    <p className="text-muted-foreground mb-6 flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /> Lavington</p>
                    <ul className="space-y-2 grid sm:grid-cols-2 gap-x-4">
                      {["Cake making & decorating", "Cookie baking session", "Practical life skills", "Teamwork and creativity"].map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-foreground/80 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Day 5 */}
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={item}>
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow bg-white group">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-2/5 p-1 bg-slate-900 overflow-hidden">
                    <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden h-[260px] md:h-full md:min-h-[320px]">
                      <img src={centuryImax} alt="IMAX cinema" className="w-full h-full object-cover col-span-2 group-hover:scale-105 transition-transform duration-700" />
                      <img src={centuryOrange} alt="Cinema hall" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <img src={centuryConcession} alt="Concession stand" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  </div>
                  <div className="p-6 md:p-10 flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-accent/10 text-accent border-accent/20 font-bold uppercase tracking-wider">Day 5 · Friday 10th July</Badge>
                      <img src={cinemaxLogo} alt="Cinemax Logo" className="h-8 object-contain" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-serif font-bold mb-2">Movie Day – The Grand Finale</h3>
                    <p className="text-muted-foreground mb-6 flex items-center gap-1.5"><MapPin className="h-4 w-4 text-accent" /> Junction Mall</p>
                    <ul className="space-y-2 grid sm:grid-cols-2 gap-x-4">
                      {["Exclusive movie theatre experience", "3D animated film", "End-of-safari celebration", "Lasting memories made"].map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-foreground/80 text-sm">
                          <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" /> {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Photo Gallery ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.span variants={item} className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4 uppercase tracking-wide">
              Real Moments
            </motion.span>
            <motion.h2 variants={item} className="text-4xl font-serif font-bold text-foreground mb-4">
              Adventure in Pictures
            </motion.h2>
            <motion.p variants={item} className="text-muted-foreground max-w-xl mx-auto">
              A glimpse of the experiences waiting for your child.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
            {[
              { src: enankaPaintings, alt: "Art exhibition" },
              { src: pinsPlayground, alt: "Indoor playground" },
              { src: ginahSafariCake, alt: "Safari celebration cake" },
              { src: stedmakAerial, alt: "Adventure park" },
              { src: enankaPainting, alt: "Child painting" },
              { src: pinsBowling, alt: "Bowling lanes" },
              { src: ginahCupcakes, alt: "Safari cupcakes" },
              { src: centuryImax, alt: "IMAX cinema" },
              { src: stedmakPlayground, alt: "Outdoor playground" },
              { src: pinsSlides, alt: "Play slides" },
              { src: ginahCake, alt: "Decorated cake" },
              { src: centuryOrange, alt: "Cinema hall" },
              { src: stedmakNight, alt: "Gardens at night" },
              { src: centuryConcession, alt: "Cinema concession" },
            ].map(({ src, alt }, i) => (
              <motion.div
                key={i}
                variants={item}
                className="break-inside-avoid overflow-hidden rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer"
              >
                <img
                  src={src}
                  alt={alt}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-24 px-4 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <motion.span variants={item} className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4 uppercase tracking-wide">
                What's Included
              </motion.span>
              <motion.h2 variants={item} className="text-4xl font-serif font-bold text-foreground mb-6">
                Everything covered.<br />One simple price.
              </motion.h2>
              <motion.div variants={item} className="space-y-4">
                <div className="flex gap-4">
                  <div className="bg-amber-100 p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-bold">Assembly Point</h4>
                    <p className="text-muted-foreground text-sm">Outside Cavina School, Kilungu Road</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-amber-100 p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-bold">Daily Timings</h4>
                    <p className="text-muted-foreground text-sm">Reporting: 8:15 AM &nbsp;·&nbsp; Pick-Up: 3:00 PM</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-amber-100 p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0">
                    <Bus className="h-5 w-5 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-bold">Transport</h4>
                    <p className="text-muted-foreground text-sm">Safe, supervised transport to all venues.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-amber-100 p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0">
                    <Apple className="h-5 w-5 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-bold">Meals & Attire</h4>
                    <p className="text-muted-foreground text-sm">Lunch and water daily. Wear comfortable sporty clothing.</p>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div variants={item}>
              <Card className="bg-gradient-to-br from-secondary via-secondary to-secondary/95 border-0 text-white shadow-2xl">
                <CardContent className="p-8 md:p-10">
                  <h3 className="text-xl font-serif font-bold text-amber-100 mb-1">Safari Package</h3>
                  <div className="flex items-end gap-2 mb-6">
                    <span className="text-5xl md:text-6xl font-bold">KES 21,500</span>
                    <span className="text-amber-200/70 mb-2">/ child</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {[
                      "All entry fees and activities",
                      "Daily transport from assembly point",
                      "Lunch and drinking water daily",
                      "Professional supervision & care",
                      "Art materials and baking supplies",
                      "Group coordination & safe travel",
                    ].map((it, i) => (
                      <li key={i} className="flex items-center gap-3 text-white/90 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> {it}
                      </li>
                    ))}
                  </ul>
                  <div className="bg-white/10 rounded-xl p-4 mb-6 text-sm text-amber-100/80">
                    Full payment required to secure a slot. Spaces are strictly limited.
                  </div>
                  <Link href="/register">
                    <Button className="w-full h-12 text-base bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg">
                      Register & Secure My Spot <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Giving Back / Partnership ── */}
      <section className="py-24 px-4 bg-secondary text-white relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.span variants={item} className="inline-block py-1 px-3 rounded-full bg-primary/20 text-primary font-semibold text-sm mb-4 uppercase tracking-wide">
              Corporate Social Investment
            </motion.span>
            <motion.h2 variants={item} className="text-4xl md:text-5xl font-serif font-bold mb-4 text-white">
              Adventure with a Purpose
            </motion.h2>
            <motion.p variants={item} className="text-white/80 text-lg max-w-2xl mx-auto font-light">
              Young Tots Edventures is proud to partner with <span className="font-semibold text-primary">Goal4Initiative</span> as part of our Corporate Social Investment. <span className="font-semibold text-white">KES 1,000 from every child's registration fee</span> is donated directly to Goal4Initiative.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 gap-5 mb-12">
            {[
              { icon: Sparkles, t: "Early Childhood Development", d: "Supporting ECDE programmes for young learners." },
              { icon: Heart, t: "Learning for All", d: "Resources for children with disabilities." },
              { icon: Award, t: "Teacher Support", d: "Training and support for dedicated educators." },
              { icon: Users, t: "Better Environments", d: "Improved learning spaces for vulnerable learners." },
            ].map(({ icon: Icon, t, d }) => (
              <motion.div key={t} variants={item}>
                <div className="flex gap-4 items-start bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/15 h-full">
                  <div className="bg-primary/20 p-2.5 rounded-full shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">{t}</h4>
                    <p className="text-white/70 text-sm">{d}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Optional voluntary donation */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={item}>
            <div className="bg-white text-foreground rounded-3xl p-8 md:p-10 shadow-2xl max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-primary/10 p-2.5 rounded-full">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-2xl font-serif font-bold">Make an Optional Contribution</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Beyond your registration, you are warmly invited to make a voluntary contribution directly to Goal4Initiative. Every shilling helps a child learn and thrive.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
                  <p className="text-xs uppercase tracking-wide text-amber-700 font-semibold mb-1">M-PESA Paybill Number</p>
                  <p className="text-3xl font-bold text-amber-900">891300</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
                  <p className="text-xs uppercase tracking-wide text-amber-700 font-semibold mb-1">Account Number</p>
                  <p className="text-3xl font-bold text-amber-900">101531</p>
                </div>
              </div>
              <div className="flex gap-3 items-start bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                <p>For transparency and accountability, we kindly ask that you share your M-Pesa confirmation message with us after making a donation.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-4 bg-amber-50">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.span variants={item} className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4 uppercase tracking-wide">
              Parent Stories
            </motion.span>
            <motion.h2 variants={item} className="text-4xl font-serif font-bold text-foreground mb-4">
              What Families Are Saying
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "We'd love to hear from you after the safari! Testimonials from our first families coming soon.",
              },
              {
                quote: "Be part of Summer Safari 2026 and share your child's experience with other families.",
              },
              {
                quote: "Our first cohort of families will be sharing their stories in July 2026.",
              },
            ].map(({ quote }, i) => (
              <motion.div key={i} variants={item}>
                <Card className="h-full border-0 shadow-md hover:shadow-lg transition-shadow bg-white p-6">
                  <CardContent className="p-0 flex flex-col h-full gap-4 justify-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-foreground/70 text-sm leading-relaxed">{quote}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.span variants={item} className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4 uppercase tracking-wide">
              Got Questions?
            </motion.span>
            <motion.h2 variants={item} className="text-4xl font-serif font-bold text-foreground mb-4">
              Frequently Asked Questions
            </motion.h2>
            <motion.p variants={item} className="text-muted-foreground">
              Everything you need to know before registering.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div key={i} variants={item}>
                <FAQItem q={faq.q} a={faq.a} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={item} className="mt-10 text-center">
            <p className="text-muted-foreground mb-4">Still have questions? We're happy to help.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <a href="https://wa.me/254720764275?text=Hi%2C%20I%20have%20a%20question%20about%20Summer%20Safari%202026" target="_blank" rel="noreferrer">
                <Button variant="outline" className="gap-2 border-green-300 text-green-700 hover:bg-green-50">
                  <MessageCircle className="h-4 w-4" /> WhatsApp Judie
                </Button>
              </a>
              <a href="https://wa.me/254724810846?text=Hi%2C%20I%20have%20a%20question%20about%20Summer%20Safari%202026" target="_blank" rel="noreferrer">
                <Button variant="outline" className="gap-2 border-green-300 text-green-700 hover:bg-green-50">
                  <MessageCircle className="h-4 w-4" /> WhatsApp Celestine
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA / Contact ── */}
      <section id="contact" className="py-24 px-4 bg-primary text-primary-foreground text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-white">Ready for the adventure?</h2>
          <p className="text-xl mb-10 text-white/90 font-light max-w-xl mx-auto">
            Spaces are limited to just 30 children. Register now to secure your child's spot.
          </p>
          <Link href="/register">
            <Button size="lg" className="h-16 px-10 text-xl bg-white text-primary hover:bg-white/90 shadow-2xl hover:shadow-3xl transition-all mb-16 rounded-full font-bold hover:scale-105">
              Secure Your Child's Spot <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          <div className="bg-black/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto border border-white/20">
            <h3 className="font-serif text-2xl font-bold mb-2 text-white">Need Help? Contact Us</h3>
            <p className="text-white/70 text-sm mb-6">We're available via WhatsApp or phone.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { name: "Judie Wambua", phone: "0720 764 275", wa: "254720764275", tel: "0720764275" },
                { name: "Celestine Sabuti", phone: "0724 810 846", wa: "254724810846", tel: "0724810846" },
              ].map(({ name, phone, wa, tel }) => (
                <div key={name} className="bg-white text-foreground p-5 rounded-xl shadow-sm text-left">
                  <p className="font-bold text-base mb-1">{name}</p>
                  <p className="text-primary font-bold text-xl mb-4">{phone}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild className="flex-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                      <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">
                        <MessageCircle className="h-4 w-4 mr-1.5" /> WhatsApp
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="px-3">
                      <a href={`tel:${tel}`}><PhoneCall className="h-4 w-4" /></a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-center gap-2 text-white/90">
              <Mail className="h-4 w-4" />
              <a href="mailto:youngtotsedventures@gmail.com" className="font-medium hover:text-white underline-offset-4 hover:underline">
                youngtotsedventures@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-foreground text-background py-10 text-center text-sm">
        <div className="flex justify-center items-center gap-2 mb-3">
          <MapPin className="h-5 w-5 text-primary" />
          <span className="text-lg font-serif font-bold">Young Tots Edventures</span>
        </div>
        <p className="opacity-50 text-xs mb-1">youngtotsadventures.replit.app</p>
        <p className="opacity-50">&copy; 2026 Young Tots Edventures. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
