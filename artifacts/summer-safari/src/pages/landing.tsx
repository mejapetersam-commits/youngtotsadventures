import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, Calendar, Clock, Bus, Apple, PhoneCall, MessageCircle, ChevronRight, Check,
  CheckCircle2
} from "lucide-react";

// Real Images
import enankaLogo from "@assets/Enanka_art_gallery_logo_1781863628482.png";
import enankaGallery from "@assets/Enanka_art_gallery_1781863628482.webp";
import enankaClay from "@assets/Enanka__1781863628482.jpg";
import enankaArt from "@assets/Enanka_art_1781863628482.webp";

import pinsJungle from "@assets/kids_jungle_-_pins_1781863628483.webp";
import pinsLogo from "@assets/Pins_logo_1781863628483.jpg";

import stedmakLogo from "@assets/Stedmak_hotels_&_gardens_logo_1781863628483.jpg";
import stedmakFood from "@assets/Stedmak_food_1781863628483.jpg";
import stedmakLion from "@assets/Stedmak_zoo_1781863628484.jpg";
import stedmakLovebird from "@assets/Stedmak_zoo_2_1781863628483.jpg";
import stedmakCandy from "@assets/Stedmak_1781863628484.jpg";

import ginahLogo from "@assets/Ginah's_bakery_1781863628482.png";
import ginahCookies from "@assets/Ginah's_1781863628482.jpg";

import cinemaxLogo from "@assets/Cinemax_logo_1781863560866.png";
import cinemaxInterior from "@assets/Century_cinemax_1781863628481.jpg";

export default function Landing() {
  const stagger = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-background font-sans overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="text-xl font-serif font-bold text-foreground">Young Tots</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <a href="#schedule">Schedule</a>
            </Button>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90 text-white font-medium shadow-md">
                Register Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32 px-4 relative">
        <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-amber-100/50 to-transparent -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.span variants={item} className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 tracking-wide uppercase">
              Summer Safari 2026
            </motion.span>
            <motion.h1 variants={item} className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold text-foreground leading-tight mb-6">
              Adventure • Discovery <br className="hidden sm:block"/> Learning • Fun
            </motion.h1>
            <motion.p variants={item} className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto font-light">
              Give your child an unforgettable golden adventure in Nairobi. Five days, five exciting excursions.
            </motion.p>
            
            <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all">
                  Register Now <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto text-lg h-14 px-8 border-2">
                <a href="#schedule">View Activities</a>
              </Button>
            </motion.div>
            
            <motion.div variants={item} className="mt-12 flex flex-wrap justify-center gap-8 text-sm font-medium text-secondary">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-border">
                <Calendar className="h-4 w-4 text-primary" /> 6th – 10th July 2026
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-border">
                <MapPin className="h-4 w-4 text-primary" /> Nairobi, Kenya
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-border">
                <span className="text-primary font-bold">KSh</span> 21,500 / child
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-secondary text-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-amber-50">About The Safari</h2>
          <p className="text-lg md:text-xl leading-relaxed text-secondary-foreground/90 font-light">
            Get ready for an unforgettable Summer Safari filled with adventure, discovery, laughter, and endless fun. Our carefully designed 5-day experience combines exciting excursions, creative activities, and enriching experiences that inspire curiosity, build confidence, and create lasting friendships.
          </p>
        </div>
      </section>

      {/* Schedule Section */}
      <section id="schedule" className="py-24 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">5-Day Schedule</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Every day brings a new destination and a new adventure.</p>
          </div>

          <div className="space-y-12">
            {/* Day 1 */}
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={item}>
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-2/5 p-1 bg-amber-50">
                    <div className="grid grid-cols-2 grid-rows-2 h-full gap-1 rounded-tl-lg md:rounded-bl-lg overflow-hidden">
                      <img src={enankaGallery} alt="Gallery Setup" className="w-full h-full object-cover col-span-2 row-span-1 min-h-[150px]" />
                      <img src={enankaClay} alt="Clay Pottery" className="w-full h-full object-cover min-h-[120px]" />
                      <img src={enankaArt} alt="Art Studio" className="w-full h-full object-cover min-h-[120px]" />
                    </div>
                  </div>
                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-primary font-bold tracking-wider uppercase text-sm">Day 1 • Monday</span>
                      <img src={enankaLogo} alt="Enanka Logo" className="h-8 object-contain" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold mb-2">Enanka Art Gallery</h3>
                    <p className="text-muted-foreground mb-6 flex items-center gap-1.5"><MapPin className="h-4 w-4"/> Westlands</p>
                    <ul className="space-y-2">
                      {['Art exploration', 'Creativity and self-expression', 'Interactive exhibitions', 'Kenyan art and culture'].map((highlight, i) => (
                        <li key={i} className="flex items-start gap-2 text-foreground/80">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" /> <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Day 2 */}
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={item}>
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
                <div className="flex flex-col md:flex-row-reverse">
                  <div className="w-full md:w-2/5 h-64 md:h-auto bg-green-50">
                    <img src={pinsJungle} alt="Jungle Playground" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-accent font-bold tracking-wider uppercase text-sm">Day 2 • Tuesday</span>
                      <img src={pinsLogo} alt="Pins Logo" className="h-8 object-contain rounded" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold mb-2">The Jungle – Pins Entertainment</h3>
                    <p className="text-muted-foreground mb-6 flex items-center gap-1.5"><MapPin className="h-4 w-4"/> Sarit Centre</p>
                    <ul className="space-y-2">
                      {['Interactive games', 'Adventure activities', 'Team building', 'Fun challenges'].map((highlight, i) => (
                        <li key={i} className="flex items-start gap-2 text-foreground/80">
                          <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" /> <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Day 3 */}
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={item}>
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-2/5 p-1 bg-amber-50">
                    <div className="grid grid-cols-2 grid-rows-2 h-full gap-1 rounded-tl-lg md:rounded-bl-lg overflow-hidden">
                      <img src={stedmakLion} alt="Lion" className="w-full h-full object-cover min-h-[120px]" />
                      <img src={stedmakLovebird} alt="Lovebird" className="w-full h-full object-cover min-h-[120px]" />
                      <img src={stedmakFood} alt="Food" className="w-full h-full object-cover min-h-[120px]" />
                      <img src={stedmakCandy} alt="Candy" className="w-full h-full object-cover min-h-[120px]" />
                    </div>
                  </div>
                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-secondary font-bold tracking-wider uppercase text-sm">Day 3 • Wednesday</span>
                      <img src={stedmakLogo} alt="Stedmak Logo" className="h-10 object-contain" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold mb-2">Stedmak Gardens & Recreation</h3>
                    <p className="text-muted-foreground mb-6 flex items-center gap-1.5"><MapPin className="h-4 w-4"/> Karen</p>
                    <ul className="space-y-2">
                      {['Animal park tour', 'Train rides & Trampolines', 'Bouncing castles & Rock climbing', 'Floating restaurant experience'].map((highlight, i) => (
                        <li key={i} className="flex items-start gap-2 text-foreground/80">
                          <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" /> <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Day 4 */}
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={item}>
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
                <div className="flex flex-col md:flex-row-reverse">
                  <div className="w-full md:w-2/5 h-64 md:h-auto bg-amber-50/50 p-6 flex items-center justify-center">
                    <img src={ginahCookies} alt="Cookies" className="w-full h-full object-cover rounded-lg shadow-sm" />
                  </div>
                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-primary font-bold tracking-wider uppercase text-sm">Day 4 • Thursday</span>
                      <img src={ginahLogo} alt="Ginah's Bakery Logo" className="h-12 object-contain" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold mb-2">Ginah's Bakery</h3>
                    <p className="text-muted-foreground mb-6 flex items-center gap-1.5"><MapPin className="h-4 w-4"/> Lavington</p>
                    <ul className="space-y-2">
                      {['Cake making & Cookie baking', 'Decorating activities', 'Practical life skills', 'Teamwork and creativity'].map((highlight, i) => (
                        <li key={i} className="flex items-start gap-2 text-foreground/80">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" /> <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Day 5 */}
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={item}>
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-2/5 h-64 md:h-auto bg-slate-900">
                    <img src={cinemaxInterior} alt="Cinema Interior" className="w-full h-full object-cover opacity-80" />
                  </div>
                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-accent font-bold tracking-wider uppercase text-sm">Day 5 • Friday</span>
                      <img src={cinemaxLogo} alt="Cinemax Logo" className="h-8 object-contain" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold mb-2">Movie Day</h3>
                    <p className="text-muted-foreground mb-6 flex items-center gap-1.5"><MapPin className="h-4 w-4"/> Junction Mall</p>
                    <ul className="space-y-2">
                      {['Exclusive movie theatre experience', '3D animated movie', 'End-of-safari celebration'].map((highlight, i) => (
                        <li key={i} className="flex items-start gap-2 text-foreground/80">
                          <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" /> <span>{highlight}</span>
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

      {/* Info & Pricing Section */}
      <section className="py-24 px-4 bg-white relative">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          
          <div>
            <h2 className="text-3xl font-serif font-bold mb-8 text-foreground">Important Information</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="mt-1 bg-amber-100 p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Assembly Point</h4>
                  <p className="text-muted-foreground">Outside Cavina School, Kilungu Road</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 bg-amber-100 p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Timings (Daily)</h4>
                  <p className="text-muted-foreground">Reporting: 8:15 AM<br/>Pick-Up: 3:00 PM</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 bg-amber-100 p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0">
                  <Bus className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Transport</h4>
                  <p className="text-muted-foreground">Safe, supervised transport provided to all venues from the assembly point.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 bg-amber-100 p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0">
                  <Apple className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Meals & Attire</h4>
                  <p className="text-muted-foreground">Lunch and water provided daily. Children should carry a light snack and wear comfortable sporty clothing.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Card className="bg-gradient-to-br from-secondary to-secondary/90 border-0 text-white shadow-xl h-full flex flex-col">
              <CardContent className="p-8 flex flex-col h-full">
                <h3 className="text-2xl font-serif font-bold text-amber-100 mb-2">Safari Package</h3>
                <div className="text-5xl font-bold mb-6">KSh 21,500 <span className="text-lg font-normal text-amber-100/80">/ child</span></div>
                
                <div className="space-y-3 mb-8 flex-1">
                  <p className="text-amber-50 border-b border-white/10 pb-3 font-medium">What's Included:</p>
                  <ul className="space-y-3">
                    {['All entry fees and activities', 'Daily transport from assembly point', 'Lunch and drinking water', 'Professional supervision and care', 'Art materials and baking supplies'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-white/90 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                  <p className="text-sm text-amber-50 mb-1">Full payment is required to secure a slot.</p>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </section>

      {/* CTA / Contact Section */}
      <section className="py-24 px-4 bg-primary text-primary-foreground text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10" 
             style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}></div>
        
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-white">Ready for the adventure?</h2>
          <p className="text-xl mb-10 text-white/90 font-light max-w-xl mx-auto">Spaces are limited to ensure every child gets the best experience.</p>
          
          <Link href="/register">
            <Button size="lg" className="h-16 px-10 text-xl bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all mb-16 rounded-full font-bold">
              Secure Your Child's Spot
            </Button>
          </Link>

          <div className="bg-black/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto border border-white/20">
            <h3 className="font-serif text-2xl font-bold mb-6 text-white">Need help? Contact Us</h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white text-foreground p-4 rounded-xl shadow-sm text-left">
                <p className="font-bold text-lg mb-1">Judie Wambua</p>
                <p className="text-primary font-bold text-xl mb-4">0720 764 275</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800">
                    <a href="https://wa.me/254720764275" target="_blank" rel="noreferrer">
                      <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="px-3">
                    <a href="tel:0720764275"><PhoneCall className="h-4 w-4" /></a>
                  </Button>
                </div>
              </div>
              
              <div className="bg-white text-foreground p-4 rounded-xl shadow-sm text-left">
                <p className="font-bold text-lg mb-1">Celestine Sabuti</p>
                <p className="text-primary font-bold text-xl mb-4">0724 810 846</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800">
                    <a href="https://wa.me/254724810846" target="_blank" rel="noreferrer">
                      <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="px-3">
                    <a href="tel:0724810846"><PhoneCall className="h-4 w-4" /></a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-8 text-center text-sm">
        <div className="flex justify-center items-center gap-2 mb-4 opacity-80">
          <MapPin className="h-5 w-5" />
          <span className="text-lg font-serif font-bold">Young Tots Edventures</span>
        </div>
        <p className="opacity-60">&copy; 2026 Young Tots Edventures. All rights reserved.</p>
        <Link href="/admin" className="inline-block mt-4 opacity-40 hover:opacity-100 transition-opacity">Admin Login</Link>
      </footer>
    </div>
  );
}
