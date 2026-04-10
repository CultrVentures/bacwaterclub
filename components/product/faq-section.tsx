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
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Frequently asked
          </p>
          <h2 className="serif-heading mt-3 text-3xl text-foreground sm:text-4xl">
            Questions, answered honestly.
          </h2>
        </div>

        <Accordion type="single" collapsible className="mt-10 space-y-3">
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
