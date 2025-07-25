import RoiCalculator from '@/components/roi-calculator';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <main className="container mx-auto px-4 py-8 md:px-6 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Image src="https://d2b1cooxpkirg1.cloudfront.net/publicAssets/intervue.svg" alt="Intervue.io Logo" width={72} height={72} className="mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Hiring cost calculator
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground">
              Estimate your current interview costs and see how much you could save with Intervue.io.
            </p>
          </div>
          
          <RoiCalculator />
        </div>
      </main>
    </div>
  );
}
