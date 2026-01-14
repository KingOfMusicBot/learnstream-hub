import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Are all courses really free?',
    answer: 'Yes! All our courses are 100% free. We believe quality education should be accessible to everyone. Our platform is supported by advertisements, which allows us to keep our content free.',
  },
  {
    question: 'Do I need any prior experience to start learning?',
    answer: 'Not at all! We offer courses for all skill levels, from complete beginners to advanced learners. Each course clearly indicates the required skill level, so you can find the perfect starting point.',
  },
  {
    question: 'How do I access the course videos?',
    answer: 'Simply create a free account and you\'ll have instant access to all course videos. You can watch them anytime, anywhere, on any device.',
  },
  {
    question: 'Do I get a certificate after completing a course?',
    answer: 'Yes! Upon completing a course, you\'ll receive a certificate of completion that you can add to your resume or LinkedIn profile to showcase your new skills.',
  },
  {
    question: 'Can I download the videos for offline viewing?',
    answer: 'Currently, our videos are available for streaming only. However, you can access them anytime as long as you have an internet connection.',
  },
  {
    question: 'How often is new content added?',
    answer: 'We regularly update our course library with new content. Our instructors are constantly creating new courses and updating existing ones to keep up with industry trends.',
  },
];

export function FAQSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Got questions? We've got answers.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
