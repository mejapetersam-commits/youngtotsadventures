import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { format } from "date-fns";
import { Star, Heart, Loader2, PenLine, CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListPublicReviews,
  useCreateReview,
  getListPublicReviewsQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function Stars({ rating, className = "h-4 w-4" }: { rating: number; className?: string }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${className} ${n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  const { data } = useListPublicReviews();
  const queryClient = useQueryClient();
  const createReview = useCreateReview();

  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — hidden from real users
  const [formError, setFormError] = useState<string | null>(null);

  const reviews = data?.reviews ?? [];

  const resetForm = () => {
    setName("");
    setEmail("");
    setRating(0);
    setHoverRating(0);
    setReview("");
    setWebsite("");
    setFormError(null);
    setSubmitted(false);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (name.trim().length < 2) return setFormError("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setFormError("Please enter a valid email address.");
    if (rating < 1) return setFormError("Please select a star rating.");
    if (review.trim().length < 10) return setFormError("Please write at least a short sentence about your experience.");

    try {
      await createReview.mutateAsync({
        data: { name: name.trim(), email: email.trim(), rating, review: review.trim(), website },
      });
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: getListPublicReviewsQueryKey() });
    } catch (err) {
      const message =
        err && typeof err === "object" && "error" in err && typeof (err as { error: unknown }).error === "string"
          ? (err as { error: string }).error
          : "Something went wrong. Please try again.";
      setFormError(message);
    }
  };

  const jsonLd =
    reviews.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "Event",
          name: "Young Tots Edventures – Summer Safari 2026",
          startDate: "2026-07-06",
          endDate: "2026-07-10",
          location: { "@type": "Place", name: "Nairobi, Kenya" },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1),
            reviewCount: reviews.length,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : null;

  return (
    <section id="reviews" className="py-24 px-4 bg-amber-50">
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <div className="max-w-5xl mx-auto">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
          <motion.span variants={item} className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4 uppercase tracking-wide">
            Parent Reviews &amp; Testimonials
          </motion.span>
          <motion.h2 variants={item} className="text-4xl font-serif font-bold text-foreground mb-4">
            What Families Are Saying
          </motion.h2>
          <motion.p variants={item} className="text-muted-foreground max-w-2xl mx-auto">
            Real experiences from parents whose children have joined our adventures.
          </motion.p>
        </motion.div>

        {reviews.length === 0 ? (
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              "We'd love to hear from you after the safari! Testimonials from our first families coming soon.",
              "Be part of Summer Safari 2026 and share your child's experience with other families.",
              "Our first cohort of families will be sharing their stories in July 2026.",
            ].map((quote, i) => (
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
        ) : (
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
            {reviews.map((r) => (
              <motion.div key={r.id} variants={item}>
                <Card className="h-full border-0 shadow-md hover:shadow-lg transition-shadow bg-white p-6">
                  <CardContent className="p-0 flex flex-col h-full gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0" aria-hidden="true">
                        <span className="text-primary font-bold text-sm">{initials(r.name)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(r.createdAt), "MMMM d, yyyy")}</p>
                      </div>
                    </div>
                    <Stars rating={r.rating} />
                    <p className="text-foreground/70 text-sm leading-relaxed flex-1">{r.review}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={item} className="text-center">
          <Button
            size="lg"
            onClick={() => setOpen(true)}
            className="gap-2 rounded-full px-8 font-bold shadow-lg hover:scale-105 transition-all"
          >
            <PenLine className="h-4 w-4" /> Leave a Review
          </Button>
        </motion.div>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          {submitted ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="font-serif text-2xl mb-2">Thank You!</DialogTitle>
              <DialogDescription className="text-base">
                Your review has been submitted and will appear on the website once it has been approved by our team.
              </DialogDescription>
              <Button className="mt-6 rounded-full px-8" onClick={() => handleOpenChange(false)}>
                Done
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">Leave a Review</DialogTitle>
                <DialogDescription>
                  Share your family's experience with Young Tots Edventures. Reviews are published after approval.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="review-name">Your Name</Label>
                  <Input
                    id="review-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jane Wanjiku"
                    maxLength={100}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="review-email">Email</Label>
                  <Input
                    id="review-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    maxLength={200}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Your email will never be shown publicly.</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Rating</Label>
                  <div className="flex gap-1" role="radiogroup" aria-label="Star rating">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={rating === n}
                        aria-label={`${n} star${n > 1 ? "s" : ""}`}
                        onClick={() => setRating(n)}
                        onMouseEnter={() => setHoverRating(n)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 rounded focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        <Star
                          className={`h-7 w-7 transition-colors ${
                            n <= (hoverRating || rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="review-text">Your Review</Label>
                  <Textarea
                    id="review-text"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Tell other parents about your child's experience..."
                    rows={4}
                    maxLength={1000}
                    required
                  />
                  <p className="text-xs text-muted-foreground text-right">{review.length}/1000</p>
                </div>
                {/* Honeypot — hidden from humans, bots tend to fill it */}
                <div className="absolute -left-[9999px] top-auto" aria-hidden="true">
                  <label htmlFor="review-website">Website</label>
                  <input
                    id="review-website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
                {formError && (
                  <p className="text-sm text-destructive" role="alert">{formError}</p>
                )}
                <Button
                  type="submit"
                  disabled={createReview.isPending}
                  className="w-full rounded-full font-bold gap-2"
                >
                  {createReview.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Submit Review
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
