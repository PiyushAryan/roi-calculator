import RoiCalculator from '@/components/roi-calculator';

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <main className="container mx-auto px-4 py-8 md:px-6 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-left mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              ROI Optimizer
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
              Discover your potential savings and efficiency gains with Intervue.io.
            </p>
          </div>
          
          <RoiCalculator />
        </div>
      </main>
    </div>
  );
}
