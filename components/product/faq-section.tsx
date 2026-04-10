import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PRODUCT } from "@/lib/product";

export function ProductFaqSection() {
  return (
    <section id="faq" className="section-spacing">
      <div className="container-shell max-w-3xl">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-primary">
            Frequently asked
          </p>
          <h2 className="serif-heading mt-4 text-3xl text-foreground sm:text-4xl lg:text-[2.75rem]">
            Questions, answered honestly.
          </h2>
        </div>

        <Accordion type="single" collapsible className="mt-12 space-y-4">
          {PRODUCT.faq.map((entry, index) => (
            <AccordionItem key={entry.question} value={`faq-${index}`}>
              <AccordionTrigger>{entry.question}</AccordionTrigger>
              <AccordionContent>{entry.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
