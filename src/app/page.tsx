import RoiCalculator from '@/components/roi-calculator';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-primary">
          ROI Optimizer
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
          Calculate your recruitment return on investment and discover potential savings with intervue.io.
        </p>
      </div>
      <RoiCalculator />
    </main>
  );
}
