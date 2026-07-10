import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Quote, Linkedin, TrendingUp, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Autoplay from "embla-carousel-autoplay";
import { memo, useMemo } from "react";
import { LazyImage } from "./LazyImage";

// Import images statically but render lazily
import testimonialPriya from "@/assets/testimonial-priya.jpg";
import testimonialRavi from "@/assets/testimonial-ravi.jpg";
import testimonialAarti from "@/assets/testimonial-aarti.jpg";
import testimonialSandeep from "@/assets/testimonial-sandeep.jpg";
import testimonialPooja from "@/assets/testimonial-pooja.jpg";
import testimonialAmit from "@/assets/testimonial-amit.jpg";
import testimonialNeha from "@/assets/testimonial-neha.jpg";
import testimonialVikram from "@/assets/testimonial-vikram.jpg";
import testimonialSunita from "@/assets/testimonial-sunita.jpg";
import testimonialManish from "@/assets/testimonial-manish.jpg";
import testimonialKavita from "@/assets/testimonial-kavita.jpg";
import testimonialRajesh from "@/assets/testimonial-rajesh.jpg";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Business Development Associate",
    ctc: "₹4.20 LPA",
    beforeSalary: "₹0",
    location: "From a village near Alwar, Rajasthan • Working in Jaipur",
    image: testimonialPriya,
    hasLinkedIn: true,
    quote: "After my B.A., I had no idea what to do. UdaYantu gave me the confidence and the sales skills I needed. The mentors were amazing, they gave me so much courage. Now, I am financially independent and supporting my family. Yeh mere liye ek sapne jaisa hai."
  },
  {
    name: "Ravi Kumar",
    role: "Support Executive",
    ctc: "₹3.80 LPA",
    beforeSalary: "₹0",
    location: "From a village in Araria, Bihar • Working in Noida",
    image: testimonialRavi,
    hasLinkedIn: true,
    quote: "I always struggled with speaking English in interviews. The communication workshops and mock interviews at UdaYantu made all the difference. Ghar jaisa support mila. I never thought a boy from my village could work in a big company in Noida."
  },
  {
    name: "Aarti Singh",
    role: "Product Associate",
    ctc: "₹5.10 LPA",
    beforeSalary: "₹0",
    location: "From Bansi, Siddharth Nagar, U.P. • Working in Bangalore",
    image: testimonialAarti,
    hasLinkedIn: true,
    quote: "The best part was the hands-on training with real software like Jira. In college, we only learned theory. UdaYantu taught me practical skills that I use every day in my job. It felt like I was already working before I got the job!"
  },
  {
    name: "Sandeep Yadav",
    role: "Operations Associate",
    ctc: "₹4.00 LPA",
    beforeSalary: "₹0",
    location: "From a village near Gwalior, M.P. • Working in Indore",
    image: testimonialSandeep,
    hasLinkedIn: false,
    quote: "I had the degree but no direction. UdaYantu's assessment helped me understand that Operations was the right career for me. The training was tough but so worth it. The placement team worked so hard to get me this job. Main unka shukriya kaise ada karu?"
  },
  {
    name: "Pooja Verma",
    role: "HR Associate",
    ctc: "₹4.50 LPA",
    beforeSalary: "₹0",
    location: "From a village in Sitamarhi, Bihar • Working in Delhi",
    image: testimonialPooja,
    hasLinkedIn: true,
    quote: "Being the first girl in my family to move to a big city for a corporate job is a huge achievement. UdaYantu made it possible. Their 45-day post-placement support was a lifesaver when I felt lost in the new city and new job."
  },
  {
    name: "Amit Patel",
    role: "Project Associate",
    ctc: "₹4.80 LPA",
    beforeSalary: "₹0",
    location: "From a village near Churu, Rajasthan • Working in Mumbai",
    image: testimonialAmit,
    hasLinkedIn: true,
    quote: "I used to think only engineers could become project managers. UdaYantu broke that myth for me. The case studies from real companies were the best part. I learned how to manage timelines and talk to clients. Sab kuch practical tha, koi faltu ki theory nahi."
  },
  {
    name: "Neha Tiwari",
    role: "Marketing Associate",
    ctc: "₹3.90 LPA",
    beforeSalary: "₹0",
    location: "From a village in Gorakhpur, U.P. • Working in Lucknow",
    image: testimonialNeha,
    hasLinkedIn: false,
    quote: "My father was worried about the fees, but UdaYantu's 'pay-after-placement' model was a blessing. I only paid after I started earning. Now I am a marketing professional in Lucknow, close to my home. Thank you, UdaYantu team!"
  },
  {
    name: "Vikram Meena",
    role: "Business Development Associate",
    ctc: "₹4.60 LPA",
    beforeSalary: "₹0",
    location: "From a village near Dhaulpur, Rajasthan • Working in Delhi",
    image: testimonialVikram,
    hasLinkedIn: true,
    quote: "From farming to a business development role in Delhi, the journey seems unbelievable. UdaYantu didn't just teach me skills, they transformed my personality. The confidence I gained here is priceless. Bahut himmat mili."
  },
  {
    name: "Sunita Kumari",
    role: "Customer Support Executive",
    ctc: "₹4.10 LPA",
    beforeSalary: "₹0",
    location: "From a village in Rewa, M.P. • Working in Bangalore",
    image: testimonialSunita,
    hasLinkedIn: false,
    quote: "As a support executive, I talk to customers from all over the world. Pehle toh bilkul pata nahi tha ki yeh sab kaise hoga. UdaYantu's soft-skill training and communication practice helped me become confident and fluent. My manager is very happy with my performance."
  },
  {
    name: "Manish Gupta",
    role: "Product Associate",
    ctc: "₹5.20 LPA",
    beforeSalary: "₹0",
    location: "From Harriya, Basti, U.P. • Working in Noida",
    image: testimonialManish,
    hasLinkedIn: true,
    quote: "The AI-powered platform was very impressive. It gave me personalized feedback on my assignments instantly. The product management track was intense and perfectly aligned with what companies are looking for. Getting a job with a 5.2 LPA package was beyond my wildest dreams."
  },
  {
    name: "Kavita Choudhary",
    role: "Operations Analyst",
    ctc: "₹4.75 LPA",
    beforeSalary: "₹0",
    location: "From a village in Darbhanga, Bihar • Working in Mumbai",
    image: testimonialKavita,
    hasLinkedIn: true,
    quote: "Mumbai felt intimidating, but UdaYantu prepared me for it. The module on corporate culture and etiquette was so helpful. I understood how to behave in a professional environment. It's not just a course; it's a complete grooming program for village students like us."
  },
  {
    name: "Rajesh Singh",
    role: "Project Coordinator",
    ctc: "₹4.30 LPA",
    beforeSalary: "₹0",
    location: "From a village in Khalilabad, U.P. • Working in Jaipur",
    image: testimonialRajesh,
    hasLinkedIn: false,
    quote: "My B.Com degree wasn't enough to get a good job. I was frustrated. A friend told me about UdaYantu. Joining their Project Management course was the best decision of my life. Now I am working in a top company in Jaipur and making my parents proud."
  }
];

// Memoized testimonial card for better performance
const TestimonialCard = memo(({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) => (
  <CarouselItem className="pl-4 basis-full md:basis-1/2 lg:basis-1/2">
    <div className="h-full">
      <Card className="h-full border-2 border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg bg-card group">
        <CardContent className="p-6 md:p-8">
          {/* Quote icon with glow effect */}
          <div className="relative inline-block mb-4">
            <Quote className="w-10 h-10 text-primary/60 group-hover:text-primary transition-colors" />
            <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <p className="text-sm md:text-base italic text-foreground/85 mb-6 leading-relaxed line-clamp-5">
            "{testimonial.quote}"
          </p>
          
          {/* Salary Comparison Badge */}
          {testimonial.beforeSalary && (
            <div className="mb-5">
              <Badge className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15 px-3 py-1.5">
                <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                <span className="font-medium">{testimonial.beforeSalary} → {testimonial.ctc}</span>
              </Badge>
            </div>
          )}
          
          <div className="flex items-start gap-4 pt-5 border-t border-border">
            <div className="relative flex-shrink-0">
              <LazyImage 
                src={testimonial.image} 
                alt={`${testimonial.name} - ${testimonial.role}`}
                className="w-14 h-14 rounded-xl object-cover border-2 border-primary/20 shadow-md"
                placeholderClassName="w-14 h-14 rounded-xl"
              />
              {testimonial.hasLinkedIn && (
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-[#0A66C2] rounded-lg flex items-center justify-center border-2 border-background shadow-sm">
                  <Linkedin className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-base truncate">{testimonial.name}</p>
              <p className="text-sm text-primary font-medium">{testimonial.role} • {testimonial.ctc}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{testimonial.location}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </CarouselItem>
));

TestimonialCard.displayName = "TestimonialCard";

export const TestimonialsSection = memo(() => {
  // Memoize autoplay plugin to prevent re-creation on renders
  const autoplayPlugin = useMemo(() => 
    Autoplay({
      delay: 4000,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
    }), 
  []);

  return (
    <section className="py-20 md:py-24 bg-gradient-to-b from-muted via-muted to-background relative overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,hsl(var(--primary)/0.05)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--secondary)/0.05)_0%,transparent_50%)] pointer-events-none" />
      
      <div className="container px-4 mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <Badge variant="secondary" className="mb-4 text-sm font-semibold px-4 py-2">
            <Star className="w-4 h-4 mr-2 fill-current" />
            Real Success Stories
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            They Rose Up—<span className="text-primary">So Can You</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real students, real success stories from rural and Tier 3-4 backgrounds
          </p>
        </div>

        <Carousel 
          className="w-full max-w-6xl mx-auto"
          plugins={[autoplayPlugin]}
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-4">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={testimonial.name} testimonial={testimonial} index={index} />
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4 lg:-left-6 h-12 w-12 border-2 border-border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-lg" />
          <CarouselNext className="hidden md:flex -right-4 lg:-right-6 h-12 w-12 border-2 border-border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-lg" />
        </Carousel>
      </div>
    </section>
  );
});

TestimonialsSection.displayName = "TestimonialsSection";
